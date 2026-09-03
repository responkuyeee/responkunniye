import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { QualityControlController } from './quality-control.controller';
import { QualityControlService } from './quality-control.service';
import { HoldReleaseJob } from './hold-release.job';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [QualityControlController],
  providers: [QualityControlService, HoldReleaseJob],
  exports: [QualityControlService],
})
export class QualityControlModule {}
