import { Module } from '@nestjs/common';
import { CourseProvidersService } from './course-providers.service';
import { CourseProvidersController } from './course-providers.controller';

@Module({
  controllers: [CourseProvidersController],
  providers: [CourseProvidersService],
})
export class CourseProvidersModule {}
