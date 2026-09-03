import { IsIn, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSupportTicketDto {
  @IsString()
  @IsIn(['dispute_answer', 'takedown_appeal', 'withdrawal_issue', 'general'], {
    message: 'Kategori harus salah satu dari: dispute_answer, takedown_appeal, withdrawal_issue, general',
  })
  category: 'dispute_answer' | 'takedown_appeal' | 'withdrawal_issue' | 'general';

  @IsString()
  @IsNotEmpty({ message: 'Subjek tiket tidak boleh kosong' })
  @MinLength(5, { message: 'Subjek minimal 5 karakter' })
  @MaxLength(255)
  subject: string;

  @IsString()
  @IsNotEmpty({ message: 'Deskripsi tiket/alasan banding tidak boleh kosong' })
  @MinLength(15, { message: 'Deskripsi minimal 15 karakter agar tim dapat meninjau dengan jelas' })
  description: string;
}

export class ResolveSupportTicketDto {
  @IsString()
  @IsIn(['in_progress', 'resolved', 'closed'], {
    message: 'Status resolusi harus: in_progress, resolved, atau closed',
  })
  status: string;

  @IsString()
  @IsNotEmpty({ message: 'Catatan resolusi admin wajib diisi' })
  resolution_note: string;
}
