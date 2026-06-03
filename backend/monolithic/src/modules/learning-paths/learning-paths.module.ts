import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningPath } from './entities/learning-path.entity';
import { LearningPathCourse } from './entities/learning-path-course.entity';
import { LearningPathsController } from './learning-paths.controller';
import { LearningPathsService } from './learning-paths.service';
import { LearningPathsRepository } from './learning-paths.repository';

@Module({
    imports: [TypeOrmModule.forFeature([LearningPath, LearningPathCourse])],
    controllers: [LearningPathsController],
    providers: [LearningPathsService, LearningPathsRepository],
    exports: [LearningPathsService, LearningPathsRepository]
})
export class LearningPathsModule {}
