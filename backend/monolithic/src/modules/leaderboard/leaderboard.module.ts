import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardRule } from './entities/leaderboard-rule.entity';
import { UsersModule } from '../users/users.module';
import { AssessmentModule } from '../assessment/assessment.module';
import { LessonsModule } from '../lessons/lessons.module';
import { CoursesModule } from '../courses/courses.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardRepository } from './leaderboard.repository';
import { Learner } from '../learners/entities/learner.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaderboardRule, Learner]),
    UsersModule,
    AssessmentModule,
    LessonsModule,
    CoursesModule,
    EnrollmentsModule,
  ],
  controllers: [LeaderboardController],
  providers: [LeaderboardService, LeaderboardRepository],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
