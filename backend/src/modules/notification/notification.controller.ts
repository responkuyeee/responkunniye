import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notifService: NotificationService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getMyNotifications(@CurrentUser() user: AuthUser) {
    return this.notifService.getUserNotifications(user.id);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markRead(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notifService.markAsRead(id, user.id);
  }
}
