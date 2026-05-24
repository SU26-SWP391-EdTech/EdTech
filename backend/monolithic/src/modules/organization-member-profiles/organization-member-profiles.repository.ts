import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { OrganizationMemberProfile } from './entities/organization-member-profile.entity';

@Injectable()
export class OrganizationMemberProfilesRepository {
  constructor(
    @InjectRepository(OrganizationMemberProfile)
    private readonly repo: Repository<OrganizationMemberProfile>,
  ) {}

  public async findByUserId(
    userId: number,
    manager?: EntityManager,
  ): Promise<OrganizationMemberProfile | null> {
    const repository = manager ? manager.getRepository(OrganizationMemberProfile) : this.repo;
    return await repository.findOne({
      where: { userId },
    });
  }

  public async createMemberProfile(
    data: Partial<OrganizationMemberProfile>,
    manager?: EntityManager,
  ): Promise<OrganizationMemberProfile> {
    const repository = manager ? manager.getRepository(OrganizationMemberProfile) : this.repo;
    const profile = repository.create(data);
    return await repository.save(profile);
  }
}
