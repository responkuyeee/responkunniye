import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { WalletService } from './wallet.service';
import { TopupDto } from './dto/topup.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // ---- Endpoint publik (diakses user login) ----

  @Get('wallet')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getBalance(@CurrentUser() user: any) {
    return this.walletService.getBalance(user.id);
  }

  @Get('wallet/transactions')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getTransactions(@CurrentUser() user: any) {
    return this.walletService.getTransactions(user.id);
  }

  @Post('wallet/topup')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async topup(@CurrentUser() user: any, @Body() dto: TopupDto) {
    return this.walletService.initTopup(user.id, dto);
  }

  // ---- Endpoint Webhook (tidak butuh JWT — dipanggil payment gateway) ----

  @Post('payment/webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-signature') signature: string,
  ) {
    return this.walletService.handlePaymentWebhook(payload, signature);
  }
}
