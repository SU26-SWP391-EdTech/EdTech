// auth/auth.service.ts
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { User } from '../users/entities/user.entity';
import { CourseProvider } from '../course-providers/entities/course-provider-profile.entity';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../roles/entities/role.entity';
import { DataSource, Repository } from 'typeorm';
import { clearTokenCookie, setTokenCookie } from '../../common/helpers/jwt.helper';
import { LoginDto } from './dto/login.dto';
import { BaseRegisterDto } from './dto/base-register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Role)
    private roleRepository: Repository<Role>,

    private dataSource: DataSource,
  ) { }

  //validate fields
  //use this so it can read password field which has select: false in user entity
  async validateUser(email: string, password: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .leftJoinAndSelect('user.role', 'role')
      .getOne();

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

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .leftJoinAndSelect('user.role', 'role')
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Email or password is not true');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email or password is not true');
    }

    const userData = {
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
      roleId: user.role,
      roleName: user.role.roleName,
      avatarUrl: user.avatar,
    };

    // Tạo token và set cookie
    const token = setTokenCookie(res, userData);

    return {
      success: true,
      message: 'Login succesfully',
      token: token,
      user: userData,
    };
  }

  async register(baseDto: BaseRegisterDto, res: Response) {
    const { fullName, email, password, roleName, avatar_url } = baseDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });

    if (existingUser) {
      throw new BadRequestException('Email existed');
    }

    const role = await this.roleRepository.findOne({ where: { roleName } });

    if (!role) {
      throw new NotFoundException("Role doesn't exist");
    }

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
        avatar: avatar_url
      });

      const savedUser = await queryRunner.manager.save(newUser);
      await queryRunner.commitTransaction();

      const userData = {
        userId: savedUser.userId,
        fullName: savedUser.fullName,
        email: savedUser.email,
        roleId: savedUser.role,
        roleName: role.roleName,
        avatarUrl: savedUser.avatar
      };

      const token = setTokenCookie(res, userData);

      return {
        success: true,
        message: 'Register successfully',
        token: token,
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
    console.log
    return {
      success: true,
      message: 'Logout successfully',
    };
  }
}