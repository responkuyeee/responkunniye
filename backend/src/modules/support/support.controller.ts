import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateSupportTicketDto, ResolveSupportTicketDto } from './dto/support-ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  /**
   * Mengajukan tiket permohonan banding / bantuan baru
   */
  @Post('support/tickets')
  @HttpCode(HttpStatus.CREATED)
  async createTicket(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateSupportTicketDto,
  ) {
    return this.supportService.createTicket(user.id, dto);
  }

  /**
   * Riwayat tiket milik pengguna
   */
  @Get('support/tickets')
  @HttpCode(HttpStatus.OK)
  async getMyTickets(@CurrentUser() user: AuthUser) {
    return this.supportService.getUserTickets(user.id);
  }

  /**
   * Antrian tiket untuk Admin (Admin Quality & Admin Finance)
   */
  @Get('admin/support/tickets')
  @UseGuards(RolesGuard)
  @Roles('admin_quality', 'admin_finance')
  @HttpCode(HttpStatus.OK)
  async getAdminTickets(@Query('category') category?: string) {
    return this.supportService.getAllTicketsForAdmin(category);
  }

  /**
   * Admin menyelesaikan / menanggapi tiket
   */
  @Post('admin/support/tickets/:id/resolve')
  @UseGuards(RolesGuard)
  @Roles('admin_quality', 'admin_finance')
  @HttpCode(HttpStatus.OK)
  async resolveTicket(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResolveSupportTicketDto,
  ) {
    return this.supportService.resolveTicket(user.id, id, dto);
  }
}
