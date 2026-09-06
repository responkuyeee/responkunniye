import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Shape dari user yang dikembalikan oleh JwtStrategy.validate()
 * Sesuai dengan select fields di jwt.strategy.ts
 */
export interface AuthUser {
  id: string;
  email: string;
  phone: string;
  name: string;
  status: string;
  role: string;
  ageDeclared18plus: boolean;
  emailVerifiedAt: Date | null;
  phoneVerifiedAt: Date | null;
  createdAt: Date;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AuthUser;
  },
);
