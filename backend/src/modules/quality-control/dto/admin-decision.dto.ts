import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AdminQualityDecisionDto {
  @IsString()
  @IsIn(['approved', 'rejected'], { message: 'decision harus bernilai "approved" atau "rejected"' })
  decision: 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  note?: string;
}
