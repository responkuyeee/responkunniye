import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { TopupDto } from './dto/topup.dto';
import { ConsumeTokenDto, RefundTokenDto, ReserveTokenDto } from './dto/wallet-ops.dto';

// Tipe transaksi dalam ledger (append-only)
export type TxType = 'topup' | 'reserve' | 'consume' | 'refund' | 'withdrawal';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  // Nilai ini dari env config, bukan hardcoded
  private get REWARD_RESPONDENT_PERCENT(): number {
    return this.configService.get<number>('REWARD_SPLIT_RESPONDENT_PERCENT', 80);
  }
  private get REWARD_PLATFORM_PERCENT(): number {
    return this.configService.get<number>('REWARD_SPLIT_PLATFORM_PERCENT', 20);
  }
  private get MIN_RESPONDENT(): number {
    return this.configService.get<number>('MIN_RESPONDENT_PER_RESEARCH', 50);
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  // =======================================================================
  // HITUNG SALDO — Saldo SELALU dari SUM ledger, TIDAK PERNAH dari kolom cache
  // =======================================================================
  async getBalance(userId: string): Promise<{ balance_token: number; balance_idr_equivalent: number }> {
    const wallet = await this.getOrCreateWallet(userId);

    const result = await this.prisma.tokenTransaction.aggregate({
      where: { walletId: wallet.id },
      _sum: { amount: true },
    });

    const balance_token = result._sum.amount ?? 0;
    const tokenPriceIdr = this.configService.get<number>('TOKEN_PRICE_IDR', 1000);

    return {
      balance_token,
      balance_idr_equivalent: balance_token * tokenPriceIdr,
    };
  }

  // =======================================================================
  // RIWAYAT TRANSAKSI
  // =======================================================================
  async getTransactions(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);

    const transactions = await this.prisma.tokenTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        type: true,
        amount: true,
        idempotencyKey: true,
        createdAt: true,
        researchId: true,
        participationId: true,
      },
    });

    return { transactions };
  }

  // =======================================================================
  // TOP-UP — Idempotent: idempotency_key sama → kembalikan transaksi lama
  // =======================================================================
  async initTopup(userId: string, dto: TopupDto): Promise<object> {
    // Cek idempotency: topup dengan key yang sama sudah ada?
    const existing = await this.prisma.tokenTransaction.findFirst({
      where: { idempotencyKey: dto.idempotency_key },
    });
    if (existing) {
      this.logger.log(`[Topup] Idempotent hit: key=${dto.idempotency_key} → return existing tx`);
      return {
        idempotent: true,
        message: 'Topup dengan idempotency key ini sudah diproses sebelumnya',
        transaction_id: existing.id,
        amount_token: Math.abs(existing.amount),
      };
    }

    // Buat record di tabel payments (mock: langsung success untuk dev tanpa gateway live)
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        type: 'topup',
        provider: this.configService.get<string>('PAYMENT_PROVIDER', 'midtrans'),
        amountIdr: dto.amount_token * this.configService.get<number>('TOKEN_PRICE_IDR', 1000),
        status: 'pending',
        idempotencyKey: dto.idempotency_key,
      },
    });

    this.logger.log(`[Topup] Payment record created: paymentId=${payment.id}, method=${dto.payment_method}`);

    return {
      idempotent: false,
      message: 'Instruksi pembayaran dibuat. Selesaikan pembayaran untuk menambahkan token ke wallet.',
      payment_id: payment.id,
      amount_token: dto.amount_token,
      amount_idr: payment.amountIdr,
      payment_method: dto.payment_method,
      status: 'pending',
    };
  }

  // =======================================================================
  // WEBHOOK HANDLER — Dipanggil oleh payment gateway setelah pembayaran berhasil
  // Idempotent: signature harus valid, payment_id harus ada, status harus pending
  // =======================================================================
  async handlePaymentWebhook(rawPayload: any, signature: string): Promise<{ processed: boolean; message: string }> {
    // Verifikasi signature payment gateway
    const isValid = this.verifyWebhookSignature(rawPayload, signature);
    if (!isValid) {
      this.logger.warn('[Webhook] Signature tidak valid — abaikan request');
      return { processed: false, message: 'Signature tidak valid' };
    }

    const { payment_id, status, provider_ref } = rawPayload;

    const payment = await this.prisma.payment.findUnique({
      where: { id: payment_id },
      include: { user: { include: { tokenWallet: true } } },
    });

    if (!payment) {
      this.logger.warn(`[Webhook] Payment tidak ditemukan: paymentId=${payment_id}`);
      return { processed: false, message: 'Payment tidak ditemukan' };
    }

    // Idempotency: jika sudah diproses sebelumnya, kembalikan sukses tanpa duplikasi
    if (payment.status === 'success') {
      this.logger.log(`[Webhook] Idempotent: paymentId=${payment_id} sudah sukses sebelumnya`);
      return { processed: true, message: 'Sudah diproses sebelumnya' };
    }

    if (status !== 'success') {
      await this.prisma.payment.update({ where: { id: payment_id }, data: { status: 'failed' } });
      return { processed: true, message: 'Pembayaran gagal, status diperbarui' };
    }

    // Kreditkan token ke wallet pengguna dalam satu transaksi DB atomik
    const amountToken = Math.floor(
      Number(payment.amountIdr) / this.configService.get<number>('TOKEN_PRICE_IDR', 1000),
    );


    const wallet = payment.user.tokenWallet;
    if (!wallet) throw new NotFoundException('Wallet pengguna tidak ditemukan');

    await this.prisma.$transaction(async (tx) => {
      // UPDATE status payment
      await tx.payment.update({
        where: { id: payment_id },
        data: { status: 'success', providerRef: provider_ref ?? null },
      });

      // INSERT baris baru di ledger token (TIDAK pernah UPDATE baris lama)
      await tx.tokenTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'topup',
          amount: amountToken,
          idempotencyKey: payment.idempotencyKey,
        },
      });
    });

    this.logger.log(`[Webhook] Topup sukses: userId=${payment.userId}, +${amountToken} token`);
    return { processed: true, message: `${amountToken} token berhasil ditambahkan ke wallet` };
  }

  // =======================================================================
  // RESERVE TOKEN — Dipanggil saat publish research
  // Pakai row-level locking untuk mencegah race condition (SELECT FOR UPDATE)
  // =======================================================================
  async reserveTokens(userId: string, dto: ReserveTokenDto): Promise<{ reserved: number; remaining_balance: number }> {
    if (dto.amount < this.MIN_RESPONDENT) {
      throw new BadRequestException(
        `Jumlah token yang di-reserve minimal ${this.MIN_RESPONDENT} (sama dengan minimum target responden)`,
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Ambil wallet dan kunci baris untuk mencegah race condition
      const wallet = await tx.tokenWallet.findUnique({
        where: { userId },
      });

      if (!wallet) throw new NotFoundException('Wallet pengguna tidak ditemukan');

      // Hitung saldo dari ledger menggunakan raw query untuk mendapatkan row-level lock
      const balanceResult = await tx.$queryRaw<[{ balance: number }]>`
        SELECT COALESCE(SUM(amount), 0)::integer AS balance
        FROM token_transactions
        WHERE wallet_id = ${wallet.id}::uuid
        FOR UPDATE
      `;

      const currentBalance = Number(balanceResult[0]?.balance ?? 0);

      if (currentBalance < dto.amount) {
        throw new BadRequestException(
          `Saldo token tidak cukup. Saldo saat ini: ${currentBalance} token, dibutuhkan: ${dto.amount} token`,
        );
      }

      // Buat transaksi RESERVE — amount NEGATIF karena token keluar dari wallet bebas
      await tx.tokenTransaction.create({
        data: {
          walletId: wallet.id,
          researchId: dto.research_id,
          type: 'reserve',
          amount: -dto.amount, // negatif = balance berkurang
        },
      });

      return { reserved: dto.amount, remaining_balance: currentBalance - dto.amount };
    });

    this.logger.log(
      `[Reserve] userId=${userId}, researchId=${dto.research_id}, reserved=${dto.amount}, remaining=${result.remaining_balance}`,
    );
    return result;
  }

  // =======================================================================
  // CONSUME TOKEN — Dipanggil HANYA ketika participation.status = Approved
  // Split reward: 80% ke Respondent, 20% ke Platform. Idempotent.
  // =======================================================================
  async consumeToken(researcherUserId: string, dto: ConsumeTokenDto): Promise<{
    respondent_amount: number;
    platform_amount: number;
  }> {
    // Idempotency: cegah double-consume untuk participation yang sama
    const existingConsume = await this.prisma.tokenTransaction.findFirst({
      where: {
        idempotencyKey: dto.idempotency_key,
        type: 'consume',
      },
    });

    if (existingConsume) {
      this.logger.log(`[Consume] Idempotent: key=${dto.idempotency_key} sudah diproses`);
      return {
        respondent_amount: Math.round((this.REWARD_RESPONDENT_PERCENT / 100) * dto.amount * 10) / 10,
        platform_amount: Math.round((this.REWARD_PLATFORM_PERCENT / 100) * dto.amount * 10) / 10,
      };
    }

    const respondentAmount = Math.round((this.REWARD_RESPONDENT_PERCENT / 100) * dto.amount * 10) / 10;
    const platformAmount = Math.round((this.REWARD_PLATFORM_PERCENT / 100) * dto.amount * 10) / 10;

    await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.tokenWallet.findUnique({ where: { userId: researcherUserId } });
      if (!wallet) throw new NotFoundException('Wallet peneliti tidak ditemukan');

      // Consume = token terpakai dari pool reserved → INSERT baris baru
      await tx.tokenTransaction.create({
        data: {
          walletId: wallet.id,
          researchId: dto.research_id,
          participationId: dto.participation_id,
          type: 'consume',
          amount: -dto.amount,
          idempotencyKey: dto.idempotency_key,
        },
      });
    });

    this.logger.log(
      `[Consume] researchId=${dto.research_id}, participationId=${dto.participation_id}, respondent=${respondentAmount}, platform=${platformAmount}`,
    );
    return { respondent_amount: respondentAmount, platform_amount: platformAmount };
  }

  // =======================================================================
  // REFUND TOKEN — Dipanggil saat research dibatalkan atau expired
  // Hanya refund sisa yang belum ter-consume. Idempotent.
  // =======================================================================
  async refundTokens(userId: string, dto: RefundTokenDto): Promise<{ refunded: number }> {
    // Idempotency check
    const existingRefund = await this.prisma.tokenTransaction.findFirst({
      where: {
        idempotencyKey: dto.idempotency_key,
        type: 'refund',
      },
    });

    if (existingRefund) {
      this.logger.log(`[Refund] Idempotent: key=${dto.idempotency_key}`);
      return { refunded: dto.amount };
    }

    await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.tokenWallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundException('Wallet pengguna tidak ditemukan');

      // Refund = amount POSITIF karena token dikembalikan ke wallet bebas
      await tx.tokenTransaction.create({
        data: {
          walletId: wallet.id,
          researchId: dto.research_id,
          type: 'refund',
          amount: dto.amount,
          idempotencyKey: dto.idempotency_key,
        },
      });
    });

    this.logger.log(`[Refund] userId=${userId}, researchId=${dto.research_id}, refunded=${dto.amount}`);
    return { refunded: dto.amount };
  }

  // =======================================================================
  // PRIVATE HELPERS
  // =======================================================================
  private async getOrCreateWallet(userId: string) {
    const wallet = await this.prisma.tokenWallet.findUnique({ where: { userId } });
    if (!wallet) {
      return this.prisma.tokenWallet.create({ data: { userId } });
    }
    return wallet;
  }

  /**
   * Verifikasi signature webhook payment gateway.
   * Untuk production: implementasi HMAC-SHA256 sesuai dokumentasi Midtrans/Xendit.
   * Untuk dev sandbox: selalu valid jika signature tidak kosong.
   */
  private verifyWebhookSignature(payload: any, signature: string): boolean {
    const isProduction = this.configService.get<string>('PAYMENT_IS_PRODUCTION', 'false') === 'true';

    if (!isProduction) {
      // Mode dev/sandbox: asumsikan valid selama header ada
      return signature !== undefined && signature !== '';
    }

    // TODO: Implementasi HMAC-SHA256 sesuai provider (Midtrans/Xendit) di sini
    // const webhookSecret = this.configService.get<string>('PAYMENT_WEBHOOK_SECRET');
    // const expectedSig = crypto.createHmac('sha256', webhookSecret)
    //   .update(JSON.stringify(payload)).digest('hex');
    // return signature === expectedSig;

    this.logger.warn('[Webhook] verifyWebhookSignature production belum diimplementasikan');
    return false;
  }
}
