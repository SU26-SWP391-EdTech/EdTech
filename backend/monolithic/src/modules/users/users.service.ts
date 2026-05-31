import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../roles/entities/role.entity';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserProfile } from './entities/user-profile.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { GetAcademicUserProfileDto } from './dto/get-academic-user-profile.dto';
import { EditAcademicUserProfileDto } from './dto/edit-academic-user-profile.dto';
import { UpdateAcademicUserInfoDto } from './dto/update-academic-user-info.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    @InjectRepository(UserProfile)
    private userProfileRepo: Repository<UserProfile>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async findOne(id: number) {
    return this.userRepo.findOne({
      where: { userId: id },
    });
  }

  async create(dto: CreateUserDto) {
    const isExist = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (isExist) throw new ConflictException('Email is already existed');

    const role = await this.roleRepo.findOne({
      where: { roleName: dto.roleName },
    });
    if (!role) throw new ConflictException('Invalid role');

    const hashPassword = await bcrypt.hash(dto.password, 10);

    const newUser = this.userRepo.create({
      email: dto.email,
      password: hashPassword,
      fullName: dto.fullName,
      avatar: dto.avatar_url,
      role: role,
    });
    return await this.userRepo.save(newUser);
  }

  async findAll() {
    const users = await this.userRepo.find({
      relations: ['role'],
    });
    return users.map((users) => {
      const { password, ...result } = users;
      return result;
    });
  }

  async remove(id: number) {
    const user = await this.userRepo.findOne({ where: { userId: id } });

    if (!user) {
      throw new NotFoundException(`User ID ${id} not found`);
    }
    await this.userRepo.softDelete(id);
    return {
      message: `User ID ${id} has been deleted`,
    };
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { userId: id } });
    if (!user) {
      throw new NotFoundException(`User ID ${id} not found`);
    }
    if (dto.fullName) {
      user.fullName = dto.fullName;
    }
    if (dto.avatar_url) {
      user.avatar = dto.avatar_url;
    }
    const updatedUser = await this.userRepo.save(user);

    const { password, ...result } = updatedUser;
    return result;
  }

  async changePassword(id: number, dto: ChangePasswordDto) {
    const user = await this.userRepo.findOne({
      where: {
        userId: id,
      },
    });

    if (!user) throw new NotFoundException('User not exist');

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);

    if (!isMatch) throw new BadRequestException('Current password incorrect');

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    user.password = hashedPassword;

    await this.userRepo.save(user);

    return {
      message: 'Password changed successfully',
    };
  }

  async updateProfile(id: number, dto: UpdateAcademicUserInfoDto) {
    let academicUser = await this.userProfileRepo.findOne({
      where: { userId: id },
    });

    if (!academicUser) {
      academicUser = this.userProfileRepo.create({
        userId: id,
        expertise: dto.expertise,
        experienceYears: dto.experienceYears,
      });
    } else {
      Object.assign(academicUser, {
        expertise: dto.expertise,
        experienceYears: dto.experienceYears,
      });
    }

    return this.userProfileRepo.save(academicUser);
  }

  async editAcademicUserProfile(
    id: number,
    dto: EditAcademicUserProfileDto,
    file?: Express.Multer.File,
  ) {
    const academicUser = await this.userRepo.findOne({
      where: {
        userId: id,
      },
    });

    if (!academicUser) {
      throw new NotFoundException('Academic User not found');
    }

    if (file) {
      const uploaded = await this.cloudinaryService.uploadFile(file);

      dto.avatarUrl = uploaded.secure_url;
    }

    Object.assign(academicUser, dto);

    return await this.userRepo.save(academicUser);
  }

  async viewAcademicUserProfile(id: number, dto: GetAcademicUserProfileDto) {
    const academicUser = await this.userRepo.findOne({
      where: { userId: id },
      relations: ['userProfile'],
    });

    if (!academicUser) {
      throw new NotFoundException('Academic User not exist');
    }

    return {
      fullName: academicUser.fullName,
      email: academicUser.email,
      avatarUrl: academicUser.avatar,
      expertise: academicUser.userProfile?.expertise,
      experienceYears: academicUser.userProfile?.experienceYears,
      createdAt: academicUser.createdAt,
    };
  }
}
