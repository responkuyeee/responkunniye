import { Controller, Get, Put, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { DomicileVerifyDto } from './dto/domicile-verify.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getProfile(@CurrentUser() user: any) {
    return this.profileService.getProfile(user.id);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(user.id, dto);
  }

  @Post('domicile-verify')
  @HttpCode(HttpStatus.OK)
  async verifyDomicile(@CurrentUser() user: any, @Body() dto: DomicileVerifyDto) {
    return this.profileService.verifyDomicile(user.id, dto);
  }
}
