import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationsRepository {
  constructor(
    @InjectRepository(Organization)
    private readonly repo: Repository<Organization>,
  ) { }

  public async createOrganization(data: Partial<Organization>, manager?: EntityManager): Promise<Organization> {
    const repository = manager ? manager.getRepository(Organization) : this.repo;
    const organization = repository.create(data);
    return await repository.save(organization);
  }
}