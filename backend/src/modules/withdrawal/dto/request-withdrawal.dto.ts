import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class RequestWithdrawalDto {
  @IsInt({ message: 'token_amount harus berupa bilangan bulat' })
  @Min(10, { message: 'Penarikan token minimal 10 token (Rp10.000)' })
  token_amount: number;

  @IsOptional()
  @IsString()
  bank_name?: string;

  @IsOptional()
  @IsString()
  account_number?: string;

  @IsOptional()
  @IsString()
  account_holder_name?: string;
}
