import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { Course } from '../courses/entities/course.entity';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsRepository } from './enrollments.repository';

@Module({
  imports: [

    TypeOrmModule.forFeature([Enrollment, Course]),
  ],
  controllers: [EnrollmentsController],
  providers: [
    EnrollmentsService,
    EnrollmentsRepository,
  ],
  exports: [
    EnrollmentsService,
    EnrollmentsRepository,
  ],
})
export class EnrollmentsModule { }
