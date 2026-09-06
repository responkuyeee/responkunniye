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
import { WithdrawalService } from './withdrawal.service';
import { RewardService } from './reward.service';
import { RequestWithdrawalDto } from './dto/request-withdrawal.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class WithdrawalController {
  constructor(
    private readonly withdrawalService: WithdrawalService,
    private readonly rewardService: RewardService,
  ) {}

  /**
   * Request withdrawal oleh user (potongan fee 3%)
   */
  @Post('withdrawals')
  @HttpCode(HttpStatus.CREATED)
  async requestWithdrawal(
    @CurrentUser() user: AuthUser,
    @Body() dto: RequestWithdrawalDto,
  ) {
    return this.withdrawalService.requestWithdrawal(user.id, dto);
  }

  /**
   * Riwayat penarikan milik user
   */
  @Get('withdrawals')
  @HttpCode(HttpStatus.OK)
  async getUserWithdrawals(@CurrentUser() user: AuthUser) {
    return this.withdrawalService.getUserWithdrawals(user.id);
  }

  /**
   * Approve penarikan dana oleh Admin Finance
   */
  @Post('admin/withdrawals/:id/approve')
  @UseGuards(RolesGuard)
  @Roles('admin_finance')
  @HttpCode(HttpStatus.OK)
  async approveWithdrawal(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.withdrawalService.approveWithdrawal(user.id, id);
  }

  /**
   * Proses pembuatan reward untuk partisipasi riset yang berstatus Approved
   */
  @Post('participations/:id/reward')
  @HttpCode(HttpStatus.CREATED)
  async createReward(
    @Param('id', ParseUUIDPipe) participationId: string,
  ) {
    return this.rewardService.createRewardForParticipation(participationId);
  }
}
