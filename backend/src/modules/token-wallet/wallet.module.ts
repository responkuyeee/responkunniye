import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { TokenExpiryJob } from './token-expiry.job';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [WalletController],
  providers: [WalletService, TokenExpiryJob],
  exports: [WalletService, TokenExpiryJob],
})
export class WalletModule {}

