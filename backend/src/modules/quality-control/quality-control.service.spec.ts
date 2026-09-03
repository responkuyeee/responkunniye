import { Test, TestingModule } from '@nestjs/testing';
import { QualityControlService } from './quality-control.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('QualityControlService', () => {
  let service: QualityControlService;
  let prisma: any;
  let configService: any;

  const mockRespondentId = 'resp-uuid-1';
  const mockResearchId = 'research-uuid-1';
  const mockParticipationId = 'part-uuid-1';

  beforeEach(async () => {
    prisma = {
      research: {
        findUnique: jest.fn(),
      },
      respondentParticipation: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      screeningAnswer: {
        create: jest.fn(),
      },
      qualityCheck: {
        create: jest.fn(),
      },
      qualityScore: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      adminReview: {
        create: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    configService = {
      get: jest.fn((key: string, defaultVal?: any) => {
        const config: Record<string, any> = {
          CONSECUTIVE_GOOD_ANSWERS_FOR_RECOVERY: 5,
          QUALITY_SCORE_THROTTLE_THRESHOLD: 70.0,
        };
        return config[key] ?? defaultVal;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QualityControlService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<QualityControlService>(QualityControlService);
  });

  // =======================================================================
  // 1. Screening Tests
  // =======================================================================
  describe('submitScreening', () => {
    it('harus meloloskan respondent jika skor >= pass_threshold', async () => {
      prisma.research.findUnique.mockResolvedValue({
        id: mockResearchId,
        status: 'published',
        screeningQuestions: [
          { id: 'q1', passThreshold: 5 },
          { id: 'q2', passThreshold: 5 },
        ],
      });
      prisma.respondentParticipation.findUnique.mockResolvedValue(null);
      prisma.respondentParticipation.upsert.mockResolvedValue({
        id: mockParticipationId,
        status: 'qualified',
      });

      const res = await service.submitScreening(mockRespondentId, mockResearchId, {
        answers: [
          { screening_question_id: 'q1', answer: 'Ya', score: 5 },
          { screening_question_id: 'q2', answer: 'Setuju', score: 5 },
        ],
      });

      expect(res.passed).toBe(true);
      expect(res.total_score).toBe(10);
      expect(res.status).toBe('qualified');
    });

    it('harus menolak respondent jika skor < pass_threshold', async () => {
      prisma.research.findUnique.mockResolvedValue({
        id: mockResearchId,
        status: 'published',
        screeningQuestions: [{ id: 'q1', passThreshold: 10 }],
      });
      prisma.respondentParticipation.findUnique.mockResolvedValue(null);
      prisma.respondentParticipation.upsert.mockResolvedValue({
        id: mockParticipationId,
        status: 'rejected',
      });

      const res = await service.submitScreening(mockRespondentId, mockResearchId, {
        answers: [{ screening_question_id: 'q1', answer: 'Tidak', score: 2 }],
      });

      expect(res.passed).toBe(false);
      expect(res.total_score).toBe(2);
      expect(res.status).toBe('rejected');
    });

    it('harus menolak jika respondent sudah pernah berpartisipasi (UNIQUE per research+respondent)', async () => {
      prisma.research.findUnique.mockResolvedValue({
        id: mockResearchId,
        status: 'published',
        screeningQuestions: [],
      });
      prisma.respondentParticipation.findUnique.mockResolvedValue({
        id: mockParticipationId,
        status: 'in_progress', // sudah pernah mulai
      });

      await expect(
        service.submitScreening(mockRespondentId, mockResearchId, { answers: [] }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // =======================================================================
  // 2. Participate Tests
  // =======================================================================
  describe('participate', () => {
    it('harus menolak jika riset memiliki screening questions tapi respondent belum lolos (belum qualified)', async () => {
      prisma.research.findUnique.mockResolvedValue({
        id: mockResearchId,
        status: 'published',
        screeningQuestions: [{ id: 'q1', passThreshold: 10 }],
      });
      prisma.respondentParticipation.findUnique.mockResolvedValue(null);

      await expect(service.participate(mockRespondentId, mockResearchId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('harus berhasil memulai partisipasi dan berstatus in_progress jika sudah qualified', async () => {
      prisma.research.findUnique.mockResolvedValue({
        id: mockResearchId,
        status: 'published',
        externalSurveyUrl: 'https://form.example.com',
        estimatedDurationMinutes: 10,
        screeningQuestions: [{ id: 'q1', passThreshold: 5 }],
      });
      prisma.respondentParticipation.findUnique.mockResolvedValue({
        id: mockParticipationId,
        status: 'qualified',
      });
      prisma.respondentParticipation.update.mockResolvedValue({
        id: mockParticipationId,
        status: 'in_progress',
      });

      const res = await service.participate(mockRespondentId, mockResearchId);

      expect(res.status).toBe('in_progress');
      expect(res.external_survey_url).toBe('https://form.example.com');
    });
  });

  // =======================================================================
  // 3. Auto-Screening Signal Tests (TESTING.md requirements)
  // =======================================================================
  describe('submitSurvey (Auto-Screening)', () => {
    it('jawaban bersih (clean) harus masuk status hold dengan holdReleaseAt 24 jam ke depan', async () => {
      prisma.research.findUnique.mockResolvedValue({
        id: mockResearchId,
        estimatedDurationMinutes: 10, // 600 detik -> threshold 30% = 180 detik
      });
      prisma.respondentParticipation.findUnique.mockResolvedValue({
        id: mockParticipationId,
        status: 'in_progress',
      });
      prisma.respondentParticipation.update.mockImplementation(({ data }: any) => ({
        id: mockParticipationId,
        ...data,
      }));

      const res = await service.submitSurvey(mockRespondentId, mockResearchId, {
        duration_seconds: 300, // 5 menit, wajar vs 10 menit
        answers: [
          { answer_value: 'Puas' },
          { answer_value: 'Cukup' },
          { answer_value: 'Sangat Puas' },
        ],
      });

      expect(res.auto_screening_result).toBe('clean');
      expect(res.status).toBe('hold');
      expect(res.hold_release_at).toBeDefined();
      // Verifikasi hold release diset sekitar 24 jam ke depan
      const holdDiffHours =
        (new Date(res.hold_release_at).getTime() - Date.now()) / (1000 * 60 * 60);
      expect(Math.round(holdDiffHours)).toBe(24);
    });

    it('jawaban terlalu cepat (too_fast < 30% estimasi) harus di-flag dan masuk pending_admin_review', async () => {
      prisma.research.findUnique.mockResolvedValue({
        id: mockResearchId,
        estimatedDurationMinutes: 10, // 600 detik -> minimum 180 detik
      });
      prisma.respondentParticipation.findUnique.mockResolvedValue({
        id: mockParticipationId,
        status: 'in_progress',
      });
      prisma.respondentParticipation.update.mockImplementation(({ data }: any) => ({
        id: mockParticipationId,
        ...data,
      }));

      const res = await service.submitSurvey(mockRespondentId, mockResearchId, {
        duration_seconds: 25, // hanya 25 detik untuk survei 10 menit!
      });

      expect(res.auto_screening_result).toBe('flagged');
      expect(res.status).toBe('pending_admin_review');
      expect(res.hold_release_at).toBeNull(); // flagged tidak cair otomatis
      expect(prisma.qualityCheck.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            signalFlags: expect.objectContaining({ too_fast: true }),
          }),
        }),
      );
    });

    it('gagal attention check trap question harus di-flag', async () => {
      prisma.research.findUnique.mockResolvedValue({
        id: mockResearchId,
        estimatedDurationMinutes: 5,
      });
      prisma.respondentParticipation.findUnique.mockResolvedValue({
        id: mockParticipationId,
        status: 'in_progress',
      });
      prisma.respondentParticipation.update.mockImplementation(({ data }: any) => ({
        id: mockParticipationId,
        ...data,
      }));

      const res = await service.submitSurvey(mockRespondentId, mockResearchId, {
        duration_seconds: 200,
        answers: [
          {
            answer_value: 'Setuju', // salah!
            is_attention_check: true,
            expected_answer: 'Sangat Tidak Setuju',
          },
        ],
      });

      expect(res.auto_screening_result).toBe('flagged');
      expect(res.status).toBe('pending_admin_review');
      expect(prisma.qualityCheck.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            signalFlags: expect.objectContaining({ attention_check_failed: true }),
          }),
        }),
      );
    });

    it('straight-lining (5 jawaban identik berturut-turut) harus di-flag', async () => {
      prisma.research.findUnique.mockResolvedValue({
        id: mockResearchId,
        estimatedDurationMinutes: 5,
      });
      prisma.respondentParticipation.findUnique.mockResolvedValue({
        id: mockParticipationId,
        status: 'in_progress',
      });
      prisma.respondentParticipation.update.mockImplementation(({ data }: any) => ({
        id: mockParticipationId,
        ...data,
      }));

      const res = await service.submitSurvey(mockRespondentId, mockResearchId, {
        duration_seconds: 200,
        answers: [
          { answer_value: '5' },
          { answer_value: '5' },
          { answer_value: '5' },
          { answer_value: '5' },
          { answer_value: '5' }, // 5 kali berturut-turut sama
        ],
      });

      expect(res.auto_screening_result).toBe('flagged');
      expect(res.status).toBe('pending_admin_review');
      expect(prisma.qualityCheck.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            signalFlags: expect.objectContaining({ straight_lining: true }),
          }),
        }),
      );
    });
  });

  // =======================================================================
  // 4. Quality Score & Admin Review Tests
  // =======================================================================
  describe('processAdminDecision & Quality Score update', () => {
    it('Admin approve harus mengubah status jadi approved dan menaikkan Quality Score', async () => {
      prisma.respondentParticipation.findUnique.mockResolvedValue({
        id: mockParticipationId,
        status: 'pending_admin_review',
        respondentId: mockRespondentId,
      });
      prisma.qualityScore.findUnique.mockResolvedValue({
        userId: mockRespondentId,
        score: 80.0,
        consecutiveGoodAnswers: 1,
        throttled: false,
      });

      const res = await service.processAdminDecision('admin-uuid-1', mockParticipationId, {
        decision: 'approved',
        note: 'Jawaban diverifikasi sah',
      });

      expect(res.status).toBe('approved');
      expect(prisma.qualityScore.update).toHaveBeenCalledWith({
        where: { userId: mockRespondentId },
        data: {
          score: 82.0, // naik 2 poin
          consecutiveGoodAnswers: 2, // bertambah 1
          throttled: false,
        },
      });
    });

    it('Admin reject harus menurunkan Quality Score (-10), reset consecutive, dan throttle jika skor < 70', async () => {
      prisma.respondentParticipation.findUnique.mockResolvedValue({
        id: mockParticipationId,
        status: 'pending_admin_review',
        respondentId: mockRespondentId,
      });
      prisma.qualityScore.findUnique.mockResolvedValue({
        userId: mockRespondentId,
        score: 75.0, // turun 10 jadi 65 (di bawah threshold 70)
        consecutiveGoodAnswers: 4,
        throttled: false,
      });

      const res = await service.processAdminDecision('admin-uuid-1', mockParticipationId, {
        decision: 'rejected',
        note: 'Bot detected',
      });

      expect(res.status).toBe('rejected');
      expect(prisma.qualityScore.update).toHaveBeenCalledWith({
        where: { userId: mockRespondentId },
        data: {
          score: 65.0, // 75 - 10
          consecutiveGoodAnswers: 0, // di-reset ke 0
          throttled: true, // skor < 70 -> throttled!
        },
      });
    });

    it('Auto-recovery: setelah 5 jawaban baik berturut-turut, throttled kembali jadi false', async () => {
      prisma.respondentParticipation.findUnique.mockResolvedValue({
        id: mockParticipationId,
        status: 'pending_admin_review',
        respondentId: mockRespondentId,
      });
      // Sedang throttled, sudah punya 4 jawaban baik
      prisma.qualityScore.findUnique.mockResolvedValue({
        userId: mockRespondentId,
        score: 68.0,
        consecutiveGoodAnswers: 4,
        throttled: true,
      });

      await service.processAdminDecision('admin-uuid-1', mockParticipationId, {
        decision: 'approved',
      });

      expect(prisma.qualityScore.update).toHaveBeenCalledWith({
        where: { userId: mockRespondentId },
        data: {
          score: 70.0, // 68 + 2
          consecutiveGoodAnswers: 5, // mencapai 5
          throttled: false, // auto-recovery berhasil!
        },
      });
    });
  });

  // =======================================================================
  // 5. Hold 24-hour Release Job
  // =======================================================================
  describe('releaseHoldParticipations', () => {
    it('harus memproses partisipasi hold yang waktunya sudah lewat menjadi approved', async () => {
      const pastDate = new Date(Date.now() - 3600000); // 1 jam yang lalu
      prisma.respondentParticipation.findMany.mockResolvedValue([
        { id: 'part-1', respondentId: 'user-1', status: 'hold', holdReleaseAt: pastDate },
      ]);
      prisma.qualityScore.findUnique.mockResolvedValue({
        userId: 'user-1',
        score: 90.0,
        consecutiveGoodAnswers: 1,
        throttled: false,
      });

      const count = await service.releaseHoldParticipations();

      expect(count).toBe(1);
      expect(prisma.respondentParticipation.update).toHaveBeenCalledWith({
        where: { id: 'part-1' },
        data: { status: 'approved' },
      });
    });
  });
});
