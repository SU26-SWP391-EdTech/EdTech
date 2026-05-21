import { Test, TestingModule } from '@nestjs/testing';
import { CourseProvidersController } from './course-providers.controller';
import { CourseProvidersService } from './course-providers.service';

describe('CourseProvidersController', () => {
  let controller: CourseProvidersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseProvidersController],
      providers: [CourseProvidersService],
    }).compile();

    controller = module.get<CourseProvidersController>(CourseProvidersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
