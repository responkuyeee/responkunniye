import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RewardService {
  private readonly logger = new Logger(RewardService.name);

  // Split reward sesuai PRD.md & skill.md: 80% Respondent : 20% Platform
  readonly RESPONDENT_SPLIT_DECIMAL = 0.8;
  readonly PLATFORM_SPLIT_DECIMAL = 0.2;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Membuat reward untuk partisipasi riset.
   * ATURAN KRITIS (PRD.md & TESTING.md):
   * 1. Reward HANYA boleh dibuat ketika RespondentParticipation.status = 'approved'.
   * 2. Reward TIDAK BISA dibuat dua kali untuk partisipasi yang sama (UNIQUE constraint).
   */
  async createRewardForParticipation(participationId: string) {
    const participation = await this.prisma.respondentParticipation.findUnique({
      where: { id: participationId },
      include: {
        reward: true,
        respondent: { include: { tokenWallet: true } },
      },
    });

    if (!participation) {
      throw new NotFoundException('Partisipasi tidak ditemukan');
    }

    // Guard 1: Status WAJIB 'approved'
    if (participation.status !== 'approved') {
      throw new BadRequestException(
        `Reward tidak dapat dibuat karena status partisipasi adalah "${participation.status}". Reward hanya dapat dibuat jika status Approved.`,
      );
    }

    // Guard 2: Cegah double reward (UNIQUE constraint)
    if (participation.reward) {
      throw new ConflictException(
        `Reward sudah pernah dibuat untuk partisipasi ini (Reward ID: ${participation.reward.id})`,
      );
    }

    const now = new Date();

    // Buat reward dan update partisipasi secara atomik
    const result = await this.prisma.$transaction(async (tx) => {
      // Create Reward record
      const reward = await tx.reward.create({
        data: {
          participationId,
          respondentTokenAmount: this.RESPONDENT_SPLIT_DECIMAL,
          platformTokenAmount: this.PLATFORM_SPLIT_DECIMAL,
          status: 'paid',
          paidAt: now,
        },
      });

      // Update rewarded_at di respondent_participations
      await tx.respondentParticipation.update({
        where: { id: participationId },
        data: {
          rewardedAt: now,
          status: 'rewarded',
        },
      });

      // Kreditkan token ke wallet responden jika wallet ada
      let wallet = participation.respondent.tokenWallet;
      if (!wallet) {
        wallet = await tx.tokenWallet.create({
          data: { userId: participation.respondentId },
        });
      }

      // Catat di ledger token_transactions (1 token reward)
      await tx.tokenTransaction.create({
        data: {
          walletId: wallet.id,
          participationId,
          researchId: participation.researchId,
          type: 'consume',
          amount: 1, // 1 token dikreditkan ke saldo responden
          idempotencyKey: `reward-part-${participationId}`,
        },
      });

      return reward;
    });

    this.logger.log(
      `[Reward] Sukses membuat reward: participation=${participationId}, respondent=${participation.respondentId}, split=${this.RESPONDENT_SPLIT_DECIMAL}:${this.PLATFORM_SPLIT_DECIMAL}`,
    );

    return {
      reward_id: result.id,
      participation_id: participationId,
      respondent_token_amount: Number(result.respondentTokenAmount),
      platform_token_amount: Number(result.platformTokenAmount),
      status: result.status,
      paid_at: result.paidAt,
    };
  }
}
