import { Test, TestingModule } from '@nestjs/testing';
import { TokenExpiryJob } from './token-expiry.job';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

describe('TokenExpiryJob', () => {
  let job: TokenExpiryJob;
  let prisma: any;
  let notifService: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn(),
      },
      tokenTransaction: {
        aggregate: jest.fn(),
        create: jest.fn(),
      },
      userProfile: {
        updateMany: jest.fn(),
      },
    };

    notifService = {
      send: jest.fn().mockResolvedValue({}),
      triggerTokenExpiryWarning: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenExpiryJob,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationService, useValue: notifService },
      ],
    }).compile();

    job = module.get<TokenExpiryJob>(TokenExpiryJob);
  });

  // =======================================================================
  // Requirement 1: Akun idle >= 90 hari -> token hangus di ledger & GPS clear
  // =======================================================================
  it('harus menghanguskan saldo token (append-only ledger) dan menghapus data GPS untuk akun idle >= 90 hari', async () => {
    const now = new Date('2026-06-01T00:00:00Z');

    // 1 user idle >= 90 hari
    prisma.user.findMany
      .mockResolvedValueOnce([
        {
          id: 'user-idle-90d',
          tokenWallet: { id: 'wallet-1' },
          lastActiveAt: new Date('2026-02-01T00:00:00Z'),
        },
      ])
      .mockResolvedValue([]); // candidates untuk warning stages kosong

    // Saldo 50 token
    prisma.tokenTransaction.aggregate.mockResolvedValue({ _sum: { amount: 50 } });

    const result = await job.processIdleAccountsAndExpiry(now);

    expect(result.expired_accounts).toBe(1);

    // Verifikasi transaksi hangus dicatat di ledger (amount: -50, type: 'expire')
    expect(prisma.tokenTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          walletId: 'wallet-1',
          type: 'expire',
          amount: -50,
        }),
      }),
    );

    // Verifikasi data GPS dihapus otomatis sesuai SECURITY.md
    expect(prisma.userProfile.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-idle-90d' },
        data: expect.objectContaining({
          domicileLat: null,
          domicileLng: null,
          domicileVerifiedAt: null,
        }),
      }),
    );

    // Verifikasi notifikasi terkirim
    expect(notifService.send).toHaveBeenCalledWith(
      'user-idle-90d',
      'token_expiry_warning',
      expect.stringContaining('50 token Anda telah hangus'),
    );
  });

  // =======================================================================
  // Requirement 2: Peringatan bertahap H-15, H-5, H-1
  // =======================================================================
  it('harus mengirim notifikasi peringatan bertahap (H-15, H-5, H-1) kepada akun yang mendekati 90 hari idle', async () => {
    const now = new Date('2026-06-01T00:00:00Z');

    prisma.user.findMany
      .mockResolvedValueOnce([]) // expired 90d kosong
      .mockResolvedValueOnce([
        // H-15 (75 hari)
        { id: 'user-h15', tokenWallet: { id: 'w-15' } },
      ])
      .mockResolvedValueOnce([
        // H-5 (85 hari)
        { id: 'user-h5', tokenWallet: { id: 'w-5' } },
      ])
      .mockResolvedValueOnce([
        // H-1 (89 hari)
        { id: 'user-h1', tokenWallet: { id: 'w-1' } },
      ]);

    prisma.tokenTransaction.aggregate.mockResolvedValue({ _sum: { amount: 100 } });

    const result = await job.processIdleAccountsAndExpiry(now);

    expect(result.warned_accounts).toBe(3);

    expect(notifService.triggerTokenExpiryWarning).toHaveBeenCalledWith('user-h15', 15, 100);
    expect(notifService.triggerTokenExpiryWarning).toHaveBeenCalledWith('user-h5', 5, 100);
    expect(notifService.triggerTokenExpiryWarning).toHaveBeenCalledWith('user-h1', 1, 100);
  });
});
