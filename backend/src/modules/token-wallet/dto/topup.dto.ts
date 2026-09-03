import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class TopupDto {
  @IsInt({ message: 'Jumlah topup harus berupa bilangan bulat dalam satuan token' })
  @IsPositive({ message: 'Jumlah topup harus lebih dari 0' })
  amount_token: number;

  @IsString()
  @IsNotEmpty({ message: 'Metode pembayaran tidak boleh kosong' })
  payment_method: string; // qris, ewallet, va

  @IsString()
  @IsNotEmpty({ message: 'Idempotency key tidak boleh kosong — wajib unik per percobaan topup' })
  idempotency_key: string;
}
