import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ALL_ROLE_NAMES } from '../../common/constants/role.constants';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    for (const roleName of ALL_ROLE_NAMES) {
      const exists = await this.roleRepository.exist({ where: { roleName } });
      if (!exists) {
        await this.roleRepository.save(this.roleRepository.create({ roleName }));
      }
    }
  }

  findAll() {
    return this.roleRepository.find({ order: { roleId: 'ASC' } });
  }
}
