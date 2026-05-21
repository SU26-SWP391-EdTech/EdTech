import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseProviderProfile } from '../course-providers/entities/course-provider-profile.entity';
import { LearnerProfile } from '../learners/entities/learner-profile.entity';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, LearnerProfile, CourseProviderProfile]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
