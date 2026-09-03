import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OtpService } from './otp.service';
import { ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: any;
  let jwtService: any;
  let otpService: any;

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      userProfile: {
        create: jest.fn(),
      },
      tokenWallet: {
        create: jest.fn(),
      },
      qualityScore: {
        create: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prismaService)),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock_jwt_token'),
    };

    otpService = {
      sendOtp: jest.fn().mockResolvedValue({ message: 'sent' }),
      verifyOtp: jest.fn().mockReturnValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        { provide: JwtService, useValue: jwtService },
        { provide: OtpService, useValue: otpService },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('7d') },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should throw BadRequestException if age_declared_18plus is false', async () => {
      await expect(
        authService.register({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '08123456789',
          password: 'password123',
          age_declared_18plus: false,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if email is already registered', async () => {
      prismaService.user.findUnique.mockResolvedValueOnce({ id: 'existing_user' });

      await expect(
        authService.register({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '08123456789',
          password: 'password123',
          age_declared_18plus: true,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should successfully register user and send OTPs', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue({
        id: 'user_123',
        email: 'john@example.com',
        phone: '08123456789',
        name: 'John Doe',
        ageDeclared18plus: true,
        status: 'active',
      });

      const res = await authService.register({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '08123456789',
        password: 'password123',
        age_declared_18plus: true,
      });

      expect(res.user.id).toBe('user_123');
      expect(otpService.sendOtp).toHaveBeenCalledTimes(2);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for unknown email', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'unknown@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return JWT token upon successful login', async () => {
      const password = 'password123';
      const passwordHash = await bcrypt.hash(password, 10);

      prismaService.user.findUnique.mockResolvedValue({
        id: 'user_123',
        email: 'john@example.com',
        phone: '08123456789',
        name: 'John Doe',
        passwordHash,
        status: 'active',
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
      });
      prismaService.user.update.mockResolvedValue({});

      const res = await authService.login({
        email: 'john@example.com',
        password,
      });

      expect(res.access_token).toBe('mock_jwt_token');
      expect(res.user.id).toBe('user_123');
    });
  });
});
