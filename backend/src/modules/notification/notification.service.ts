import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type NotificationType =
  | 'reward_received'
  | 'research_published'
  | 'submission_reviewed'
  | 'withdrawal_status'
  | 'token_expiry_warning'
  | 'support_ticket_update';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Kirim notifikasi in-app & log simulasi email
   */
  async send(userId: string, type: NotificationType, message: string) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        message,
      },
    });

    this.logger.log(`[Notification: In-App & Email] user=${userId}, type=${type}, msg="${message}"`);
    return notification;
  }

  /**
   * Mengambil daftar notifikasi pengguna
   */
  async getUserNotifications(userId: string) {
    const list = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return {
      total: list.length,
      unread_count: list.filter((n) => !n.readAt).length,
      data: list,
    };
  }

  /**
   * Menandai notifikasi telah dibaca
   */
  async markAsRead(notificationId: string, userId: string) {
    const notif = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notif || notif.userId !== userId) {
      throw new NotFoundException('Notifikasi tidak ditemukan');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }

  // =======================================================================
  // Specific Trigger Helpers (sesuai skill.md & PRD.md)
  // =======================================================================

  async triggerRewardReceived(userId: string, tokens: number = 0.8, idr: number = 800) {
    return this.send(
      userId,
      'reward_received',
      `Selamat! Reward sebesar ${tokens} token (Rp${idr.toLocaleString('id-ID')}) telah cair ke dompet Anda.`,
    );
  }

  async triggerResearchPublished(userId: string, title: string, tokensReserved: number) {
    return this.send(
      userId,
      'research_published',
      `Riset Anda "${title}" berhasil dipublikasikan. Kuota ${tokensReserved} token telah dialokasikan ke pool responden.`,
    );
  }

  async triggerSubmissionReviewed(
    userId: string,
    status: 'approved' | 'rejected',
    researchTitle: string,
    reason?: string,
  ) {
    const msg =
      status === 'approved'
        ? `Jawaban survei Anda untuk "${researchTitle}" telah disetujui oleh tim peninjau mutu (+2 Quality Score).`
        : `Jawaban survei Anda untuk "${researchTitle}" ditolak${reason ? ` karena: ${reason}` : ''}. Anda dapat mengajukan banding lewat menu Support.`;

    return this.send(userId, 'submission_reviewed', msg);
  }

  async triggerWithdrawalStatus(userId: string, status: 'completed' | 'failed', netIdr: number) {
    const msg =
      status === 'completed'
        ? `Pencairan dana sebesar Rp${netIdr.toLocaleString('id-ID')} berhasil ditransfer ke rekening tujuan Anda.`
        : `Pencairan dana sebesar Rp${netIdr.toLocaleString('id-ID')} gagal diproses oleh gateway. Seluruh saldo token telah dikembalikan ke dompet Anda.`;

    return this.send(userId, 'withdrawal_status', msg);
  }

  async triggerTokenExpiryWarning(userId: string, daysLeft: 15 | 5 | 1, balance: number) {
    return this.send(
      userId,
      'token_expiry_warning',
      `Peringatan: Akun Anda tidak aktif selama hampir 3 bulan. Saldo ${balance} token akan hangus dalam ${daysLeft} hari ke depan jika tidak ada aktivitas.`,
    );
  }

  async triggerSupportTicketUpdate(userId: string, ticketSubject: string, status: string) {
    return this.send(
      userId,
      'support_ticket_update',
      `Tiket bantuan/banding Anda "${ticketSubject}" telah diperbarui menjadi: ${status}.`,
    );
  }
}
