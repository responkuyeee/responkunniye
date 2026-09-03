import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawalService } from './withdrawal.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

describe('WithdrawalService', () => {
  let service: WithdrawalService;
  let prisma: any;
  let configService: any;

  const mockUserId = 'user-uuid-1';
  const mockWallet = { id: 'wallet-uuid-1', userId: mockUserId };

  beforeEach(async () => {
    prisma = {
      tokenWallet: {
        findUnique: jest.fn().mockResolvedValue(mockWallet),
        create: jest.fn().mockResolvedValue(mockWallet),
      },
      tokenTransaction: {
        aggregate: jest.fn(),
        create: jest.fn(),
      },
      withdrawal: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    configService = {
      get: jest.fn((key: string, defaultVal?: any) => {
        const config: Record<string, any> = {
          TOKEN_PRICE_IDR: 1000,
        };
        return config[key] ?? defaultVal;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WithdrawalService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<WithdrawalService>(WithdrawalService);
  });

  // =======================================================================
  // Requirement 1: Withdrawal fee tepat 3% dari nilai token
  // =======================================================================
  it('withdrawal fee tepat 3%, dihitung dari nilai token yang ditarik (100 token = Rp100.000 -> fee Rp3.000, net Rp97.000)', async () => {
    // Saldo 150 token
    prisma.tokenTransaction.aggregate.mockResolvedValue({ _sum: { amount: 150 } });
    prisma.withdrawal.create.mockImplementation(({ data }: any) => ({
      id: 'wd-uuid-1',
      ...data,
    }));

    const res = await service.requestWithdrawal(mockUserId, {
      token_amount: 100,
    });

    expect(res.token_amount).toBe(100);
    expect(res.gross_amount_idr).toBe(100_000); // 100 × Rp1.000
    expect(res.fee_percentage).toBe(3.0);
    expect(res.fee_amount_idr).toBe(3_000);     // 3% dari 100.000
    expect(res.net_amount_idr).toBe(97_000);     // 100.000 - 3.000
    expect(res.remaining_token_balance).toBe(50); // 150 - 100
  });

  // =======================================================================
  // Requirement 2: Saldo langsung ter-deduct saat request dibuat
  // Request kedua dengan saldo yang sama harus gagal
  // =======================================================================
  it('request kedua dengan saldo pas-pasan harus gagal karena saldo sudah terpotong saat request pertama dibuat', async () => {
    // Awalnya user punya saldo tepat 100 token
    // Pada request 1: saldo ada 100 token -> berhasil deduct 100 token (sisa 0)
    // Pada request 2: saldo tinggal 0 token -> gagal!
    prisma.tokenTransaction.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 100 } })
      .mockResolvedValueOnce({ _sum: { amount: 0 } });

    prisma.withdrawal.create.mockResolvedValue({
      id: 'wd-1',
      tokenAmount: 100,
      status: 'requested',
    });

    // Request pertama: Sukses
    const res1 = await service.requestWithdrawal(mockUserId, { token_amount: 100 });
    expect(res1.status).toBe('requested');
    expect(prisma.tokenTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'withdrawal',
          amount: -100, // negatif = saldo langsung terpotong saat diajukan
        }),
      }),
    );

    // Request kedua dengan nominal 100: Harus gagal karena saldo sudah ter-deduct
    await expect(
      service.requestWithdrawal(mockUserId, { token_amount: 100 }),
    ).rejects.toThrow(BadRequestException);
  });

  // =======================================================================
  // Requirement 3: Withdrawal gagal di payment gateway -> status failed, saldo dikembalikan
  // =======================================================================
  it('jika penarikan gagal di payment gateway -> status diubah ke failed dan token di-refund ke wallet', async () => {
    prisma.withdrawal.findUnique.mockResolvedValue({
      id: 'wd-uuid-1',
      tokenAmount: 100,
      status: 'requested',
      user: {
        tokenWallet: mockWallet,
      },
    });

    const res = await service.approveWithdrawal('admin-uuid-1', 'wd-uuid-1', true); // simulate failure = true

    expect(res.status).toBe('failed');
    expect(res.refunded_tokens).toBe(100);
    // Verifikasi tokenTransaction.create dipanggil dengan type 'refund' dan amount positif (+100)
    expect(prisma.tokenTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'refund',
          amount: 100,
        }),
      }),
    );
    expect(prisma.withdrawal.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'wd-uuid-1' },
        data: expect.objectContaining({ status: 'failed' }),
      }),
    );
  });

  // =======================================================================
  // Sukses Approve di Payment Gateway
  // =======================================================================
  it('jika penarikan sukses di gateway -> status completed dan provider ref tersimpan', async () => {
    prisma.withdrawal.findUnique.mockResolvedValue({
      id: 'wd-uuid-1',
      tokenAmount: 100,
      status: 'requested',
      user: { tokenWallet: mockWallet },
    });

    prisma.withdrawal.update.mockResolvedValue({
      id: 'wd-uuid-1',
      status: 'completed',
      paymentProviderRef: 'DISB-12345',
      netAmountIdr: 97_000,
      processedAt: new Date(),
    });

    const res = await service.approveWithdrawal('admin-uuid-1', 'wd-uuid-1', false);

    expect(res.status).toBe('completed');
    expect(res.payment_provider_ref).toBeDefined();
    expect(prisma.withdrawal.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'wd-uuid-1' },
        data: expect.objectContaining({ status: 'completed' }),
      }),
    );
  });
});
