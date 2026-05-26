import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JoinOrganizationApplication } from './entities/join-organization-application.entity';
import { JoinOrganizationApplicationService } from './join-organization-application.service';
import { JoinOrganizationApplicationController } from './join-organization-application.controller';
import { JoinOrganizationApplicationRepository } from './join-organization-application.repository';
import { OrganizationMemberProfilesModule } from '../organization-member-profiles/organization-member-profiles.module';
import { UsersModule } from '../users/users.module';


@Module({
    imports: [TypeOrmModule.forFeature([JoinOrganizationApplication]), OrganizationMemberProfilesModule, UsersModule],
    providers: [
        JoinOrganizationApplicationService,
        JoinOrganizationApplicationRepository,
    ],
    controllers: [JoinOrganizationApplicationController]
})
export class JoinOrganizationApplicationModule {}
