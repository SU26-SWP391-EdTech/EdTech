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

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Learner, UserProfile]),
    UsersModule,
  ],

  controllers: [LearnersController],
  providers: [
    LearnersService,
    CloudinaryService,
    LearnerRepository,
  ],
  exports: [
    LearnersService,
    LearnerRepository,
  ],
})
export class LearnersModule { }

