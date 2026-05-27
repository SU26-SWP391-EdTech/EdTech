import { Module } from '@nestjs/common';
import { LearnersService } from './learners.service';
import { LearnersController } from './learners.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UsersService } from '../users/users.service';
import { Role } from '../roles/entities/role.entity';
import { Learner } from './entities/learner.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Learner]),
  ],

  controllers: [LearnersController],
  providers: [LearnersService, CloudinaryService, UsersService],
})
export class LearnersModule {}
