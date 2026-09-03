import { IsNumber, Max, Min } from 'class-validator';

export class DomicileVerifyDto {
  @IsNumber({}, { message: 'Latitude harus berupa angka numerik' })
  @Min(-90, { message: 'Latitude minimal -90' })
  @Max(90, { message: 'Latitude maksimal 90' })
  lat: number;

  @IsNumber({}, { message: 'Longitude harus berupa angka numerik' })
  @Min(-180, { message: 'Longitude minimal -180' })
  @Max(180, { message: 'Longitude maksimal 180' })
  lng: number;
}
