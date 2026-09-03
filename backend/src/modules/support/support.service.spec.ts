import { Test, TestingModule } from '@nestjs/testing';
import { SupportService } from './support.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('SupportService', () => {
  let service: SupportService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      supportTicket: {
        create: jest.fn().mockImplementation(({ data }: any) => ({
          id: 'ticket-1',
          ...data,
          createdAt: new Date(),
        })),
        findMany: jest.fn().mockResolvedValue([
          {
            id: 't1',
            userId: 'u1',
            category: 'dispute_answer',
            subject: 'Banding Survei',
            description: 'Saya menjawab dengan jujur dan teliti',
            status: 'open',
            createdAt: new Date(),
          },
        ]),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupportService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SupportService>(SupportService);
  });

  it('berhasil membuat tiket banding/dispute baru oleh pengguna', async () => {
    const res = await service.createTicket('u1', {
      category: 'dispute_answer',
      subject: 'Banding Penolakan Survei',
      description: 'Mohon evaluasi ulang pengerjaan survei saya, saya tidak straight-lining.',
    });

    expect(res.ticket_id).toBe('ticket-1');
    expect(res.category).toBe('dispute_answer');
    expect(res.status).toBe('open');
    expect(prisma.supportTicket.create).toHaveBeenCalled();
  });

  it('admin dapat meninjau dan menyelesaikan tiket dukungan', async () => {
    prisma.supportTicket.findUnique.mockResolvedValue({
      id: 'ticket-1',
      status: 'open',
    });

    prisma.supportTicket.update.mockResolvedValue({
      id: 'ticket-1',
      status: 'resolved',
      assignedTo: 'admin-1',
      resolvedAt: new Date(),
    });

    const res = await service.resolveTicket('admin-1', 'ticket-1', {
      status: 'resolved',
      resolution_note: 'Banding disetujui, jawaban telah di-approve kembali.',
    });

    expect(res.status).toBe('resolved');
    expect(res.resolution_note).toBe('Banding disetujui, jawaban telah di-approve kembali.');
    expect(prisma.supportTicket.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ticket-1' },
        data: expect.objectContaining({ status: 'resolved', assignedTo: 'admin-1' }),
      }),
    );
  });

  it('gagal jika tiket yang akan di-resolve tidak ditemukan', async () => {
    prisma.supportTicket.findUnique.mockResolvedValue(null);

    await expect(
      service.resolveTicket('admin-1', 'ticket-non-existent', {
        status: 'resolved',
        resolution_note: 'Catatan',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
