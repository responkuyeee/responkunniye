import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QualityControlService } from './quality-control.service';

@Injectable()
export class HoldReleaseJob {
  private readonly logger = new Logger(HoldReleaseJob.name);

  constructor(private readonly qcService: QualityControlService) {}

  /**
   * Cron job: berjalan setiap 1 menit untuk memeriksa dan me-release
   * partisipasi yang statusnya 'hold' dan waktu holdReleaseAt (24 jam) sudah lewat.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleHoldReleaseCron() {
    try {
      const releasedCount = await this.qcService.releaseHoldParticipations();
      if (releasedCount > 0) {
        this.logger.log(`[Cron] Berhasil me-release ${releasedCount} partisipasi dari hold 24 jam.`);
      }
    } catch (error) {
      this.logger.error('[Cron] Gagal mengeksekusi hold release job:', error);
    }
  }
}
