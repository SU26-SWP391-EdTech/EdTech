import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { OrganizationMemberProfile } from './entities/organization-member-profile.entity';
import { OrganizationMemberProfilesRepository } from './organization-member-profiles.repository';

@Injectable()
export class OrganizationMemberProfilesService {
  constructor(
    private readonly repository: OrganizationMemberProfilesRepository,
  ) {}

  public async findByUserId(
    userId: number,
    manager?: EntityManager,
  ): Promise<OrganizationMemberProfile | null> {
    return await this.repository.findByUserId(userId, manager);
  }

  public async createMemberProfile(
    data: Partial<OrganizationMemberProfile>,
    manager?: EntityManager,
  ): Promise<OrganizationMemberProfile> {
    return await this.repository.createMemberProfile(data, manager);
  }
}
