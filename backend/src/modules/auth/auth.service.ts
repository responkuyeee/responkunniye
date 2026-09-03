import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { OtpService } from './otp.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registrasi akun baru
   */
  async register(dto: RegisterDto) {
    if (!dto.age_declared_18plus) {
      throw new BadRequestException('Pendaftar wajib menyatakan berumur 18 tahun atau lebih (age_declared_18plus)');
    }

    const email = dto.email.toLowerCase().trim();
    const phone = dto.phone.trim();

    // Cek duplikasi email & nomor telepon
    const existingEmail = await this.prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      throw new ConflictException('Email sudah terdaftar di sistem');
    }

    const existingPhone = await this.prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      throw new ConflictException('Nomor telepon sudah terdaftar di sistem');
    }

    // Hash password dengan bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    // Buat user, profil, wallet, dan skor reputasi awal dalam transaksi
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          phone,
          passwordHash,
          name: dto.name.trim(),
          ageDeclared18plus: true,
          status: 'active',
        },
      });

      // Profil kosong
      await tx.userProfile.create({
        data: {
          userId: newUser.id,
        },
      });

      // Wallet awal (append-only ledger basis)
      await tx.tokenWallet.create({
        data: {
          userId: newUser.id,
        },
      });

      // Skor kualitas awal (100.00)
      await tx.qualityScore.create({
        data: {
          userId: newUser.id,
          score: 100.0,
          consecutiveGoodAnswers: 0,
        },
      });

      return newUser;
    });

    // Kirim OTP verifikasi ke email dan nomor telepon
    await this.otpService.sendOtp(user.email, 'email');
    await this.otpService.sendOtp(user.phone, 'phone');

    return {
      message: 'Registrasi berhasil. Kode verifikasi OTP telah dikirimkan ke email dan nomor telepon Anda.',
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        ageDeclared18plus: user.ageDeclared18plus,
        status: user.status,
      },
    };
  }

  /**
   * Verifikasi OTP untuk email atau nomor HP
   */
  async verifyOtp(dto: VerifyOtpDto) {
    const target = dto.target.trim();

    // Verifikasi kode via OtpService
    this.otpService.verifyOtp(target, dto.code);

    const isEmail = target.includes('@');

    const user = await this.prisma.user.findFirst({
      where: isEmail ? { email: target.toLowerCase() } : { phone: target },
    });

    if (!user) {
      throw new NotFoundException(`Akun dengan ${isEmail ? 'email' : 'nomor telepon'} tersebut tidak ditemukan`);
    }

    const now = new Date();
    await this.prisma.user.update({
      where: { id: user.id },
      data: isEmail ? { emailVerifiedAt: now } : { phoneVerifiedAt: now },
    });

    return {
      message: `Verifikasi ${isEmail ? 'email' : 'nomor telepon'} berhasil`,
      verified: true,
      target,
    };
  }

  /**
   * Login pengguna & penerbitan JWT
   */
  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau password tidak valid');
    }

    if (user.status === 'suspended' || user.status === 'banned') {
      throw new UnauthorizedException(`Akun Anda sedang ${user.status}`);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password tidak valid');
    }

    // Update last_active_at
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      status: user.status,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        status: user.status,
        emailVerifiedAt: user.emailVerifiedAt,
        phoneVerifiedAt: user.phoneVerifiedAt,
      },
    };
  }
}
