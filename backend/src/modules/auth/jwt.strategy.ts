import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  status: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'dev_jwt_secret_marketplace_responden_key_12345'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        status: true,
        role: true,
        ageDeclared18plus: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
        createdAt: true,
      },
    });


    if (!user) {
      throw new UnauthorizedException('Pengguna tidak ditemukan atau sesi telah berakhir');
    }

    if (user.status === 'banned' || user.status === 'suspended') {
      throw new UnauthorizedException(`Akun Anda sedang ${user.status}`);
    }

    return user;
  }
}
