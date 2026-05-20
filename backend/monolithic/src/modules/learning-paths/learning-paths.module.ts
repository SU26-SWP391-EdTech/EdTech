import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningPath } from './entities/learning-path.entity';
import { LearningPathCourse } from './entities/learning-path-course.entity';
@Module({
    imports: [TypeOrmModule.forFeature([LearningPath, LearningPathCourse])]
})
export class LearningPathsModule {}
