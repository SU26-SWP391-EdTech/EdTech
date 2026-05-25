import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationMemberProfile } from './entities/organization-member-profile.entity';
import { OrganizationMemberProfilesRepository } from './organization-member-profiles.repository';
import { OrganizationMemberProfilesService } from './organization-member-profiles.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationMemberProfile])],
  providers: [
    OrganizationMemberProfilesRepository,
    OrganizationMemberProfilesService,
  ],
  exports: [
    OrganizationMemberProfilesService,
  ],
})
export class OrganizationMemberProfilesModule {}
