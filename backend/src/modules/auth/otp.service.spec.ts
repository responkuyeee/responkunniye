import { ConfigService } from '@nestjs/config';
import { OtpService } from './otp.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('OtpService', () => {
  let otpService: OtpService;
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();
    otpService = new OtpService(configService);
  });

  it('should send and verify OTP successfully', async () => {
    const target = 'user@example.com';
    const result = await otpService.sendOtp(target, 'email');
    expect(result.target).toBe(target);

    // Dapatkan kode OTP yang tersimpan via internal map
    const stored = (otpService as any).otpStore.get(target);
    expect(stored).toBeDefined();
    expect(stored.code).toHaveLength(6);

    // Verifikasi kode benar
    const verified = otpService.verifyOtp(target, stored.code);
    expect(verified).toBe(true);

    // Setelah diverifikasi, OTP harus dihapus
    expect(() => otpService.verifyOtp(target, stored.code)).toThrow(HttpException);
  });

  it('should throw BAD_REQUEST when OTP is incorrect', async () => {
    const target = '081234567890';
    await otpService.sendOtp(target, 'phone');

    expect(() => otpService.verifyOtp(target, '000000')).toThrow(HttpException);
  });

  it('should enforce rate limiting (max 3 requests per window)', async () => {
    const target = 'ratelimit@example.com';

    await otpService.sendOtp(target, 'email');
    await otpService.sendOtp(target, 'email');
    await otpService.sendOtp(target, 'email');

    // Permintaan ke-4 harus melempar TOO_MANY_REQUESTS
    await expect(otpService.sendOtp(target, 'email')).rejects.toThrow(
      /Terlalu banyak permintaan OTP/,
    );
  });
});
