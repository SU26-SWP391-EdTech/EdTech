// auth/auth.service.ts
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { LearnerRegisterDto } from './dto/learner-register.dto';
import { User } from '../user/entities/user.entity';
import { LearnerProfile } from '../user/entities/learner-profile.entity';
import { CourseProviderRegisterDto } from './dto/course-provider-register.dto';
import { CourseProviderProfile } from '../user/entities/course-provider-profile.entity';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../role/entities/role.entity';
import { DataSource, Repository } from 'typeorm';
import { clearTokenCookie, setTokenCookie } from '../../common/helpers/jwt.helper';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,

    private dataSource: DataSource,
  ) {}

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

  async getMe(userId: number) {
    const user = await this.userRepository.findOne({
      where: { userId },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    return {
      success: true,
      user: {
        userId: user.userId,
        email: user.email,
        fullName: user.fullName,
        roleId: user.roleId,
        roleName: user.role.roleName,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async login(loginDto: LoginDto, res: Response) {
    const { email, password } = loginDto;
    
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const userData = {
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
      roleId: user.roleId,
      roleName: user.role.roleName,
      avatarUrl: user.avatarUrl,
    };

    // Tạo token và set cookie
    const token = setTokenCookie(res, userData);

    return {
      success: true,
      message: 'Đăng nhập thành công',
      token: token,
      user: userData,
    };
  }

  async registerLearner(learnerDto: LearnerRegisterDto, res: Response) {
    const { email, password, roleName, learningGoal, level, bio, fullName } = learnerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email }
    });
    
    if (existingUser) {
      throw new BadRequestException('Email đã tồn tại');
    }

    // Tìm role
    const role = await this.roleRepository.findOne({ where: { roleName } });
    if (!role) throw new NotFoundException('Vai trò hệ thống không tồn tại');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Dùng transaction để tạo user + learner profile
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Tạo user
      const newUser = queryRunner.manager.create(User, {
        email,
        password: hashedPassword,
        fullName: fullName,
        role: role,
        avatarUrl: ''
      });
      const savedUser = await queryRunner.manager.save(newUser);

      // Tạo learner profile
      const learnerProfile = queryRunner.manager.create(LearnerProfile, {
        userId: savedUser.userId,
        learningGoal,
        level,
        bio
      });
      await queryRunner.manager.save(learnerProfile);

      await queryRunner.commitTransaction();

      const userData = {
        userId: savedUser.userId,
        email: savedUser.email,
        fullName: savedUser.fullName,
        roleId: savedUser.roleId,
        roleName: role.roleName,
        avatarUrl: savedUser.avatarUrl,
      };

      // Tạo token và set cookie
      const token = setTokenCookie(res, userData);

      return {
        success: true,
        message: 'Đăng ký thành công',
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

  async registerCourseProvider(providerDto: CourseProviderRegisterDto, res: Response) {
    const { email, password, roleName, expertise, experienceYears, fullName } = providerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email }
    });
    
    if (existingUser) {
      throw new BadRequestException('Email đã tồn tại');
    }

    const role = await this.roleRepository.findOne({ where: { roleName } });
    if (!role) throw new NotFoundException('Vai trò hệ thống không tồn tại');

    const hashedPassword = await bcrypt.hash(password, 10);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newUser = queryRunner.manager.create(User, {
        email,
        password: hashedPassword,
        fullName: fullName,
        role: role,
        avatarUrl: ''
      });
      const savedUser = await queryRunner.manager.save(newUser);

      const courseProviderProfile = queryRunner.manager.create(CourseProviderProfile, {
        userId: savedUser.userId,
        expertise,
        experienceYears
      });
      await queryRunner.manager.save(courseProviderProfile);

      await queryRunner.commitTransaction();

      const userData = {
        userId: savedUser.userId,
        email: savedUser.email,
        fullName: savedUser.fullName,
        roleId: savedUser.roleId,
        roleName: role.roleName,
        avatarUrl: savedUser.avatarUrl,
      };

      // Tạo token và set cookie
      const token = setTokenCookie(res, userData);

      return {
        success: true,
        message: 'Đăng ký thành công',
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
    return {
      success: true,
      message: 'Đăng xuất thành công',
    };
  }
}