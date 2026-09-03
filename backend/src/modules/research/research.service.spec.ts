import { Test, TestingModule } from '@nestjs/testing';
import { ResearchService } from './research.service';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from '../token-wallet/wallet.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('ResearchService', () => {
  let service: ResearchService;
  let prisma: any;
  let walletService: any;

  const mockResearcherId = 'researcher-uuid-1';
  const mockResearchId = 'research-uuid-1';

  beforeEach(async () => {
    prisma = {
      research: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      tokenTransaction: {
        findFirst: jest.fn(),
        aggregate: jest.fn(),
      },
      userProfile: {
        findUnique: jest.fn(),
      },
      user: {
        update: jest.fn(),
      },
      adminReview: {
        count: jest.fn(),
        create: jest.fn(),
      },
      qualityScore: {
        findUnique: jest.fn(),
      },
      respondentParticipation: {
        findMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };


    walletService = {
      reserveTokens: jest.fn(),
      refundTokens: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResearchService,
        { provide: PrismaService, useValue: prisma },
        { provide: WalletService, useValue: walletService },
      ],
    }).compile();

    service = module.get<ResearchService>(ResearchService);
  });

  describe('createResearch', () => {
    it('harus melempar BadRequestException jika target_respondent_count < 50', async () => {
      await expect(
        service.createResearch(mockResearcherId, {
          title: 'Survei Kebiasaan Belanja',
          description: 'Riset tentang kebiasaan berbelanja online',
          external_survey_url: 'https://survey.example.com/s/123',
          target_respondent_count: 49, // kurang dari 50
          estimated_duration_minutes: 10,
          deadline: new Date(Date.now() + 86400000).toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('harus menolak research jika terdapat kata terlarang (keyword filter)', async () => {
      await expect(
        service.createResearch(mockResearcherId, {
          title: 'Riset Link Slot Gacor Terbaru Hari Ini',
          description: 'Mencari preferensi pemain game slot',
          external_survey_url: 'https://survey.example.com/s/123',
          target_respondent_count: 50,
          estimated_duration_minutes: 5,
          deadline: new Date(Date.now() + 86400000).toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('harus berhasil membuat riset draft dengan target >= 50 dan konten bersih', async () => {
      const mockCreated = {
        id: mockResearchId,
        researcherId: mockResearcherId,
        title: 'Survei Transportasi Publik',
        description: 'Penelitian kepuasan MRT dan TransJakarta',
        externalSurveyUrl: 'https://survey.example.com/s/trans',
        targetRespondentCount: 100,
        estimatedDurationMinutes: 15,
        deadline: new Date(Date.now() + 86400000),
        status: 'draft',
        criteria: [],
        screeningQuestions: [],
        createdAt: new Date(),
      };
      prisma.research.create.mockResolvedValue(mockCreated);

      const result = await service.createResearch(mockResearcherId, {
        title: 'Survei Transportasi Publik',
        description: 'Penelitian kepuasan MRT dan TransJakarta',
        external_survey_url: 'https://survey.example.com/s/trans',
        target_respondent_count: 100,
        estimated_duration_minutes: 15,
        deadline: new Date(Date.now() + 86400000).toISOString(),
      });

      expect(result.id).toBe(mockResearchId);
      expect(result.status).toBe('draft');
      expect(result.estimated_cost_token).toBe(100);
      expect(result.estimated_cost_idr).toBe(100000);
      expect(prisma.research.create).toHaveBeenCalled();
    });
  });

  describe('publishResearch', () => {
    it('harus menolak jika user bukan pemilik research', async () => {
      prisma.research.findUnique.mockResolvedValue({
        id: mockResearchId,
        researcherId: 'another-user-id',
        status: 'draft',
        targetRespondentCount: 50,
      });

      await expect(service.publishResearch(mockResearcherId, mockResearchId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('harus menolak jika research bukan status draft', async () => {
      prisma.research.findUnique.mockResolvedValue({
        id: mockResearchId,
        researcherId: mockResearcherId,
        status: 'published',
        targetRespondentCount: 50,
      });

      await expect(service.publishResearch(mockResearcherId, mockResearchId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('harus berhasil publish dan memanggil walletService.reserveTokens', async () => {
      prisma.research.findUnique.mockResolvedValue({
        id: mockResearchId,
        researcherId: mockResearcherId,
        status: 'draft',
        targetRespondentCount: 50,
      });
      prisma.tokenTransaction.findFirst.mockResolvedValue(null);
      walletService.reserveTokens.mockResolvedValue({ reserved: 50, remaining_balance: 150 });
      prisma.research.update.mockResolvedValue({
        id: mockResearchId,
        status: 'published',
        publishedAt: new Date(),
      });

      const res = await service.publishResearch(mockResearcherId, mockResearchId);

      expect(res.status).toBe('published');
      expect(walletService.reserveTokens).toHaveBeenCalledWith(mockResearcherId, {
        research_id: mockResearchId,
        amount: 50,
      });
      expect(prisma.research.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockResearchId },
          data: expect.objectContaining({ status: 'published' }),
        }),
      );
    });
  });

  describe('cancelResearch', () => {
    it('harus me-refund sisa token yang belum ter-consume', async () => {
      prisma.research.findUnique.mockResolvedValue({
        id: mockResearchId,
        researcherId: mockResearcherId,
        status: 'published',
        targetRespondentCount: 100,
      });
      // Misal sudah terconsume 20
      prisma.tokenTransaction.aggregate.mockResolvedValue({
        _sum: { amount: -20 },
      });
      prisma.research.update.mockResolvedValue({
        id: mockResearchId,
        status: 'cancelled',
      });

      const res = await service.cancelResearch(mockResearcherId, mockResearchId);

      expect(res.status).toBe('cancelled');
      expect(res.refunded_tokens).toBe(80); // 100 - 20 = 80
      expect(walletService.refundTokens).toHaveBeenCalledWith(mockResearcherId, {
        research_id: mockResearchId,
        amount: 80,
        idempotency_key: `refund-cancel-${mockResearchId}`,
      });
    });
  });

  describe('getAvailableResearch', () => {
    it('harus mengembalikan list kosong jika respondent memiliki quality score throttled', async () => {
      prisma.userProfile.findUnique.mockResolvedValue({ userId: 'resp-1', gender: 'male' });
      prisma.qualityScore.findUnique.mockResolvedValue({ userId: 'resp-1', throttled: true });

      const res = await service.getAvailableResearch('resp-1');

      expect(res.data).toEqual([]);
      expect(res.message).toContain('threshold');
    });


    it('harus memfilter research yang kriteria profilnya tidak cocok', async () => {
      prisma.userProfile.findUnique.mockResolvedValue({
        userId: 'resp-1',
        gender: 'male',
        domicileProvince: 'Jawa Barat',
      });
      prisma.qualityScore.findUnique.mockResolvedValue({ userId: 'resp-1', throttled: false });
      prisma.respondentParticipation.findMany.mockResolvedValue([]);

      // 1 cocok (gender male), 1 tidak cocok (gender female)
      prisma.research.findMany.mockResolvedValue([
        {
          id: 'r1',
          title: 'Riset Cowok',
          description: 'Khusus pria',
          estimatedDurationMinutes: 10,
          targetRespondentCount: 50,
          deadline: new Date(Date.now() + 100000),
          publishedAt: new Date(),
          criteria: [{ field: 'gender', operator: 'eq', value: 'male' }],
          _count: { participations: 10 },
        },
        {
          id: 'r2',
          title: 'Riset Cewek',
          description: 'Khusus wanita',
          estimatedDurationMinutes: 10,
          targetRespondentCount: 50,
          deadline: new Date(Date.now() + 100000),
          publishedAt: new Date(),
          criteria: [{ field: 'gender', operator: 'eq', value: 'female' }],
          _count: { participations: 5 },
        },
      ]);

      const res = await service.getAvailableResearch('resp-1');

      expect(res.data.length).toBe(1);
      expect(res.data[0].id).toBe('r1');
    });
  });

  describe('takedownResearch (Kebijakan Konten)', () => {
    const mockResearch = {
      id: 'res-takedown-1',
      researcherId: 'researcher-bad',
      title: 'Survei Judi',
      status: 'active',
      targetRespondentCount: 50,
      participations: [],
    };

    it('pelanggaran ke-1: peringatan (warning) + takedown research', async () => {
      prisma.research.findUnique.mockResolvedValue(mockResearch);
      prisma.adminReview.count.mockResolvedValue(0); // belum ada pelanggaran

      const res = await service.takedownResearch('admin-1', 'res-takedown-1', 'Konten judi online');

      expect(res.violation_number).toBe(1);
      expect(res.action_taken).toBe('warning_and_takedown');
      expect(prisma.research.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'res-takedown-1' },
          data: { status: 'rejected' },
        }),
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('pelanggaran ke-2: suspend sementara 1 x 24 jam', async () => {
      prisma.research.findUnique.mockResolvedValue(mockResearch);
      prisma.adminReview.count.mockResolvedValue(1); // sudah ada 1 pelanggaran sebelumnya

      const res = await service.takedownResearch('admin-1', 'res-takedown-1', 'Pelanggaran kedua');

      expect(res.violation_number).toBe(2);
      expect(res.action_taken).toBe('suspended_24h');
      expect(res.suspend_hours).toBe(24);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'researcher-bad' },
          data: { status: 'suspended' },
        }),
      );
    });

    it('pelanggaran ke-3: ban permanen', async () => {
      prisma.research.findUnique.mockResolvedValue(mockResearch);
      prisma.adminReview.count.mockResolvedValue(2); // sudah ada 2 pelanggaran sebelumnya

      const res = await service.takedownResearch('admin-1', 'res-takedown-1', 'Pelanggaran ketiga');

      expect(res.violation_number).toBe(3);
      expect(res.action_taken).toBe('banned_permanent');
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'researcher-bad' },
          data: { status: 'banned' },
        }),
      );
    });
  });
});

