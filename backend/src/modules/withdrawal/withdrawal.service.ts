import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestWithdrawalDto } from './dto/request-withdrawal.dto';

@Injectable()
export class WithdrawalService {
  private readonly logger = new Logger(WithdrawalService.name);

  // Fee penarikan fixed 3% sesuai aturan bisnis (PRD.md & skill.md)
  readonly WITHDRAWAL_FEE_PERCENT = 3.0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  // =======================================================================
  // 1. AJUKAN PENARIKAN (POST /withdrawals)
  // Potongan tepat 3%. Saldo langsung terpotong di ledger saat request dibuat.
  // =======================================================================
  async requestWithdrawal(userId: string, dto: RequestWithdrawalDto) {
    const tokenPrice = this.configService.get<number>('TOKEN_PRICE_IDR', 1000);

    const result = await this.prisma.$transaction(async (tx) => {
      // Ambil wallet user
      let wallet = await tx.tokenWallet.findUnique({ where: { userId } });
      if (!wallet) {
        wallet = await tx.tokenWallet.create({ data: { userId } });
      }

      // Hitung saldo riil dari SUM ledger
      const agg = await tx.tokenTransaction.aggregate({
        where: { walletId: wallet.id },
        _sum: { amount: true },
      });
      const currentBalance = agg._sum.amount ?? 0;

      if (currentBalance < dto.token_amount) {
        throw new BadRequestException(
          `Saldo token tidak cukup. Saldo saat ini: ${currentBalance} token, diminta: ${dto.token_amount} token`,
        );
      }

      // Hitung rincian finansial (potongan 3%)
      const grossAmountIdr = dto.token_amount * tokenPrice;
      const feeAmountIdr = (grossAmountIdr * this.WITHDRAWAL_FEE_PERCENT) / 100;
      const netAmountIdr = grossAmountIdr - feeAmountIdr;

      // Deduct token dari wallet langsung saat request dibuat (mencegah request ganda)
      await tx.tokenTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'withdrawal',
          amount: -dto.token_amount, // negatif = saldo berkurang seketika
          idempotencyKey: `wd-req-${userId}-${Date.now()}`,
        },
      });

      // Buat record withdrawal
      const withdrawal = await tx.withdrawal.create({
        data: {
          userId,
          tokenAmount: dto.token_amount,
          feePercentage: this.WITHDRAWAL_FEE_PERCENT,
          netAmountIdr,
          status: 'requested',
        },
      });

      return {
        withdrawal,
        grossAmountIdr,
        feeAmountIdr,
        netAmountIdr,
        remainingBalance: currentBalance - dto.token_amount,
      };
    });

    this.logger.log(
      `[Withdrawal] Request diajukan: userId=${userId}, tokens=${dto.token_amount}, netIdr=${result.netAmountIdr}`,
    );

    return {
      withdrawal_id: result.withdrawal.id,
      token_amount: result.withdrawal.tokenAmount,
      gross_amount_idr: result.grossAmountIdr,
      fee_percentage: this.WITHDRAWAL_FEE_PERCENT,
      fee_amount_idr: result.feeAmountIdr,
      net_amount_idr: result.netAmountIdr,
      status: result.withdrawal.status,
      remaining_token_balance: result.remainingBalance,
      message: `Permintaan penarikan ${dto.token_amount} token (Rp${result.netAmountIdr.toLocaleString('id-ID')}) berhasil diajukan. Menunggu persetujuan Admin Finance.`,
    };
  }

  // =======================================================================
  // 2. RIWAYAT PENARIKAN USER (GET /withdrawals)
  // =======================================================================
  async getUserWithdrawals(userId: string) {
    const list = await this.prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      total: list.length,
      data: list.map((w) => ({
        id: w.id,
        token_amount: w.tokenAmount,
        net_amount_idr: Number(w.netAmountIdr),
        fee_percentage: Number(w.feePercentage),
        status: w.status,
        created_at: w.createdAt,
        processed_at: w.processedAt,
      })),
    };
  }

  // =======================================================================
  // 3. APPROVE PENARIKAN (POST /admin/withdrawals/:id/approve)
  // Admin Finance memproses pencairan ke payment gateway (disbursement).
  // Jika gagal di gateway -> status 'failed' & saldo token dikembalikan (REFUND).
  // =======================================================================
  async approveWithdrawal(
    adminUserId: string,
    withdrawalId: string,
    simulateGatewayFailure = false, // untuk keperluan testing skenario kegagalan gateway
  ) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: { include: { tokenWallet: true } } },
    });

    if (!withdrawal) throw new NotFoundException('Data penarikan tidak ditemukan');
    if (withdrawal.status !== 'requested') {
      throw new BadRequestException(
        `Penarikan tidak dapat diproses karena berstatus: ${withdrawal.status}`,
      );
    }

    const now = new Date();

    if (simulateGatewayFailure) {
      // Skenario: Payment gateway disbursement gagal
      this.logger.warn(`[Withdrawal] Gateway gagal untuk penarikan ${withdrawalId}. Me-refund token ke wallet.`);

      await this.prisma.$transaction(async (tx) => {
        // Update status withdrawal -> failed
        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: { status: 'failed', processedAt: now },
        });

        // Refund token kembali ke user wallet di ledger
        const wallet = withdrawal.user.tokenWallet;
        if (wallet) {
          await tx.tokenTransaction.create({
            data: {
              walletId: wallet.id,
              type: 'refund',
              amount: withdrawal.tokenAmount, // amount positif = saldo kembali
              idempotencyKey: `wd-fail-refund-${withdrawalId}`,
            },
          });
        }
      });

      return {
        withdrawal_id: withdrawalId,
        status: 'failed',
        refunded_tokens: withdrawal.tokenAmount,
        message: 'Pencairan ke gateway gagal. Saldo token telah dikembalikan ke wallet pengguna.',
      };
    }

    // Skenario: Sukses dicairkan ke payment gateway
    const providerRef = `DISB-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const updated = await this.prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: 'completed',
        approvedBy: adminUserId,
        paymentProviderRef: providerRef,
        processedAt: now,
      },
    });

    this.logger.log(`[Withdrawal] Sukses dicairkan: id=${withdrawalId}, providerRef=${providerRef}`);

    return {
      withdrawal_id: updated.id,
      status: updated.status,
      payment_provider_ref: updated.paymentProviderRef,
      net_amount_idr: Number(updated.netAmountIdr),
      processed_at: updated.processedAt,
      message: 'Penarikan berhasil disetujui dan dicairkan ke rekening pengguna.',
    };
  }
}
