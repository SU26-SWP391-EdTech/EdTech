// auth/auth.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../roles/entities/role.entity';
import { DataSource, Repository } from 'typeorm';
import {
  clearTokenCookie,
  setTokenCookie,
} from '../../common/helpers/jwt.helper';
import { LoginDto } from './dto/login.dto';
import { BaseRegisterDto } from './dto/base-register.dto';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { VerifyEmailDto } from '../mail/dto/verifyEmail.dto';
import { RoleEnum } from 'src/common/enums/role.enum';
import { PlatformSettingsService } from '../platform-settings/platform-settings.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Role)
    private roleRepository: Repository<Role>,

    private dataSource: DataSource,

    private mailService: MailService,
    private jwtService: JwtService,
    private platformSettingsService: PlatformSettingsService,
  ) { }

  //validate fields
  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = user;
    return {
      ...result,
      roleName: user.role.roleName,
    };
  }

  //checkauth api
  async getMe(userId: number) {
    const user = await this.userRepository.findOne({
      where: { userId },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      user: {
        userId: user.userId,
        email: user.email,
        fullName: user.fullName,
        roleId: user.role,
        roleName: user.role.roleName,
        avatarUrl: user.avatar,
      },
    };
  }

  //login api
  async login(loginDto: LoginDto, res: Response) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('Email or password is not true');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email or password is not true');
    }

    const userData = {
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
      roleId: user.role.roleId,
      roleName: user.role.roleName,
      avatarUrl: user.avatar,
    };

    // Tạo token và set cookie
    const token = setTokenCookie(res, userData);

    let requiresPlatformSetup = false;
    if (user.role.roleName === RoleEnum.ADMIN) {
      const configured = await this.platformSettingsService.isConfigured();
      requiresPlatformSetup = !configured;
    }

    return {
      success: true,
      message: 'Login succesfully',
      token: token,
      user: userData,
      requiresPlatformSetup,
    };
  }

  async register(baseDto: BaseRegisterDto, res: Response) {
    const { fullName, email, password, roleName, avatar_url } = baseDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email existed');
    }

    const role = await this.roleRepository.findOne({ where: { roleName } });

    if (!role) {
      throw new NotFoundException("Role doesn't exist");
    }

    if(role.roleName==RoleEnum.ADMIN||role.roleName==RoleEnum.ACADEMIC_MANAGER){
      throw new BadRequestException('You do not have permission to set admin and academic manager role');
    }

    if (password.length < 8) throw new BadRequestException("Password length must more than 8 characters");

    const hashedPassword = await bcrypt.hash(password, 10);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newUser = queryRunner.manager.create(User, {
        fullName: fullName,
        email,
        password: hashedPassword,
        role: role,
        avatar: avatar_url,
        isEmailVerified: false,
      });

      const savedUser = await queryRunner.manager.save(newUser);

      const userData = {
        userId: savedUser.userId,
        fullName: savedUser.fullName,
        email: savedUser.email,
        roleId: savedUser.role.roleId,
        roleName: role.roleName,
        avatarUrl: savedUser.avatar,
        isEmailVerified: false,
      };

      const emailVerifyToken = this.jwtService.sign(
        {
          sub: savedUser.userId,
          email: savedUser.email,
          type: 'email-verification',
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '15m',
        },
      );

      await this.mailService.sendVerificationEmail(
        savedUser.email,
        emailVerifyToken,
      );

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'Register successfully, please check your mail',
        user: userData,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async logout(res: Response) {
    clearTokenCookie(res);
    console.log;
    return {
      success: true,
      message: 'Logout successfully',
    };
  }

  async verifyEmail(token: string) {

    const payload = this.jwtService.verify(token,
      {
        secret: process.env.JWT_SECRET
      },
    );

    if (payload.type !== 'email-verification') {
      throw new UnauthorizedException();
    }

    const user = await this.userRepository.findOne({
      where: {
        userId: payload.sub,
      }
    });

    if (!user) {
      throw new NotFoundException();
    }

    user.isEmailVerified = true;

    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }
}
