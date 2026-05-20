import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../user/entities/user.entity';
import { Role } from '../role/entities/role.entity';
import { LearnerProfile } from '../user/entities/learner-profile.entity';
import { CourseProviderProfile } from '../user/entities/course-provider-profile.entity';
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