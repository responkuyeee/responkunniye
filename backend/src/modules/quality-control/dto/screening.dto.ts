import { IsArray, IsInt, IsNotEmpty, IsPositive, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ScreeningAnswerItemDto {
  @IsUUID('4', { message: 'screening_question_id harus berupa UUID yang valid' })
  screening_question_id: string;

  @IsString()
  @IsNotEmpty({ message: 'Jawaban screening tidak boleh kosong' })
  answer: string;

  @IsInt()
  score: number;
}

export class SubmitScreeningDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScreeningAnswerItemDto)
  answers: ScreeningAnswerItemDto[];
}
