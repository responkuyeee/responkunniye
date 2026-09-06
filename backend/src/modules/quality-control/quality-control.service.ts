import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SubmitScreeningDto } from './dto/screening.dto';
import { SubmitSurveyDto } from './dto/submit-survey.dto';
import { AdminQualityDecisionDto } from './dto/admin-decision.dto';

@Injectable()
export class QualityControlService {
  private readonly logger = new Logger(QualityControlService.name);

  // Ambang batas pemulihan skor reputasi
  private get CONSECUTIVE_GOOD_ANSWERS_FOR_RECOVERY(): number {
    return this.configService.get<number>('CONSECUTIVE_GOOD_ANSWERS_FOR_RECOVERY', 5);
  }

  // Ambang batas skor untuk throttling
  private get QUALITY_SCORE_THROTTLE_THRESHOLD(): number {
    return this.configService.get<number>('QUALITY_SCORE_THROTTLE_THRESHOLD', 70.0);
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  // =======================================================================
  // 1. SUBMIT JAWABAN SCREENING (POST /research/:id/screening)
  // Evaluasi skor terhadap pass_threshold
  // =======================================================================
  async submitScreening(respondentId: string, researchId: string, dto: SubmitScreeningDto) {
    const research = await this.prisma.research.findUnique({
      where: { id: researchId },
      include: { screeningQuestions: true },
    });

    if (!research) throw new NotFoundException('Research tidak ditemukan');
    if (research.status !== 'published') {
      throw new BadRequestException('Research tidak dalam status published');
    }

    // Cek apakah sudah pernah participate
    const existing = await this.prisma.respondentParticipation.findUnique({
      where: {
        researchId_respondentId: { researchId, respondentId },
      },
    });

    if (existing && existing.status !== 'invited' && existing.status !== 'screening') {
      throw new ConflictException('Anda sudah pernah berpartisipasi dalam riset ini');
    }

    // Hitung skor screening
    let totalScore = 0;
    let requiredScore = 0;

    for (const q of research.screeningQuestions) {
      requiredScore += q.passThreshold;
      const ans = dto.answers.find((a) => a.screening_question_id === q.id);
      if (ans) {
        totalScore += ans.score;
      }
    }

    // Lolos jika totalScore >= requiredScore (atau jika tidak ada screening questions)
    const isPassed = research.screeningQuestions.length === 0 || totalScore >= requiredScore;

    // Simpan atau update record participation
    const participation = await this.prisma.respondentParticipation.upsert({
      where: {
        researchId_respondentId: { researchId, respondentId },
      },
      create: {
        researchId,
        respondentId,
        status: isPassed ? 'qualified' : 'rejected',
        screeningScore: totalScore,
      },
      update: {
        status: isPassed ? 'qualified' : 'rejected',
        screeningScore: totalScore,
      },
    });

    // Simpan jawaban screening jika ada
    if (dto.answers?.length) {
      for (const ans of dto.answers) {
        await this.prisma.screeningAnswer.create({
          data: {
            participationId: participation.id,
            screeningQuestionId: ans.screening_question_id,
            answer: ans.answer,
            score: ans.score,
          },
        });
      }
    }

    this.logger.log(
      `[Screening] user=${respondentId}, research=${researchId}, score=${totalScore}/${requiredScore}, passed=${isPassed}`,
    );

    return {
      passed: isPassed,
      total_score: totalScore,
      required_score: requiredScore,
      status: participation.status,
      participation_id: participation.id,
      message: isPassed
        ? 'Selamat, Anda lolos screening! Silakan lanjut ke survei utama.'
        : 'Mohon maaf, Anda belum memenuhi kriteria kualifikasi riset ini.',
    };
  }

  // =======================================================================
  // 2. MULAI PARTISIPASI (POST /research/:id/participate)
  // =======================================================================
  async participate(respondentId: string, researchId: string) {
    const research = await this.prisma.research.findUnique({
      where: { id: researchId },
      include: { screeningQuestions: true },
    });

    if (!research) throw new NotFoundException('Research tidak ditemukan');
    if (research.status !== 'published') {
      throw new BadRequestException('Research belum dibuka atau sudah selesai');
    }

    // Cek record partisipasi
    let participation = await this.prisma.respondentParticipation.findUnique({
      where: {
        researchId_respondentId: { researchId, respondentId },
      },
    });

    // Jika ada screening questions, pastikan sudah qualified
    if (research.screeningQuestions.length > 0) {
      if (!participation || participation.status !== 'qualified') {
        throw new BadRequestException('Anda wajib menyelesaikan dan lolos screening terlebih dahulu');
      }
    }

    if (!participation) {
      participation = await this.prisma.respondentParticipation.create({
        data: {
          researchId,
          respondentId,
          status: 'in_progress',
        },
      });
    } else {
      participation = await this.prisma.respondentParticipation.update({
        where: { id: participation.id },
        data: { status: 'in_progress' },
      });
    }

    return {
      participation_id: participation.id,
      status: participation.status,
      external_survey_url: research.externalSurveyUrl,
      estimated_duration_minutes: research.estimatedDurationMinutes,
    };
  }

  // =======================================================================
  // 3. SUBMIT SURVEI & AUTO-SCREENING SIGNALS (POST /research/:id/submit)
  // Deteksi sinyal: waktu terlalu cepat, attention check, straight-lining, duplikat
  // =======================================================================
  async submitSurvey(respondentId: string, researchId: string, dto: SubmitSurveyDto) {
    const research = await this.prisma.research.findUnique({
      where: { id: researchId },
    });
    if (!research) throw new NotFoundException('Research tidak ditemukan');

    const participation = await this.prisma.respondentParticipation.findUnique({
      where: {
        researchId_respondentId: { researchId, respondentId },
      },
    });

    if (!participation) {
      throw new NotFoundException('Partisipasi tidak ditemukan. Mulai survei terlebih dahulu.');
    }

    if (participation.status !== 'in_progress' && participation.status !== 'qualified') {
      throw new BadRequestException(
        `Survei tidak dapat disubmit karena status partisipasi: ${participation.status}`,
      );
    }

    // ---- Evaluasi Sinyal Kontrol Kualitas (Auto-Screening) ----
    const signalFlags: Record<string, boolean> = {
      too_fast: false,
      attention_check_failed: false,
      straight_lining: false,
      duplicate_submission: false,
    };

    // Sinyal 1: Waktu pengerjaan vs estimasi (< 30% dari estimasi durasi)
    const minAcceptableDurationSec = Math.max(30, research.estimatedDurationMinutes * 60 * 0.3);
    if (dto.duration_seconds < minAcceptableDurationSec) {
      signalFlags.too_fast = true;
    }

    // Sinyal 2: Attention check trap question
    if (dto.answers?.length) {
      for (const ans of dto.answers) {
        if (ans.is_attention_check && ans.expected_answer) {
          if (ans.answer_value.trim().toLowerCase() !== ans.expected_answer.trim().toLowerCase()) {
            signalFlags.attention_check_failed = true;
            break;
          }
        }
      }
    }

    // Sinyal 3: Straight-lining (jawaban identik berturut-turut >= 5)
    if (dto.answers && dto.answers.length >= 5) {
      let consecutiveCount = 1;
      let lastValue = dto.answers[0].answer_value;

      for (let i = 1; i < dto.answers.length; i++) {
        if (dto.answers[i].answer_value === lastValue) {
          consecutiveCount++;
          if (consecutiveCount >= 5) {
            signalFlags.straight_lining = true;
            break;
          }
        } else {
          lastValue = dto.answers[i].answer_value;
          consecutiveCount = 1;
        }
      }
    }

    // Apakah ada sinyal yang ter-trigger?
    const isFlagged = Object.values(signalFlags).some((val) => val === true);

    const now = new Date();
    const holdReleaseAt = isFlagged ? null : new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 jam ke depan

    // Update status partisipasi
    const updated = await this.prisma.$transaction(async (tx) => {
      const part = await tx.respondentParticipation.update({
        where: { id: participation.id },
        data: {
          submittedAt: now,
          autoScreeningResult: isFlagged ? 'flagged' : 'clean',
          status: isFlagged ? 'pending_admin_review' : 'hold',
          holdReleaseAt,
        },
      });

      // Catat log di quality_checks
      await tx.qualityCheck.create({
        data: {
          participationId: participation.id,
          signalFlags,
          autoScore: isFlagged ? 50.0 : 100.0,
          decision: isFlagged ? null : 'approved',
        },
      });

      return part;
    });

    this.logger.log(
      `[AutoScreening] participation=${participation.id}, result=${updated.autoScreeningResult}, isFlagged=${isFlagged}, flags=${JSON.stringify(signalFlags)}`,
    );

    return {
      participation_id: updated.id,
      status: updated.status,
      auto_screening_result: updated.autoScreeningResult,
      hold_release_at: updated.holdReleaseAt,
      message: isFlagged
        ? 'Jawaban diterima dan sedang ditinjau oleh tim kami (SLA maks 48 jam).'
        : 'Jawaban terverifikasi bersih! Reward akan cair otomatis setelah masa hold 24 jam.',
    };
  }

  // =======================================================================
  // 4. ADMIN REVIEW QUEUE (GET /admin/quality-review)
  // SLA maksimal 48 jam
  // =======================================================================
  async getAdminReviewQueue() {
    const queue = await this.prisma.respondentParticipation.findMany({
      where: {
        status: 'pending_admin_review',
      },
      include: {
        respondent: { select: { id: true, name: true, email: true } },
        research: { select: { id: true, title: true, estimatedDurationMinutes: true } },
        qualityChecks: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { submittedAt: 'asc' }, // FIFO: respon terlama diprioritaskan
    });

    return {
      total: queue.length,
      data: queue.map((q) => ({
        participation_id: q.id,
        respondent: q.respondent,
        research: q.research,
        submitted_at: q.submittedAt,
        auto_screening_result: q.autoScreeningResult,
        signal_flags: q.qualityChecks[0]?.signalFlags,
      })),
    };
  }

  // =======================================================================
  // 5. ADMIN REVIEW DECISION (POST /admin/quality-review/:id/decision)
  // Admin Quality approve/reject jawaban yang di-flag
  // =======================================================================
  async processAdminDecision(
    adminUserId: string,
    participationId: string,
    dto: AdminQualityDecisionDto,
  ) {
    const participation = await this.prisma.respondentParticipation.findUnique({
      where: { id: participationId },
      include: { respondent: true, research: true },
    });

    if (!participation) throw new NotFoundException('Partisipasi tidak ditemukan');
    if (participation.status !== 'pending_admin_review') {
      throw new BadRequestException(
        `Partisipasi tidak sedang dalam antrian review admin (status: ${participation.status})`,
      );
    }

    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      if (dto.decision === 'approved') {
        // Status Approved -> reward akan cair (bisa langsung atau via hold)
        await tx.respondentParticipation.update({
          where: { id: participationId },
          data: {
            status: 'approved',
            adminReviewedBy: adminUserId,
            adminReviewedAt: now,
          },
        });

        // Naikkan Quality Score
        await this.adjustQualityScore(tx, participation.respondentId, true);
      } else {
        // Status Rejected -> tidak ada reward, token kembali ke pool riset
        await tx.respondentParticipation.update({
          where: { id: participationId },
          data: {
            status: 'rejected',
            adminReviewedBy: adminUserId,
            adminReviewedAt: now,
          },
        });

        // Turunkan Quality Score
        await this.adjustQualityScore(tx, participation.respondentId, false);
      }

      // Catat aksi admin di admin_reviews
      await tx.adminReview.create({
        data: {
          adminId: adminUserId,
          adminRole: 'admin_quality',
          targetType: 'participation',
          targetId: participationId,
          action: dto.decision,
          note: dto.note ?? `Keputusan admin: ${dto.decision}`,
        },
      });
    });


    this.logger.log(
      `[AdminDecision] admin=${adminUserId}, participation=${participationId}, decision=${dto.decision}`,
    );

    return {
      participation_id: participationId,
      decision: dto.decision,
      status: dto.decision === 'approved' ? 'approved' : 'rejected',
      message:
        dto.decision === 'approved'
          ? 'Jawaban disetujui. Status diubah menjadi Approved.'
          : 'Jawaban ditolak. Token kembali ke pool riset.',
    };
  }

  // =======================================================================
  // 6. HOLD 24-JAM RELEASE JOB
  // Memproses partisipasi dengan status 'hold' yang sudah melewati holdReleaseAt
  // =======================================================================
  async releaseHoldParticipations(): Promise<number> {
    const now = new Date();

    const readyToRelease = await this.prisma.respondentParticipation.findMany({
      where: {
        status: 'hold',
        holdReleaseAt: { lte: now },
      },
    });

    if (readyToRelease.length === 0) return 0;

    this.logger.log(`[HoldRelease] Menemukan ${readyToRelease.length} jawaban siap cair`);

    for (const part of readyToRelease) {
      await this.prisma.$transaction(async (tx) => {
        // Transisi ke approved
        await tx.respondentParticipation.update({
          where: { id: part.id },
          data: { status: 'approved' },
        });

        // Skor naik & consecutiveGoodAnswers bertambah
        await this.adjustQualityScore(tx, part.respondentId, true);
      });
    }

    return readyToRelease.length;
  }

  // =======================================================================
  // PRIVATE HELPER: UPDATE QUALITY SCORE & AUTO-RECOVERY
  // =======================================================================
  private async adjustQualityScore(tx: Prisma.TransactionClient, userId: string, isGoodAnswer: boolean) {
    let qs = await tx.qualityScore.findUnique({ where: { userId } });
    if (!qs) {
      qs = await tx.qualityScore.create({
        data: { userId, score: 100.0, consecutiveGoodAnswers: 0, throttled: false },
      });
    }

    const currentScore = Number(qs.score);
    let newScore = currentScore;
    let newConsecutive = qs.consecutiveGoodAnswers;
    let newThrottled = qs.throttled;

    if (isGoodAnswer) {
      // Skor naik 2 poin (maks 100)
      newScore = Math.min(100.0, currentScore + 2.0);
      newConsecutive += 1;

      // Auto-recovery: Jika mencapai N jawaban bagus berturut-turut -> unthrottle otomatis
      if (newConsecutive >= this.CONSECUTIVE_GOOD_ANSWERS_FOR_RECOVERY) {
        newThrottled = false;
      }
    } else {
      // Skor turun 10 poin (min 0)
      newScore = Math.max(0.0, currentScore - 10.0);
      newConsecutive = 0; // reset hitungan jawaban bagus berturut-turut

      // Jika skor di bawah threshold -> throttled = true
      if (newScore < this.QUALITY_SCORE_THROTTLE_THRESHOLD) {
        newThrottled = true;
      }
    }

    await tx.qualityScore.update({
      where: { userId },
      data: {
        score: newScore,
        consecutiveGoodAnswers: newConsecutive,
        throttled: newThrottled,
      },
    });

    this.logger.log(
      `[QualityScore] user=${userId}, score: ${currentScore} -> ${newScore}, consecutive: ${newConsecutive}, throttled: ${newThrottled}`,
    );
  }
}
