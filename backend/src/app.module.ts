import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ResearchModule } from './modules/research/research.module';
import { WalletModule } from './modules/token-wallet/wallet.module';
import { QualityControlModule } from './modules/quality-control/quality-control.module';
import { WithdrawalModule } from './modules/withdrawal/withdrawal.module';
import { NotificationModule } from './modules/notification/notification.module';
import { SupportModule } from './modules/support/support.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    PrismaModule,
    AuthModule,
    ProfileModule,
    ResearchModule,
    WalletModule,
    QualityControlModule,
    WithdrawalModule,
    NotificationModule,
    SupportModule,
  ],


  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
