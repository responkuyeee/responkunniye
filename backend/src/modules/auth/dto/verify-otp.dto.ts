import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty({ message: 'Target (email/phone) tidak boleh kosong' })
  target: string;

  @IsString()
  @Length(4, 8, { message: 'Kode OTP harus berupa 4-8 karakter' })
  code: string;
}
