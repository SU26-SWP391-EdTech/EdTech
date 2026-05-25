import { Module } from '@nestjs/common';
import { OrganizationRegistrationApplication } from './entities/organization-registration-application.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationRegistrationApplicationController } from './organization-registration-application.controller';
import { OrganizationRegistrationApplicationService } from './organization-registration-application.service';
import { OrganizationRegistrationApplicationRepository } from './organization-registration-application.repository';
import { UsersModule } from '../users/users.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { OrganizationMemberProfilesModule } from '../organization-member-profiles/organization-member-profiles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrganizationRegistrationApplication]),
    UsersModule,
    OrganizationsModule,
    OrganizationMemberProfilesModule,
  ],
  controllers: [OrganizationRegistrationApplicationController],
  providers: [
    OrganizationRegistrationApplicationService,
    OrganizationRegistrationApplicationRepository,
  ],
})
export class OrganizationRegistrationApplicationModule {}
