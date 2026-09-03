import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { DomicileVerifyDto } from './dto/domicile-verify.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mengambil data profil lengkap user saat ini
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        qualityScore: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    // Hitung saldo token wallet dari append-only ledger
    let walletBalance = 0;
    const wallet = await this.prisma.tokenWallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          select: { amount: true },
        },
      },
    });

    if (wallet && wallet.transactions.length > 0) {
      walletBalance = wallet.transactions.reduce((acc, tx) => acc + tx.amount, 0);
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        status: user.status,
        ageDeclared18plus: user.ageDeclared18plus,
        emailVerifiedAt: user.emailVerifiedAt,
        phoneVerifiedAt: user.phoneVerifiedAt,
        createdAt: user.createdAt,
      },
      profile: user.profile,
      qualityScore: user.qualityScore?.score ?? 100.0,
      walletBalance,
    };
  }

  /**
   * Update data profil (termasuk consent agama & data-share ber-timestamp)
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // Ambil profil saat ini
    const existingProfile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      throw new NotFoundException('Profil pengguna tidak ditemukan');
    }

    const now = new Date();
    let religionConsentAt = existingProfile.religionConsentAt;
    let dataShareConsentAt = existingProfile.dataShareConsentAt;

    // Consent agama (UU PDP): Wajib disetujui jika ingin mengisi atau mengubah kolom religion
    if (dto.religion !== undefined && dto.religion !== null && dto.religion.trim() !== '') {
      if (dto.religion_consent === true) {
        religionConsentAt = now;
      } else if (!religionConsentAt) {
        throw new BadRequestException(
          'Penyimpanan data agama memerlukan persetujuan eksplisit (religion_consent wajib true)',
        );
      }
    } else if (dto.religion_consent === true) {
      religionConsentAt = now;
    }

    // Consent data-share (dibagikan ke researcher via CSV export)
    if (dto.data_share_consent === true) {
      dataShareConsentAt = now;
    }

    // Lakukan pembaruan
    const updatedProfile = await this.prisma.userProfile.update({
      where: { userId },
      data: {
        ...(dto.gender !== undefined && { gender: dto.gender }),
        ...(dto.religion !== undefined && { religion: dto.religion }),
        religionConsentAt,
        ...(dto.domicile_province !== undefined && { domicileProvince: dto.domicile_province }),
        ...(dto.domicile_city !== undefined && { domicileCity: dto.domicile_city }),
        ...(dto.education !== undefined && { education: dto.education }),
        ...(dto.occupation !== undefined && { occupation: dto.occupation }),
        dataShareConsentAt,
      },
    });

    return {
      message: 'Profil berhasil diperbarui',
      profile: updatedProfile,
    };
  }

  /**
   * Verifikasi domisili pengguna berbasis koordinat GPS
   */
  async verifyDomicile(userId: string, dto: DomicileVerifyDto) {
    const existingProfile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      throw new NotFoundException('Profil pengguna tidak ditemukan');
    }

    const now = new Date();
    const updated = await this.prisma.userProfile.update({
      where: { userId },
      data: {
        domicileLat: dto.lat,
        domicileLng: dto.lng,
        domicileVerifiedAt: now,
      },
    });

    return {
      message: 'Domisili berhasil diverifikasi via GPS',
      domicile: {
        lat: updated.domicileLat,
        lng: updated.domicileLng,
        verifiedAt: updated.domicileVerifiedAt,
      },
    };
  }
}
