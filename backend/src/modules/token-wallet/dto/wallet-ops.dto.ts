import { IsInt, IsNotEmpty, IsPositive, IsString, IsUUID } from 'class-validator';

export class ReserveTokenDto {
  @IsUUID('4', { message: 'research_id harus berupa UUID v4 yang valid' })
  research_id: string;

  @IsInt()
  @IsPositive()
  amount: number; // jumlah token yang di-reserve (= target_respondent_count)
}

export class ConsumeTokenDto {
  @IsUUID('4')
  research_id: string;

  @IsUUID('4')
  participation_id: string;

  @IsInt()
  @IsPositive()
  amount: number; // 1 token per participation

  @IsString()
  @IsNotEmpty()
  idempotency_key: string;
}

export class RefundTokenDto {
  @IsUUID('4')
  research_id: string;

  @IsInt()
  @IsPositive()
  amount: number; // sisa slot yang belum ter-consume

  @IsString()
  @IsNotEmpty()
  idempotency_key: string;
}
