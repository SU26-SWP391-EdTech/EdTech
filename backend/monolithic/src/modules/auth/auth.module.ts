import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/entities/users.entity';
import { Role } from '../roles/entities/role.entity';
import { LearnerProfile } from '../users/entities/learner-profile.entity';
import { CourseProviderProfile } from '../users/entities/course-provider-profile.entity';
import { jwtConstants } from '../../common/constants/jwt.constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, LearnerProfile, CourseProviderProfile]),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}