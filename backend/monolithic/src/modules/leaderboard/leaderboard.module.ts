import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardRule } from './entities/leaderboard-rule.entity';
import { UsersModule } from '../users/users.module';
import { AssessmentModule } from '../assessment/assessment.module';
import { LessonsModule } from '../lessons/lessons.module';
import { CoursesModule } from '../courses/courses.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { User } from '../users/entities/user.entity';
import { Assessment } from '../assessment/entities/assessment.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Course } from '../courses/entities/course.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaderboardRule, User, Assessment, Lesson, Course, Enrollment])
  ],
  providers: [UsersModule, AssessmentModule, LessonsModule, CoursesModule, EnrollmentsModule],
})
export class LeaderboardModule {
}
