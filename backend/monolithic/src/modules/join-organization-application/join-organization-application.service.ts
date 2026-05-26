import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JoinOrganizationApplicationRepository } from './join-organization-application.repository';
import { JoinOrganizationApplication } from './entities/join-organization-application.entity';
import { OrganizationMemberProfilesService } from '../organization-member-profiles/organization-member-profiles.service';
import { UsersService } from '../users/users.service';
import { DataSource } from 'typeorm';
import { ReviewJoinApplicationDto } from './dto/review-join-application.dto';
import { JoinOrganizationApplicationStatus } from 'src/common/enums/join-organization-application.enum';
import { CreateJoinOrganizationApplicationDto } from './dto/create-join-organization-application.dto';
import { RoleName } from 'src/common/constants/role.constants';


@Injectable()
export class JoinOrganizationApplicationService {
    constructor(
        private readonly repository: JoinOrganizationApplicationRepository,
            private readonly organizationMemberProfilesService: OrganizationMemberProfilesService,
            private readonly usersService: UsersService,
            private readonly dataSource: DataSource,
    ) {}

    async findAll(): Promise<JoinOrganizationApplication[]> {
        return this.repository.findAll();
    }

    async findByUserId(userId: number): Promise<JoinOrganizationApplication[]> {
        return this.repository.findByUserId(userId);
    }

    async findByOrganizationMemberProfile(userId: number): Promise<JoinOrganizationApplication[]> {
        return this.repository.findByOrganizationMemberProfile(userId);
    }

    async findByOrganizationId(organizationId: number): Promise<JoinOrganizationApplication[]> {
        return this.repository.findByOrganizationId(organizationId);
    }

    public async createJoinApplication(
        dto: CreateJoinOrganizationApplicationDto,
        requestUserId: number,
    ): Promise<JoinOrganizationApplication> {
        const user = await this.usersService.findOne(requestUserId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.role?.roleName !== RoleName.COURSE_PROVIDER) {
            throw new BadRequestException('Only course provider users may create join requests');
        }

        const existingProfile = await this.organizationMemberProfilesService.findByUserId(requestUserId);
        if (existingProfile) {
            throw new BadRequestException('User already belongs to an organization and cannot create a new join application');
        }

        const existingApplication = await this.repository.findByUserAndOrganization(
            requestUserId,
            dto.organizationId,
            JoinOrganizationApplicationStatus.PENDING,
        );
        if (existingApplication) {
            throw new BadRequestException('A pending join application for this organization already exists');
        }

        return this.repository.createApplication({
            userId: requestUserId,
            organizationId: dto.organizationId,
            message: dto.message,
            status: JoinOrganizationApplicationStatus.PENDING,
        });
    }

    public async approveApplication(
        applicationId: number,
        reviewerUserId: number,
        dto: ReviewJoinApplicationDto,
    ) {
        const application = await this.repository.findById(applicationId);
        if (!application) {
            throw new NotFoundException('Application not found');
        }

        if (application.status !== JoinOrganizationApplicationStatus.PENDING) {
            throw new BadRequestException('Application is already processed');
        }

        // reviewer must exist
        const reviewer = await this.usersService.findOne(reviewerUserId);
        if (!reviewer) {
            throw new NotFoundException('Reviewer not found');
        }

        // reviewer must have organization member profile
        const reviewerProfile = await this.organizationMemberProfilesService.findByUserId(reviewerUserId);
        if (!reviewerProfile) {
            throw new BadRequestException('Reviewer is not a member of any organization');
        }

        // application must target the same organization as reviewer
        if (application.organizationId !== reviewerProfile.organizationId) {
            throw new BadRequestException('Reviewer is not authorized for this organization');
        }

        // cannot approve own application
        if (reviewerUserId === application.userId) {
            throw new BadRequestException('Reviewer cannot be the requester');
        }

        await this.dataSource.transaction(async (manager) => {
            // check requester not already member
            const existingProfile = await this.organizationMemberProfilesService.findByUserId(application.userId, manager);
            if (existingProfile) {
                throw new BadRequestException('Requester already belongs to an organization');
            }

            // update application
            application.status = JoinOrganizationApplicationStatus.APPROVED;
            application.reviewReason = dto.reviewReason;
            application.reviewedBy = reviewer;
            application.reviewedAt = new Date();
            await manager.save(application);

            // add organization member profile for requester
            await this.organizationMemberProfilesService.createMemberProfile({
                userId: application.userId,
                organizationId: application.organizationId,
            }, manager);
        });

        return { message: 'Application approved' };
    }

    public async rejectApplication(
        applicationId: number,
        reviewerUserId: number,
        dto: ReviewJoinApplicationDto,
    ) {
        const application = await this.repository.findById(applicationId);
        if (!application) {
            throw new NotFoundException('Application not found');
        }

        if (application.status !== JoinOrganizationApplicationStatus.PENDING) {
            throw new BadRequestException('Application is already processed');
        }

        const reviewer = await this.usersService.findOne(reviewerUserId);
        if (!reviewer) {
            throw new NotFoundException('Reviewer not found');
        }

        const reviewerProfile = await this.organizationMemberProfilesService.findByUserId(reviewerUserId);
        if (!reviewerProfile) {
            throw new BadRequestException('Reviewer is not a member of any organization');
        }

        if (application.organizationId !== reviewerProfile.organizationId) {
            throw new BadRequestException('Reviewer is not authorized for this organization');
        }

        if (reviewerUserId === application.userId) {
            throw new BadRequestException('Reviewer cannot be the requester');
        }

        application.status = JoinOrganizationApplicationStatus.REJECTED;
        application.reviewReason = dto.reviewReason;
        application.reviewedBy = reviewer;
        application.reviewedAt = new Date();

        await this.repository.save(application);

        return { message: 'Application rejected' };
    }
}
