import { Test, TestingModule } from '@nestjs/testing';
import { CourseProvidersService } from './course-providers.service';

describe('CourseProvidersService', () => {
  let service: CourseProvidersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseProvidersService],
    }).compile();

    service = module.get<CourseProvidersService>(CourseProvidersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
