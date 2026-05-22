import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../roles/entities/role.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
  ) { }

  async findOne(id: number) {
    return this.userRepo.findOne({
      where: { userId: id },
    });
  }

  async create(dto: CreateUserDto) {
    const isExist = await this.userRepo.findOne({ where: { email: dto.email } });
    if (isExist) throw new ConflictException('Email is already existed');

    const role = await this.roleRepo.findOne({ where: { roleName: dto.roleName } });
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
}
