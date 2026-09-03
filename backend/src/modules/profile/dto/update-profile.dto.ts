import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  religion?: string;

  @IsOptional()
  @IsBoolean({ message: 'religion_consent harus bernilai boolean' })
  religion_consent?: boolean;

  @IsOptional()
  @IsString()
  domicile_province?: string;

  @IsOptional()
  @IsString()
  domicile_city?: string;

  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsBoolean({ message: 'data_share_consent harus bernilai boolean' })
  data_share_consent?: boolean;
}
