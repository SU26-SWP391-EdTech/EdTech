import { Injectable, OnModuleInit } from '@nestjs/common';
import { RolesRepository } from './roles.repository';
import { RoleEnum } from 'src/common/enums/role.enum';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(private readonly rolesRepository: RolesRepository) {}

  public async onModuleInit() {
    const roles = Object.values(RoleEnum);
    await this.rolesRepository.seedRoles(roles);
  }
}
