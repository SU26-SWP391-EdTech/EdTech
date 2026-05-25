import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { OrganizationsRepository } from './organizations.repository';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly organizationsRepository: OrganizationsRepository,
  ) { }

  public async createOrganization(data: Partial<Organization>, manager?: EntityManager) {
    return await this.organizationsRepository.createOrganization(data, manager);
  }
}