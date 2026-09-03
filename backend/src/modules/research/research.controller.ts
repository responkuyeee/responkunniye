import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ResearchService } from './research.service';
import { CreateResearchDto } from './dto/create-research.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';


@Controller('research')
@UseGuards(JwtAuthGuard)
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  /**
   * List research tersedia untuk respondent
   * Auto-filter berdasarkan profil (gender, domisili, dll) & quality score
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAvailableResearch(@CurrentUser() user: any) {
    return this.researchService.getAvailableResearch(user.id);
  }

  /**
   * Buat riset baru (status draft)
   * Validasi: target_respondent_count >= 50, keyword filter konten
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createResearch(
    @CurrentUser() user: any,
    @Body() dto: CreateResearchDto,
  ) {
    return this.researchService.createResearch(user.id, dto);
  }

  /**
   * Detail riset
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.researchService.getResearchDetail(id);
  }

  /**
   * Publish riset (auto tanpa review admin manual, reserve token dari wallet)
   */
  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  async publish(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.researchService.publishResearch(user.id, id);
  }

  /**
   * Cancel riset (refund sisa token yang belum ter-consume)
   */
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.researchService.cancelResearch(user.id, id);
  }

  /**
   * Takedown riset yang melanggar kebijakan konten (Khusus Admin Quality)
   */
  @Post('admin/research/:id/takedown')
  @UseGuards(RolesGuard)
  @Roles('admin_quality')
  @HttpCode(HttpStatus.OK)
  async takedown(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('violation_note') violationNote: string,
  ) {
    return this.researchService.takedownResearch(user.id, id, violationNote ?? 'Pelanggaran kebijakan konten');
  }
}

