import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ResearchCriterionDto {
  @IsString()
  @IsNotEmpty()
  field: string; // gender, domicile_province, education, age_min, age_max, dll

  @IsString()
  @IsNotEmpty()
  operator: string; // eq, gte, lte, in

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class ScreeningQuestionDto {
  @IsString()
  @IsNotEmpty()
  question_text: string;

  @IsInt()
  @IsPositive()
  scoring_weight: number;

  @IsInt()
  @IsPositive()
  pass_threshold: number;
}

export class CreateResearchDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUrl()
  external_survey_url: string;

  /**
   * Minimum 50 — aturan bisnis kritis dari PRD.md.
   * Validasi ini ada di DTO (fail-fast) DAN di service (defense in depth).
   */
  @IsInt()
  @Min(50, { message: 'target_respondent_count minimal 50 responden' })
  target_respondent_count: number;

  @IsInt()
  @IsPositive()
  estimated_duration_minutes: number;

  @IsDateString()
  deadline: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResearchCriterionDto)
  criteria?: ResearchCriterionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScreeningQuestionDto)
  screening_questions?: ScreeningQuestionDto[];
}
