import { IsBoolean, IsEmail, IsNotEmpty, IsString, MinLength, Equals } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  name: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Nomor telepon tidak boleh kosong' })
  phone: string;

  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;

  @IsBoolean({ message: 'age_declared_18plus harus bernilai boolean' })
  @Equals(true, { message: 'age_declared_18plus wajib bernilai true (umur >= 18 tahun)' })
  age_declared_18plus: boolean;
}
