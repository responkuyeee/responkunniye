import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from '../token-wallet/wallet.service';
import { CreateResearchDto } from './dto/create-research.dto';
// Status research sesuai DATABASE_SCHEMA.md
type ResearchStatus = 'draft' | 'published' | 'completed' | 'cancelled';


// Field profil yang bisa dijadikan kriteria filter
const ALLOWED_CRITERION_FIELDS = [
  'gender',
  'domicile_province',
  'domicile_city',
  'education',
  'occupation',
  'religion',
  'age_min',
  'age_max',
];

// Daftar kata terlarang untuk filter konten otomatis saat submit research
const PROHIBITED_KEYWORDS = [
  'judi',
  'slot',
  'gacor',
  'taruhan',
  'porn',
  'bokep',
  'penipuan',
  'narkoba',
  'cheat',
  'scam',
];

@Injectable()
export class ResearchService {
  private readonly logger = new Logger(ResearchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
  ) {}

  // =======================================================================
  // BUAT RESEARCH (draft)
  // Validasi: target >= 50, criteria field harus valid, keyword filter otomatis
  // =======================================================================
  async createResearch(researcherId: string, dto: CreateResearchDto) {
    // Defense-in-depth: validasi minimum responden (sudah ada di DTO, ini guard kedua)
    if (dto.target_respondent_count < 50) {
      throw new BadRequestException('target_respondent_count minimal 50 responden (aturan bisnis)');
    }

    // Keyword filter otomatis untuk mendeteksi konten terlarang
    this.checkProhibitedKeywords(dto.title, dto.description);

    // Validasi fields kriteria
    if (dto.criteria?.length) {
      for (const c of dto.criteria) {
        if (!ALLOWED_CRITERION_FIELDS.includes(c.field)) {
          throw new BadRequestException(
            `Field kriteria tidak dikenali: "${c.field}". Field yang valid: ${ALLOWED_CRITERION_FIELDS.join(', ')}`,
          );
        }
      }
    }


    const research = await this.prisma.research.create({
      data: {
        researcherId,
        title: dto.title,
        description: dto.description,
        externalSurveyUrl: dto.external_survey_url,
        targetRespondentCount: dto.target_respondent_count,
        estimatedDurationMinutes: dto.estimated_duration_minutes,
        deadline: new Date(dto.deadline),
        status: 'draft',
        criteria: dto.criteria?.length
          ? { create: dto.criteria.map((c) => ({ field: c.field, operator: c.operator, value: c.value })) }
          : undefined,
        screeningQuestions: dto.screening_questions?.length
          ? {
              create: dto.screening_questions.map((q) => ({
                questionText: q.question_text,
                scoringWeight: q.scoring_weight,
                passThreshold: q.pass_threshold,
              })),
            }
          : undefined,
      },
      include: { criteria: true, screeningQuestions: true },
    });

    this.logger.log(`[Research] Dibuat: id=${research.id}, researcher=${researcherId}, target=${dto.target_respondent_count}`);

    return {
      id: research.id,
      status: research.status,
      title: research.title,
      target_respondent_count: research.targetRespondentCount,
      estimated_cost_token: research.targetRespondentCount, // 1 token/responden
      estimated_cost_idr: research.targetRespondentCount * 1000, // Rp1.000/token
      criteria: research.criteria,
      screening_questions: research.screeningQuestions,
      created_at: research.createdAt,
    };
  }

  // =======================================================================
  // PUBLISH RESEARCH — Auto, tanpa review admin
  // Syarat: status=draft, saldo token mencukupi (= target_respondent_count)
  // =======================================================================
  async publishResearch(researcherId: string, researchId: string) {
    const research = await this.prisma.research.findUnique({
      where: { id: researchId },
    });

    if (!research) throw new NotFoundException('Research tidak ditemukan');
    if (research.researcherId !== researcherId) {
      throw new ForbiddenException('Anda bukan pemilik research ini');
    }
    if (research.status !== 'draft') {
      throw new BadRequestException(`Research tidak bisa di-publish karena status saat ini: ${research.status}`);
    }

    // Validasi saldo dan reserve token secara atomik
    const idempotencyKey = `reserve-${researchId}-${researcherId}`;

    // Cek idempotency: sudah pernah di-publish?
    const existingReserve = await this.prisma.tokenTransaction.findFirst({
      where: { idempotencyKey, type: 'reserve' },
    });
    if (existingReserve) {
      throw new BadRequestException('Research ini sudah pernah di-publish');
    }

    // Reserve token (akan throw BadRequestException jika saldo tidak cukup)
    await this.walletService.reserveTokens(researcherId, {
      research_id: researchId,
      amount: research.targetRespondentCount,
    });

    // Update status research menjadi published
    const updated = await this.prisma.research.update({
      where: { id: researchId },
      data: { status: 'published', publishedAt: new Date() },
    });

    this.logger.log(
      `[Research] Published: id=${researchId}, reserved=${research.targetRespondentCount} token`,
    );

    return {
      id: updated.id,
      status: updated.status,
      published_at: updated.publishedAt,
      tokens_reserved: research.targetRespondentCount,
      message: 'Research berhasil di-publish. Responden yang sesuai profil akan melihat research ini.',
    };
  }

  // =======================================================================
  // CANCEL RESEARCH — Refund sisa token yang belum ter-consume
  // =======================================================================
  async cancelResearch(researcherId: string, researchId: string) {
    const research = await this.prisma.research.findUnique({
      where: { id: researchId },
    });

    if (!research) throw new NotFoundException('Research tidak ditemukan');
    if (research.researcherId !== researcherId) {
      throw new ForbiddenException('Anda bukan pemilik research ini');
    }
    if (research.status === 'cancelled' || research.status === 'completed') {
      throw new BadRequestException(`Research sudah berstatus ${research.status}, tidak bisa dibatalkan`);
    }

    // Hitung sisa token yang belum ter-consume
    const consumedResult = await this.prisma.tokenTransaction.aggregate({
      where: { researchId, type: 'consume' },
      _sum: { amount: true },
    });
    const totalConsumed = Math.abs(consumedResult._sum.amount ?? 0);
    const totalReserved = research.targetRespondentCount;
    const refundAmount = totalReserved - totalConsumed;

    await this.prisma.$transaction(async (tx) => {
      // Update status
      await tx.research.update({
        where: { id: researchId },
        data: { status: 'cancelled' },
      });

      // Refund hanya sisa yang belum ter-consume
      if (refundAmount > 0) {
        await this.walletService.refundTokens(researcherId, {
          research_id: researchId,
          amount: refundAmount,
          idempotency_key: `refund-cancel-${researchId}`,
        });
      }
    });

    this.logger.log(`[Research] Cancelled: id=${researchId}, refund=${refundAmount} token`);

    return {
      id: researchId,
      status: 'cancelled',
      refunded_tokens: refundAmount,
      consumed_tokens: totalConsumed,
      message: `Research dibatalkan. ${refundAmount} token dikembalikan ke wallet Anda.`,
    };
  }

  // =======================================================================
  // GET DETAIL RESEARCH
  // =======================================================================
  async getResearchDetail(researchId: string) {
    const research = await this.prisma.research.findUnique({
      where: { id: researchId },
      include: { criteria: true, screeningQuestions: true },
    });
    if (!research) throw new NotFoundException('Research tidak ditemukan');
    return research;
  }

  // =======================================================================
  // GET LIST RESEARCH TERSEDIA (auto-filter sesuai profil respondent)
  // Filter: status=published, deadline belum lewat, profil respondent cocok
  // =======================================================================
  async getAvailableResearch(respondentId: string) {
    // Ambil profil respondent dan quality score
    const [profile, qualityScore] = await Promise.all([
      this.prisma.userProfile.findUnique({ where: { userId: respondentId } }),
      this.prisma.qualityScore.findUnique({ where: { userId: respondentId } }),
    ]);

    // Respondent dengan quality score throttled tidak muncul dalam listing
    if (qualityScore?.throttled) {
      this.logger.log(`[Research] Listing difilter: respondent=${respondentId} throttled=true`);
      return {
        data: [],
        message: 'Akses listing research dibatasi karena quality score di bawah threshold. Jawab beberapa research lagi untuk membuka akses.',
      };
    }

    // Ambil semua research published yang deadline-nya belum lewat
    const allPublished = await this.prisma.research.findMany({
      where: {
        status: 'published',
        deadline: { gte: new Date() },
      },
      include: {
        criteria: true,
        _count: { select: { participations: true } },
      },
      orderBy: { publishedAt: 'desc' },
    });

    // Filter berdasarkan kriteria profil responden
    const filtered = allPublished.filter((r) => {
      if (!r.criteria.length) return true; // tidak ada filter = semua bisa masuk

      return r.criteria.every((criterion) => {
        if (!profile) return false; // tidak punya profil = tidak lolos kriteria apapun

        const profileValue = (profile as any)[this.mapCriterionField(criterion.field)];

        switch (criterion.operator) {
          case 'eq':
            return String(profileValue) === criterion.value;
          case 'in':
            return criterion.value.split(',').map((v) => v.trim()).includes(String(profileValue));
          // age_min / age_max bisa diekspansi di sini jika ada kolom tanggal_lahir
          default:
            return true;
        }
      });
    });

    // Sudah pernah participate? Hapus dari list
    const userParticipations = await this.prisma.respondentParticipation.findMany({
      where: { respondentId },
      select: { researchId: true },
    });
    const participatedIds = new Set(userParticipations.map((p) => p.researchId));

    const result = filtered
      .filter((r) => !participatedIds.has(r.id))
      .map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        estimated_duration_minutes: r.estimatedDurationMinutes,
        reward_token: 1, // per responden
        reward_idr: 1000,
        deadline: r.deadline,
        slot_available: r.targetRespondentCount - r._count.participations,
        published_at: r.publishedAt,
      }));

    return { data: result, total: result.length };
  }

  // Helper cek kata terlarang (content moderation otomatis)
  private checkProhibitedKeywords(title: string, description: string) {
    const combined = `${title} ${description}`.toLowerCase();
    for (const keyword of PROHIBITED_KEYWORDS) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(combined)) {
        throw new BadRequestException(
          `Konten research mengandung kata terlarang ("${keyword}"). Research tidak dapat dibuat.`,
        );
      }
    }
  }


  // Helper mapping field nama DTO ke kolom Prisma UserProfile
  private mapCriterionField(field: string): string {
    const map: Record<string, string> = {
      gender: 'gender',
      domicile_province: 'domicileProvince',
      domicile_city: 'domicileCity',
      education: 'education',
      occupation: 'occupation',
      religion: 'religion',
    };
    return map[field] ?? field;
  }

  /**
   * Eskalasi Penalti Konten (Researcher) sesuai PRD.md §6 & skill.md:
   * Pelanggaran 1: Warning + Takedown research (refund sisa token)
   * Pelanggaran 2: Suspend sementara 1 x 24 jam (24 jam)
   * Pelanggaran 3: Ban permanen
   */
  readonly CONTENT_VIOLATION_SUSPEND_HOURS = 24;

  async takedownResearch(adminId: string, researchId: string, violationNote: string) {
    const research = await this.prisma.research.findUnique({
      where: { id: researchId },
      include: { researcher: true, participations: true },
    });

    if (!research) {
      throw new NotFoundException('Riset tidak ditemukan');
    }

    const researcherId = research.researcherId;

    // Hitung riwayat pelanggaran sebelumnya dari audit trail admin_reviews
    const previousViolations = await this.prisma.adminReview.count({
      where: {
        targetType: 'research_content_violation',
        note: { contains: researcherId },
      },
    });

    const violationNumber = previousViolations + 1;
    let actionTaken = '';

    if (violationNumber === 1) {
      actionTaken = 'warning_and_takedown';
    } else if (violationNumber === 2) {
      actionTaken = `suspended_${this.CONTENT_VIOLATION_SUSPEND_HOURS}h`;
      await this.prisma.user.update({
        where: { id: researcherId },
        data: { status: 'suspended' },
      });
    } else {
      actionTaken = 'banned_permanent';
      await this.prisma.user.update({
        where: { id: researcherId },
        data: { status: 'banned' },
      });
    }

    // Takedown riset
    await this.prisma.research.update({
      where: { id: researchId },
      data: { status: 'rejected' },
    });

    // Refund sisa token jika riset berstatus active
    const consumedTokens = research.participations.filter(
      (p) => p.status === 'approved' || p.status === 'rewarded',
    ).length;
    const tokensToRefund = research.targetRespondentCount - consumedTokens;

    if (tokensToRefund > 0 && research.status === 'active') {
      try {
        await this.walletService.refundTokens(researcherId, {
          research_id: researchId,
          amount: tokensToRefund,
          idempotency_key: `takedown-refund-${researchId}`,
        });
      } catch (err) {
        this.logger.warn(`Gagal refund token saat takedown riset: ${err.message}`);
      }

    }

    // Catat di tabel admin_reviews sebagai audit trail
    await this.prisma.adminReview.create({
      data: {
        adminId,
        adminRole: 'admin_quality',
        targetType: 'research_content_violation',
        targetId: researchId,
        action: actionTaken,
        note: `Researcher: ${researcherId}. Alasan: ${violationNote}. Pelanggaran ke-${violationNumber}`,
      },
    });

    return {
      research_id: researchId,
      researcher_id: researcherId,
      violation_number: violationNumber,
      action_taken: actionTaken,
      suspend_hours: violationNumber === 2 ? this.CONTENT_VIOLATION_SUSPEND_HOURS : 0,
      tokens_refunded: tokensToRefund,
      message: `Riset berhasil di-takedown. Tindakan: ${actionTaken} (Pelanggaran ke-${violationNumber}).`,
    };
  }
}

