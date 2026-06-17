import { Module } from '@nestjs/common';
import { LearnersService } from './learners.service';
import { LearnersController } from './learners.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UsersModule } from '../users/users.module';
import { Role } from '../roles/entities/role.entity';
import { Learner } from './entities/learner.entity';
import { UserProfile } from '../users/entities/user-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Learner, UserProfile]),
    UsersModule,
  ],

  controllers: [LearnersController],
  providers: [LearnersService, CloudinaryService],
})
export class LearnersModule {}
