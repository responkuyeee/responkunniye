import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class TokenExpiryJob {
  private readonly logger = new Logger(TokenExpiryJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Cron job harian tengah malam untuk memeriksa inaktivitas akun:
   * 1. H-15 (75 hari idle): Notifikasi peringatan pertama
   * 2. H-5  (85 hari idle): Notifikasi peringatan kedua
   * 3. H-1  (89 hari idle): Notifikasi peringatan terakhir
   * 4. >= 90 hari (3 bulan idle):
   *    - Saldo token hangus dicatat di ledger (type: 'expire')
   *    - Data sensitif GPS dihapus otomatis (sesuai SECURITY.md)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyCron() {
    this.logger.log('[TokenExpiryJob] Memulai pemeriksaan akun idle harian...');
    await this.processIdleAccountsAndExpiry(new Date());
  }

  /**
   * Memproses akun idle berdasarkan tanggal acuan (targetDate)
   */
  async processIdleAccountsAndExpiry(now: Date = new Date()) {
    let expiredCount = 0;
    let warnedCount = 0;

    // Helper untuk membuat range jendela 1 hari
    const getDayRange = (daysAgo: number) => {
      const target = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const start = new Date(target);
      start.setHours(0, 0, 0, 0);
      const end = new Date(target);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    };

    // =======================================================================
    // 1. Eksekusi Token Hangus & Penghapusan GPS (>= 90 hari idle)
    // =======================================================================
    const threshold90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const expiredUsers = await this.prisma.user.findMany({
      where: {
        lastActiveAt: { lte: threshold90Days },
        status: 'active',
      },
      include: {
        tokenWallet: true,
      },
    });

    for (const user of expiredUsers) {
      if (!user.tokenWallet) continue;

      // Hitung saldo riil dari SUM transaksi di ledger
      const agg = await this.prisma.tokenTransaction.aggregate({
        where: { walletId: user.tokenWallet.id },
        _sum: { amount: true },
      });
      const currentBalance = agg._sum.amount ?? 0;

      if (currentBalance > 0) {
        const todayStr = now.toISOString().slice(0, 10);
        // Catat transaksi token hangus di ledger (append-only)
        await this.prisma.tokenTransaction.create({
          data: {
            walletId: user.tokenWallet.id,
            type: 'expire',
            amount: -currentBalance,
            idempotencyKey: `expire-idle-90d-${user.id}-${todayStr}`,
          },
        });

        // Kirim notifikasi bahwa token telah hangus
        await this.notificationService.send(
          user.id,
          'token_expiry_warning',
          `Saldo ${currentBalance} token Anda telah hangus karena akun tidak aktif selama lebih dari 3 bulan (90 hari).`,
        );

        expiredCount++;
      }

      // Hapus data lokasi GPS otomatis sesuai aturan privasi (SECURITY.md)
      await this.prisma.userProfile.updateMany({
        where: { userId: user.id },
        data: {
          domicileLat: null,
          domicileLng: null,
          domicileVerifiedAt: null,
        },
      });
    }

    // =======================================================================
    // 2. Notifikasi Peringatan Bertahap (H-15, H-5, H-1)
    // =======================================================================
    const stages: Array<{ daysAgo: number; daysLeft: 15 | 5 | 1 }> = [
      { daysAgo: 75, daysLeft: 15 },
      { daysAgo: 85, daysLeft: 5 },
      { daysAgo: 89, daysLeft: 1 },
    ];

    for (const stage of stages) {
      const { start, end } = getDayRange(stage.daysAgo);
      const candidates = await this.prisma.user.findMany({
        where: {
          lastActiveAt: { gte: start, lte: end },
          status: 'active',
        },
        include: {
          tokenWallet: true,
        },
      });

      for (const candidate of candidates) {
        if (!candidate.tokenWallet) continue;

        const agg = await this.prisma.tokenTransaction.aggregate({
          where: { walletId: candidate.tokenWallet.id },
          _sum: { amount: true },
        });
        const balance = agg._sum.amount ?? 0;

        if (balance > 0) {
          await this.notificationService.triggerTokenExpiryWarning(
            candidate.id,
            stage.daysLeft,
            balance,
          );
          warnedCount++;
        }
      }
    }

    this.logger.log(
      `[TokenExpiryJob] Selesai: ${expiredCount} akun token hangus, ${warnedCount} notifikasi peringatan terkirim.`,
    );

    return {
      expired_accounts: expiredCount,
      warned_accounts: warnedCount,
    };
  }
}
