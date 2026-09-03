import { IsArray, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class SurveyAnswerItemDto {
  question_id?: string;
  answer_value: string;
  is_attention_check?: boolean;
  expected_answer?: string;
}

export class SubmitSurveyDto {
  @IsInt({ message: 'Durasi pengerjaan harus berupa detik (integer)' })
  @IsPositive({ message: 'Durasi pengerjaan harus lebih dari 0 detik' })
  duration_seconds: number;

  @IsOptional()
  @IsString()
  external_submission_ref?: string;

  @IsOptional()
  @IsArray()
  answers?: SurveyAnswerItemDto[];

  @IsOptional()
  @IsString()
  device_fingerprint?: string;

  @IsOptional()
  @IsString()
  ip_address?: string;
}
