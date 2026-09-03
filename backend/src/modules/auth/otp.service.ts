import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface OtpRecord {
  code: string;
  expiresAt: number;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly otpStore = new Map<string, OtpRecord>();
  private readonly rateLimitStore = new Map<string, RateLimitRecord>();

  private readonly OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 menit
  private readonly RATE_LIMIT_MAX_ATTEMPTS = 3; // Maks 3 kali / 10 menit per nomor/email
  private readonly RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Kirim OTP ke email atau SMS
   */
  async sendOtp(target: string, type: 'email' | 'phone'): Promise<{ message: string; target: string }> {
    this.checkRateLimit(target);

    // Generate 6-digit numeric OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + this.OTP_EXPIRY_MS;

    this.otpStore.set(target.toLowerCase().trim(), { code, expiresAt });

    // Mock/log delivery (dapat diintegrasikan dengan SMTP atau SMS Provider Zenziva/Twilio)
    this.logger.log(`[OTP Provider: ${type.toUpperCase()}] Mengirim kode OTP ${code} ke ${target}`);

    return {
      message: `Kode verifikasi OTP berhasil dikirim ke ${target}`,
      target,
    };
  }

  /**
   * Verifikasi kode OTP
   */
  verifyOtp(target: string, code: string): boolean {
    const key = target.toLowerCase().trim();
    const record = this.otpStore.get(key);

    if (!record) {
      throw new HttpException('Kode OTP tidak ditemukan atau telah kedaluwarsa', HttpStatus.BAD_REQUEST);
    }

    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(key);
      throw new HttpException('Kode OTP telah kedaluwarsa', HttpStatus.BAD_REQUEST);
    }

    if (record.code !== code.trim()) {
      throw new HttpException('Kode OTP salah', HttpStatus.BAD_REQUEST);
    }

    // Hapus OTP setelah berhasil diverifikasi
    this.otpStore.delete(key);
    return true;
  }

  /**
   * Cek batas rate limit (maks 3 kali per 10 menit)
   */
  private checkRateLimit(target: string): void {
    const key = target.toLowerCase().trim();
    const now = Date.now();
    const rateData = this.rateLimitStore.get(key);

    if (!rateData || now > rateData.resetAt) {
      this.rateLimitStore.set(key, { count: 1, resetAt: now + this.RATE_LIMIT_WINDOW_MS });
      return;
    }

    if (rateData.count >= this.RATE_LIMIT_MAX_ATTEMPTS) {
      const waitMinutes = Math.ceil((rateData.resetAt - now) / 60000);
      throw new HttpException(
        `Terlalu banyak permintaan OTP. Silakan coba lagi dalam ${waitMinutes} menit.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    rateData.count += 1;
    this.rateLimitStore.set(key, rateData);
  }
}
