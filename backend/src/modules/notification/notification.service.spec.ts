import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      notification: {
        create: jest.fn().mockImplementation(({ data }: any) => ({
          id: 'notif-1',
          ...data,
          createdAt: new Date(),
        })),
        findMany: jest.fn().mockResolvedValue([
          { id: 'n1', userId: 'u1', type: 'reward_received', readAt: null },
          { id: 'n2', userId: 'u1', type: 'research_published', readAt: new Date() },
        ]),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('mengirim notifikasi reward cair (0.8 token / Rp800)', async () => {
    const res = await service.triggerRewardReceived('u1', 0.8, 800);
    expect(res.userId).toBe('u1');
    expect(res.type).toBe('reward_received');
    expect(res.message).toContain('0.8 token');
    expect(res.message).toContain('Rp800');
  });

  it('mengirim notifikasi riset berhasil dipublish', async () => {
    const res = await service.triggerResearchPublished('u1', 'Survei Belanja', 50);
    expect(res.type).toBe('research_published');
    expect(res.message).toContain('Survei Belanja');
    expect(res.message).toContain('50 token');
  });

  it('mengirim peringatan token expiry H-15, H-5, H-1 saat idle', async () => {
    const resH15 = await service.triggerTokenExpiryWarning('u1', 15, 100);
    expect(resH15.type).toBe('token_expiry_warning');
    expect(resH15.message).toContain('15 hari');

    const resH1 = await service.triggerTokenExpiryWarning('u1', 1, 100);
    expect(resH1.message).toContain('1 hari');
  });

  it('mengambil notifikasi pengguna dan menghitung unread_count', async () => {
    const res = await service.getUserNotifications('u1');
    expect(res.total).toBe(2);
    expect(res.unread_count).toBe(1);
  });
});
