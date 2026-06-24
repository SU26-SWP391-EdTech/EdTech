import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesRepository {
  private readonly logger = new Logger(RolesRepository.name);  // similer to console.log

  constructor(
    @InjectRepository(Role)
    private readonly repository: Repository<Role>,
  ) { }

  public async seedRoles(roles: string[]): Promise<void> {
    this.logger.log('Seeding roles into database...');

    const existingRoles = await this.repository.find();
    const existingRoleNames = existingRoles.map((r) => r.roleName);

    const newRoles = roles
      .filter((role) => !existingRoleNames.includes(role))
      .map((roleName) => this.repository.create({ roleName }));

    if (newRoles.length > 0) {
      await this.repository.save(newRoles);

      this.logger.log(
        `Inserted roles: ${newRoles.map((r) => r.roleName).join(', ')}`,
      );
    }

    this.logger.log('Roles seeding completed.');
  }
}
