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
import { QualityControlService } from './quality-control.service';
import { SubmitScreeningDto } from './dto/screening.dto';
import { SubmitSurveyDto } from './dto/submit-survey.dto';
import { AdminQualityDecisionDto } from './dto/admin-decision.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class QualityControlController {
  constructor(private readonly qcService: QualityControlService) {}

  /**
   * Submit jawaban screening question
   */
  @Post('research/:id/screening')
  @HttpCode(HttpStatus.OK)
  async submitScreening(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) researchId: string,
    @Body() dto: SubmitScreeningDto,
  ) {
    return this.qcService.submitScreening(user.id, researchId, dto);
  }

  /**
   * Mulai partisipasi riset (status in_progress)
   */
  @Post('research/:id/participate')
  @HttpCode(HttpStatus.OK)
  async participate(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) researchId: string,
  ) {
    return this.qcService.participate(user.id, researchId);
  }

  /**
   * Submit jawaban survei (trigger auto-screening)
   */
  @Post('research/:id/submit')
  @HttpCode(HttpStatus.OK)
  async submitSurvey(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) researchId: string,
    @Body() dto: SubmitSurveyDto,
  ) {
    return this.qcService.submitSurvey(user.id, researchId, dto);
  }

  /**
   * Antrian jawaban yang di-flag (Khusus Admin Quality, SLA 48 jam)
   */
  @Get('admin/quality-review')
  @UseGuards(RolesGuard)
  @Roles('admin_quality')
  @HttpCode(HttpStatus.OK)
  async getReviewQueue() {
    return this.qcService.getAdminReviewQueue();
  }

  /**
   * Keputusan Admin Quality (approve/reject)
   */
  @Post('admin/quality-review/:participationId/decision')
  @UseGuards(RolesGuard)
  @Roles('admin_quality')
  @HttpCode(HttpStatus.OK)
  async processDecision(
    @CurrentUser() user: any,
    @Param('participationId', ParseUUIDPipe) participationId: string,
    @Body() dto: AdminQualityDecisionDto,
  ) {
    return this.qcService.processAdminDecision(user.id, participationId, dto);
  }
}

