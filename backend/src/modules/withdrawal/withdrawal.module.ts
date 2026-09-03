import { Module } from '@nestjs/common';
import { WithdrawalController } from './withdrawal.controller';
import { WithdrawalService } from './withdrawal.service';
import { RewardService } from './reward.service';

@Module({
  controllers: [WithdrawalController],
  providers: [WithdrawalService, RewardService],
  exports: [WithdrawalService, RewardService],
})
export class WithdrawalModule {}
