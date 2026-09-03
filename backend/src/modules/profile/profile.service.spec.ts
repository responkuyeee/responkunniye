import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProfileService', () => {
  let profileService: ProfileService;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
      },
      userProfile: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      tokenWallet: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    profileService = module.get<ProfileService>(ProfileService);
  });

  describe('updateProfile', () => {
    it('should throw BadRequestException if religion is provided without consent', async () => {
      prismaService.userProfile.findUnique.mockResolvedValue({
        userId: 'user_1',
        religionConsentAt: null,
      });

      await expect(
        profileService.updateProfile('user_1', {
          religion: 'Islam',
          religion_consent: false,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should save religion and update religionConsentAt when religion_consent is true', async () => {
      prismaService.userProfile.findUnique.mockResolvedValue({
        userId: 'user_1',
        religionConsentAt: null,
      });

      prismaService.userProfile.update.mockImplementation(({ data }) => Promise.resolve(data));

      const res = await profileService.updateProfile('user_1', {
        religion: 'Islam',
        religion_consent: true,
      });

      expect(res.profile.religion).toBe('Islam');
      expect(res.profile.religionConsentAt).toBeInstanceOf(Date);
    });

    it('should record dataShareConsentAt when data_share_consent is true', async () => {
      prismaService.userProfile.findUnique.mockResolvedValue({
        userId: 'user_1',
        religionConsentAt: null,
        dataShareConsentAt: null,
      });

      prismaService.userProfile.update.mockImplementation(({ data }) => Promise.resolve(data));

      const res = await profileService.updateProfile('user_1', {
        data_share_consent: true,
      });

      expect(res.profile.dataShareConsentAt).toBeInstanceOf(Date);
    });
  });

  describe('verifyDomicile', () => {
    it('should update latitude, longitude, and domicileVerifiedAt timestamp', async () => {
      prismaService.userProfile.findUnique.mockResolvedValue({
        userId: 'user_1',
      });

      prismaService.userProfile.update.mockImplementation(({ data }) =>
        Promise.resolve({
          domicileLat: data.domicileLat,
          domicileLng: data.domicileLng,
          domicileVerifiedAt: data.domicileVerifiedAt,
        }),
      );

      const res = await profileService.verifyDomicile('user_1', {
        lat: -6.2088,
        lng: 106.8456,
      });

      expect(res.domicile.lat).toBe(-6.2088);
      expect(res.domicile.lng).toBe(106.8456);
      expect(res.domicile.verifiedAt).toBeInstanceOf(Date);
    });
  });
});
