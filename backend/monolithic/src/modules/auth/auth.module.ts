import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Learner } from '../learners/entities/learner.entity';
import { jwtConstants } from '../../common/constants/jwt.constants';
import { CourseProvider } from '../course-providers/entities/course-provider-profile.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Learner, CourseProvider]),
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