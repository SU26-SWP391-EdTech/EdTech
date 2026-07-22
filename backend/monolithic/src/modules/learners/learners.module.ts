import { Module } from '@nestjs/common';
import { LearnersService } from './services/learners.service';
import { LearnersController } from './controllers/learners.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UsersModule } from '../users/users.module';
import { Role } from '../roles/entities/role.entity';
import { Learner } from './entities/learner.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { LearnerRepository } from './learners.repository';
import { LearnerStreakController } from './controllers/learner-streak.controller';
import { LearnerStreakService } from './services/learner-streak.service';
import { AssessmentSession } from '../assessment/entities/assessment-session.entity';
import { AssessmentSessionRepository } from '../assessment/repository/assessment-session.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Learner, UserProfile, AssessmentSession]),
    UsersModule,
  ],

  controllers: [LearnersController, LearnerStreakController],
  providers: [
    LearnersService,
    CloudinaryService,
    LearnerRepository,
    LearnerStreakService,
    AssessmentSessionRepository
  ],
  exports: [
    LearnersService,
    LearnerRepository,
    LearnerStreakService
  ],
})
export class LearnersModule { }

