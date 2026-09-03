import { Test, TestingModule } from '@nestjs/testing';
import { RewardService } from './reward.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('RewardService', () => {
  let service: RewardService;
  let prisma: any;

  const mockParticipationId = 'part-uuid-1';
  const mockRespondentId = 'resp-uuid-1';

  beforeEach(async () => {
    prisma = {
      respondentParticipation: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      reward: {
        create: jest.fn(),
      },
      tokenWallet: {
        create: jest.fn(),
      },
      tokenTransaction: {
        create: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<RewardService>(RewardService);
  });

  // =======================================================================
  // Requirement 1: Reward tidak pernah dibuat sebelum status Approved
  // =======================================================================
  it('harus menolak pembuatan reward jika status partisipasi belum Approved (mis. in_progress, hold, rejected)', async () => {
    prisma.respondentParticipation.findUnique.mockResolvedValue({
      id: mockParticipationId,
      status: 'hold', // belum approved
      reward: null,
      respondent: { id: mockRespondentId, tokenWallet: { id: 'w1' } },
    });

    await expect(service.createRewardForParticipation(mockParticipationId)).rejects.toThrow(
      BadRequestException,
    );

    // Pastikan reward.create TIDAK pernah dipanggil
    expect(prisma.reward.create).not.toHaveBeenCalled();
  });

  // =======================================================================
  // Requirement 2: Reward tidak bisa dibuat dua kali (UNIQUE constraint)
  // =======================================================================
  it('harus menolak (ConflictException) jika reward sudah pernah dibuat untuk partisipasi yang sama', async () => {
    prisma.respondentParticipation.findUnique.mockResolvedValue({
      id: mockParticipationId,
      status: 'approved',
      reward: { id: 'existing-reward-uuid' }, // sudah ada reward
      respondent: { id: mockRespondentId, tokenWallet: { id: 'w1' } },
    });

    await expect(service.createRewardForParticipation(mockParticipationId)).rejects.toThrow(
      ConflictException,
    );
    expect(prisma.reward.create).not.toHaveBeenCalled();
  });

  // =======================================================================
  // Requirement 3: Split tepat 80:20 (0.8 dan 0.2 token)
  // =======================================================================
  it('harus berhasil membuat reward dengan split 80:20 (0.8 respondent : 0.2 platform) saat status Approved', async () => {
    prisma.respondentParticipation.findUnique.mockResolvedValue({
      id: mockParticipationId,
      status: 'approved',
      researchId: 'res-1',
      respondentId: mockRespondentId,
      reward: null,
      respondent: { id: mockRespondentId, tokenWallet: { id: 'w1' } },
    });

    prisma.reward.create.mockResolvedValue({
      id: 'new-reward-uuid',
      participationId: mockParticipationId,
      respondentTokenAmount: 0.8,
      platformTokenAmount: 0.2,
      status: 'paid',
      paidAt: new Date(),
    });

    const res = await service.createRewardForParticipation(mockParticipationId);

    expect(res.status).toBe('paid');
    expect(res.respondent_token_amount).toBe(0.8);
    expect(res.platform_token_amount).toBe(0.2);
    expect(prisma.reward.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        respondentTokenAmount: 0.8,
        platformTokenAmount: 0.2,
        status: 'paid',
      }),
    });
  });
});
