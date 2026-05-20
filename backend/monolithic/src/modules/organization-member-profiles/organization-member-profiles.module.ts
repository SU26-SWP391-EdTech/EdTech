import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationMemberProfile } from './entities/organization-member-profile.entity';

@Module({
    imports: [TypeOrmModule.forFeature([OrganizationMemberProfile])]
})
export class OrganizationMemberProfilesModule {}
