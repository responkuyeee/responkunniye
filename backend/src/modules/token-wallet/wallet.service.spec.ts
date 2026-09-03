import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';

/**
 * Unit test untuk WalletService — modul paling kritis (lihat TESTING.md)
 *
 * Fokus pengujian:
 * 1. Saldo dihitung dari SUM ledger, bukan kolom cache
 * 2. Reserve gagal jika saldo tidak cukup
 * 3. Reserve minimum 50 token
 * 4. Split reward 80:20 tepat (tidak ada pembulatan salah)
 * 5. Idempotency topup — key sama → tidak duplikasi transaksi
 * 6. Idempotency consume — key sama → tidak double reward
 * 7. Race condition reserve — dua request simultan pada saldo pas-pasan → saldo tidak negatif
 */
describe('WalletService', () => {
  let walletService: WalletService;
  let prismaService: any;
  let configService: any;

  const mockWallet = { id: 'wallet-uuid-1', userId: 'user-uuid-1' };
  const mockUser = { id: 'user-uuid-1', tokenWallet: mockWallet };

  beforeEach(async () => {
    prismaService = {
      tokenWallet: {
        findUnique: jest.fn().mockResolvedValue(mockWallet),
        create: jest.fn().mockResolvedValue(mockWallet),
      },
      tokenTransaction: {
        aggregate: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'tx-uuid-1' }),
      },
      payment: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prismaService)),
      $queryRaw: jest.fn(),
    };

    configService = {
      get: jest.fn((key: string, defaultVal?: any) => {
        const config: Record<string, any> = {
          TOKEN_PRICE_IDR: 1000,
          REWARD_SPLIT_RESPONDENT_PERCENT: 80,
          REWARD_SPLIT_PLATFORM_PERCENT: 20,
          MIN_RESPONDENT_PER_RESEARCH: 50,
          PAYMENT_PROVIDER: 'midtrans',
          PAYMENT_IS_PRODUCTION: 'false',
        };
        return config[key] ?? defaultVal;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: PrismaService, useValue: prismaService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    walletService = module.get<WalletService>(WalletService);
  });

  // ------------------------------------------------------------------
  // Test 1: Saldo dihitung dari SUM ledger
  // ------------------------------------------------------------------
  describe('getBalance', () => {
    it('harus menghitung saldo dari SUM ledger (bukan kolom cache)', async () => {
      prismaService.tokenTransaction.aggregate.mockResolvedValue({
        _sum: { amount: 150 },
      });

      const result = await walletService.getBalance('user-uuid-1');

      expect(result.balance_token).toBe(150);
      expect(result.balance_idr_equivalent).toBe(150_000); // 150 × Rp1.000
      expect(prismaService.tokenTransaction.aggregate).toHaveBeenCalledWith({
        where: { walletId: mockWallet.id },
        _sum: { amount: true },
      });
    });

    it('harus mengembalikan saldo 0 jika belum ada transaksi', async () => {
      prismaService.tokenTransaction.aggregate.mockResolvedValue({
        _sum: { amount: null },
      });

      const result = await walletService.getBalance('user-uuid-1');
      expect(result.balance_token).toBe(0);
    });
  });

  // ------------------------------------------------------------------
  // Test 2: Reserve gagal jika saldo tidak cukup
  // ------------------------------------------------------------------
  describe('reserveTokens', () => {
    it('harus melempar BadRequestException jika saldo tidak cukup', async () => {
      // Saldo = 30, mau reserve 50 → harus gagal
      prismaService.$queryRaw.mockResolvedValue([{ balance: 30 }]);

      await expect(
        walletService.reserveTokens('user-uuid-1', {
          research_id: 'research-uuid-1',
          amount: 50,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('harus berhasil reserve jika saldo mencukupi', async () => {
      // Saldo = 100, mau reserve 50 → berhasil
      prismaService.$queryRaw.mockResolvedValue([{ balance: 100 }]);

      const result = await walletService.reserveTokens('user-uuid-1', {
        research_id: 'research-uuid-1',
        amount: 50,
      });

      expect(result.reserved).toBe(50);
      expect(result.remaining_balance).toBe(50);
      // Memastikan tokenTransaction.create dipanggil dengan amount negatif
      expect(prismaService.tokenTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'reserve',
            amount: -50, // negatif = token keluar dari saldo bebas
          }),
        }),
      );
    });

    it('harus melempar BadRequestException jika amount < 50 (minimum research)', async () => {
      await expect(
        walletService.reserveTokens('user-uuid-1', {
          research_id: 'research-uuid-1',
          amount: 30, // di bawah minimum 50
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ------------------------------------------------------------------
  // Test 3: Race condition — dua reserve simultan pada saldo pas-pasan
  // Dalam environment real PostgreSQL, FOR UPDATE lock mencegah ini.
  // Test ini memverifikasi bahwa logika balance check benar menggunakan
  // nilai dari $queryRaw (yg merefleksikan kunci baris), bukan dari cache.
  // ------------------------------------------------------------------
  describe('race condition prevention', () => {
    it('harus gagal jika saldo tepat pas dan dua request simultan: request kedua mendapat saldo sudah berkurang', async () => {
      // Simulasi: setelah request pertama berhasil, $queryRaw mengembalikan saldo 0
      prismaService.$queryRaw
        .mockResolvedValueOnce([{ balance: 50 }]) // request pertama: berhasil
        .mockResolvedValueOnce([{ balance: 0 }]);  // request kedua: saldo sudah habis

      // Request pertama berhasil
      const result1 = await walletService.reserveTokens('user-uuid-1', {
        research_id: 'research-uuid-1',
        amount: 50,
      });
      expect(result1.reserved).toBe(50);

      // Request kedua gagal karena saldo sudah habis
      await expect(
        walletService.reserveTokens('user-uuid-1', {
          research_id: 'research-uuid-2',
          amount: 50,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ------------------------------------------------------------------
  // Test 4: Idempotency topup — key sama tidak buat transaksi baru
  // ------------------------------------------------------------------
  describe('initTopup', () => {
    it('idempotency: topup dengan key yang sama harus mengembalikan respons idempotent tanpa membuat payment baru', async () => {
      // Simulasikan bahwa transaksi dengan key ini sudah ada
      prismaService.tokenTransaction.findFirst.mockResolvedValue({
        id: 'tx-existing-1',
        amount: 100,
        idempotencyKey: 'key-abc-123',
      });

      const result: any = await walletService.initTopup('user-uuid-1', {
        amount_token: 100,
        payment_method: 'qris',
        idempotency_key: 'key-abc-123',
      });

      expect(result.idempotent).toBe(true);
      // Memastikan payment.create TIDAK dipanggil (tidak buat duplikasi)
      expect(prismaService.payment.create).not.toHaveBeenCalled();
    });

    it('topup dengan key baru harus membuat payment record baru', async () => {
      prismaService.tokenTransaction.findFirst.mockResolvedValue(null);
      prismaService.payment.create.mockResolvedValue({
        id: 'payment-uuid-1',
        amountIdr: 100_000,
        idempotencyKey: 'key-new-xyz',
      });

      const result: any = await walletService.initTopup('user-uuid-1', {
        amount_token: 100,
        payment_method: 'qris',
        idempotency_key: 'key-new-xyz',
      });

      expect(result.idempotent).toBe(false);
      expect(prismaService.payment.create).toHaveBeenCalledTimes(1);
      expect(result.amount_token).toBe(100);
    });
  });

  // ------------------------------------------------------------------
  // Test 5: Consume token — split 80:20 tepat (TESTING.md requirement)
  // ------------------------------------------------------------------
  describe('consumeToken', () => {
    it('harus menghitung split 80:20 dengan tepat untuk 1 token', async () => {
      prismaService.tokenTransaction.findFirst.mockResolvedValue(null); // belum diproses

      const result = await walletService.consumeToken('user-uuid-1', {
        research_id: 'research-uuid-1',
        participation_id: 'participation-uuid-1',
        amount: 1,
        idempotency_key: 'consume-key-001',
      });

      expect(result.respondent_amount).toBe(0.8); // 80% dari 1 token
      expect(result.platform_amount).toBe(0.2);   // 20% dari 1 token
      // Memastikan total = 1 (tidak ada token yang hilang)
      expect(result.respondent_amount + result.platform_amount).toBeCloseTo(1.0);
    });

    it('idempotency: consume dengan key yang sama tidak boleh double reward', async () => {
      // Simulasikan consume sudah pernah dilakukan
      prismaService.tokenTransaction.findFirst.mockResolvedValue({
        id: 'tx-consume-1',
        type: 'consume',
        idempotencyKey: 'consume-key-001',
      });

      const result = await walletService.consumeToken('user-uuid-1', {
        research_id: 'research-uuid-1',
        participation_id: 'participation-uuid-1',
        amount: 1,
        idempotency_key: 'consume-key-001',
      });

      // Mengembalikan nilai split tapi TIDAK membuat transaksi baru
      expect(result.respondent_amount).toBe(0.8);
      expect(prismaService.tokenTransaction.create).not.toHaveBeenCalled();
    });
  });

  // ------------------------------------------------------------------
  // Test 6: Refund — idempotent
  // ------------------------------------------------------------------
  describe('refundTokens', () => {
    it('harus refund dengan amount positif (token kembali ke wallet)', async () => {
      prismaService.tokenTransaction.findFirst.mockResolvedValue(null);

      const result = await walletService.refundTokens('user-uuid-1', {
        research_id: 'research-uuid-1',
        amount: 30,
        idempotency_key: 'refund-key-001',
      });

      expect(result.refunded).toBe(30);
      expect(prismaService.tokenTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'refund',
            amount: 30, // positif = token kembali
          }),
        }),
      );
    });

    it('idempotency: refund dengan key yang sama tidak boleh muncul dua kali', async () => {
      prismaService.tokenTransaction.findFirst.mockResolvedValue({
        id: 'tx-refund-1',
        type: 'refund',
        idempotencyKey: 'refund-key-001',
      });

      const result = await walletService.refundTokens('user-uuid-1', {
        research_id: 'research-uuid-1',
        amount: 30,
        idempotency_key: 'refund-key-001',
      });

      expect(result.refunded).toBe(30);
      expect(prismaService.tokenTransaction.create).not.toHaveBeenCalled();
    });
  });

  // ------------------------------------------------------------------
  // Test 7: Webhook — verifikasi signature, idempotency
  // ------------------------------------------------------------------
  describe('handlePaymentWebhook', () => {
    it('harus menolak jika signature tidak ada', async () => {
      const result = await walletService.handlePaymentWebhook(
        { payment_id: 'p1', status: 'success' },
        '', // signature kosong
      );
      expect(result.processed).toBe(false);
    });

    it('harus idempotent jika payment sudah berstatus success', async () => {
      prismaService.payment.findUnique.mockResolvedValue({
        id: 'p1',
        status: 'success', // sudah pernah diproses
        amountIdr: 100_000,
        idempotencyKey: 'key-webhook-1',
        userId: 'user-uuid-1',
        user: { tokenWallet: mockWallet },
      });

      const result = await walletService.handlePaymentWebhook(
        { payment_id: 'p1', status: 'success' },
        'valid-signature',
      );

      expect(result.processed).toBe(true);
      expect(result.message).toContain('Sudah diproses');
      // Tidak boleh buat tokenTransaction baru
      expect(prismaService.tokenTransaction.create).not.toHaveBeenCalled();
    });
  });
});
