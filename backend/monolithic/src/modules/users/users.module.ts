import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Learner } from '../learners/entities/learner.entity';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserProfile } from './entities/user-profile.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Role } from '../roles/entities/role.entity';
import { Course } from '../courses/entities/course.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { LearningPath } from '../learning-paths/entities/learning-path.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile, Role, Course, Enrollment, LearningPath])],
  providers: [UsersService,CloudinaryService],
  controllers: [UsersController],
  exports: [UsersService, CloudinaryService],
})
export class UsersModule { }
