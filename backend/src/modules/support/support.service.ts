import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSupportTicketDto, ResolveSupportTicketDto } from './dto/support-ticket.dto';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mengajukan tiket baru (misal banding penolakan jawaban survei atau takedown riset)
   */
  async createTicket(userId: string, dto: CreateSupportTicketDto) {
    const ticket = await this.prisma.supportTicket.create({
      data: {
        userId,
        category: dto.category,
        subject: dto.subject,
        description: dto.description,
        status: 'open',
      },
    });

    this.logger.log(`[Support] Tiket dibuat: id=${ticket.id}, user=${userId}, category=${dto.category}`);

    return {
      ticket_id: ticket.id,
      category: ticket.category,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      created_at: ticket.createdAt,
      message: 'Tiket bantuan/banding berhasil diajukan. Tim dukungan akan meninjau dalam 1x24 jam.',
    };
  }

  /**
   * Mengambil riwayat tiket milik pengguna
   */
  async getUserTickets(userId: string) {
    const tickets = await this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      total: tickets.length,
      data: tickets.map((t) => ({
        id: t.id,
        category: t.category,
        subject: t.subject,
        description: t.description,
        status: t.status,
        created_at: t.createdAt,
        resolved_at: t.resolvedAt,
      })),
    };
  }

  /**
   * Antrian semua tiket untuk Admin Quality / Admin Support
   */
  async getAllTicketsForAdmin(category?: string) {
    const where: any = {};
    if (category) {
      where.category = category;
    }

    const tickets = await this.prisma.supportTicket.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      total: tickets.length,
      data: tickets,
    };
  }

  /**
   * Admin menyelesaikan / menanggapi tiket
   */
  async resolveTicket(adminId: string, ticketId: string, dto: ResolveSupportTicketDto) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Tiket dukungan tidak ditemukan');
    }

    const updated = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: dto.status,
        assignedTo: adminId,
        resolvedAt: dto.status === 'resolved' || dto.status === 'closed' ? new Date() : null,
      },
    });

    this.logger.log(
      `[Support] Tiket ${ticketId} diperbarui oleh admin ${adminId} -> status: ${dto.status}`,
    );

    return {
      ticket_id: updated.id,
      status: updated.status,
      assigned_to: updated.assignedTo,
      resolved_at: updated.resolvedAt,
      resolution_note: dto.resolution_note,
      message: `Tiket berhasil diperbarui menjadi "${dto.status}".`,
    };
  }
}
