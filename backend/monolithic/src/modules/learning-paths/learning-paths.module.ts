import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningPath } from './entities/learning-path.entity';
import { LearningPathCourse } from './entities/learning-path-course.entity';
import { LearningPathsController } from './learning-paths.controller';
import { LearningPathsService } from './learning-paths.service';
import { LearningPathsRepository } from './repositories/learning-paths.repository';
import { CoursesModule } from '../courses/courses.module';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { LearningPathFollow } from './entities/learning-path-follow.entity';
import { LearningPathFollowRepository } from './repositories/learning-path-follow.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([LearningPath, LearningPathCourse, LearningPathFollow]),
    CoursesModule
  ],
  controllers: [LearningPathsController],
  providers: [LearningPathsService, LearningPathsRepository, CloudinaryService, LearningPathFollowRepository],
  exports: [LearningPathsService, LearningPathsRepository]
})
export class LearningPathsModule { }
