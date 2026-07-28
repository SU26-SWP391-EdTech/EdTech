import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CoursesService } from './courses.service';
import { CoursesRepository } from './courses.repository';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { User } from '../users/entities/user.entity';

describe('CoursesService - Create Course', () => {
  let service: CoursesService;

  const mockCoursesRepository = {
    createCourse: jest.fn(),
  };

  const mockCloudinaryService = {
    uploadImage: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: CoursesRepository,
          useValue: mockCoursesRepository,
        },
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);

    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create(
          {
            title: 'NestJS Basic',
          },
          1,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create course without image', async () => {
      const user = {
        userId: 1,
      };

      const createdCourse = {
        courseId: 1,
        title: 'NestJS Basic',
        user,
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      mockCoursesRepository.createCourse.mockResolvedValue(createdCourse);

      const result = await service.create(
        {
          title: 'NestJS Basic',
        },
        1,
      );

      expect(mockCloudinaryService.uploadImage).not.toHaveBeenCalled();

      expect(mockCoursesRepository.createCourse).toHaveBeenCalledWith({
        title: 'NestJS Basic',
        user,
      });

      expect(result).toEqual(createdCourse);
    });

    it('should upload image and create course', async () => {
      const user = {
        userId: 1,
      };

      const file = {} as Express.Multer.File;

      mockUserRepository.findOne.mockResolvedValue(user);

      mockCloudinaryService.uploadImage.mockResolvedValue({
        secure_url: 'https://cloudinary.com/course.jpg',
      });

      mockCoursesRepository.createCourse.mockResolvedValue({
        courseId: 1,
        title: 'NestJS Basic',
        thumbnailUrl: 'https://cloudinary.com/course.jpg',
        user,
      });

      const result = await service.create(
        {
          title: 'NestJS Basic',
        },
        1,
        file,
      );

      expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(file);

      expect(mockCoursesRepository.createCourse).toHaveBeenCalledWith({
        title: 'NestJS Basic',
        thumbnailUrl: 'https://cloudinary.com/course.jpg',
        user,
      });

      expect(result.thumbnailUrl).toBe('https://cloudinary.com/course.jpg');
    });
  });
});
