import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('RolesGuard (RBAC)', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (userRole?: string): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: userRole ? { id: 'u1', role: userRole } : null,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it('mengizinkan akses jika endpoint tidak memiliki dekorator @Roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    const ctx = createMockContext('user');
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('mengizinkan admin_quality mengakses endpoint dengan role admin_quality', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin_quality']);
    const ctx = createMockContext('admin_quality');
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('mengizinkan admin_finance mengakses endpoint dengan role admin_finance', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin_finance']);
    const ctx = createMockContext('admin_finance');
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('menolak user biasa (role: user) yang mencoba mengakses endpoint admin_quality', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin_quality']);
    const ctx = createMockContext('user');
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('menolak admin_quality yang mencoba mengakses endpoint admin_finance', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin_finance']);
    const ctx = createMockContext('admin_quality');
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
