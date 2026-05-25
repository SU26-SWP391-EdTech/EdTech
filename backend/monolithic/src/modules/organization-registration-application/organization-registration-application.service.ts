import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationRegistrationApplicationRepository } from './organization-registration-application.repository';
import { CreateOrganizationRegistrationApplicationDto } from './dto/create-organization-registration-application.dto';
import { UsersService } from '../users/users.service';
import { DataSource } from 'typeorm';
import { OrganizationsService } from '../organizations/organizations.service';
import { OrganizationMemberProfilesService } from '../organization-member-profiles/organization-member-profiles.service';
import { OrganizationRegistrationApplicationStatus } from 'src/common/enums/organization-registration-application.enum';
import { RejectOrganizationRegistrationApplicationDto } from './dto/reject-organization-registration-application.dto';

@Injectable()
export class OrganizationRegistrationApplicationService {
  constructor(
    private readonly userService: UsersService,
    private readonly organizationRegistrationApplicationRepository: OrganizationRegistrationApplicationRepository,
    private readonly organizationsService: OrganizationsService,
    private readonly organizationMemberProfilesService: OrganizationMemberProfilesService,
    private readonly dataSource: DataSource,
  ) { }

  public async getAllOrganizationRegistrationApplications() {
    return this.organizationRegistrationApplicationRepository.getAllOrganizationRegistrationApplications();
  }

  public async createApplication(
    requestUserId: number,
    dto: CreateOrganizationRegistrationApplicationDto,
  ) {
    const existedEmail =
      await this.organizationRegistrationApplicationRepository.findByOrgEmail(
        dto.orgEmail,
      );

    if (existedEmail) {
      throw new BadRequestException('Organization email already exists');
    }

    const existedTaxCode =
      await this.organizationRegistrationApplicationRepository.findByTaxCode(
        dto.taxCode,
      );
    if (existedTaxCode) {
      throw new BadRequestException('Tax code already exists');
    }

    const existedPhone =
      await this.organizationRegistrationApplicationRepository.findByPhone(
        dto.phone,
      );
    if (existedPhone) {
      throw new BadRequestException('Phone number already exists');
    }

    const currentUser = await this.userService.findOne(requestUserId);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }
    const application =
      await this.organizationRegistrationApplicationRepository.createApplication(
        {
          requesterUser: currentUser,
          orgName: dto.orgName,
          orgEmail: dto.orgEmail,
          website: dto.website,
          phone: dto.phone,
          description: dto.description,
          logoUrl: dto.logoUrl,
          licenseDocumentUrl: dto.licenseDocumentUrl,
          taxCode: dto.taxCode,
          address: dto.address,
        },
      );

    return {
      message: 'Send organization registration application successfully',
      data: application,
    };
  }

  // ================= APPROVE =================
  public async approveApplication(applicationId: number, adminUserId: number) {
    // Tìm đơn đăng ký tổ chức theo applicationId
    const application = await this.organizationRegistrationApplicationRepository.findById(applicationId);
    if (!application) {
      throw new NotFoundException('Organization registration application not found');
    }

    // Kiểm tra đơn có tồn tại không
    if (application.status !== OrganizationRegistrationApplicationStatus.PENDING) {
      throw new BadRequestException('Application is already processed');
    }

    const adminUser = await this.userService.findOne(adminUserId);
    if (!adminUser) {
      throw new NotFoundException('Admin user not found');
    }

    // kiểm tra requestUserId và adminId không bị trùng
    if (adminUser.userId === application.requesterUser.userId) {
      throw new BadRequestException('Requester and admin user cannot be the same');
    }

    await this.dataSource.transaction(async (manager) => {
      // Kiểm tra xem user đã thuộc tổ chức nào chưa
      const existingProfile = await this.organizationMemberProfilesService.findByUserId(
        application.requesterUser.userId,
        manager,
      );
      if (existingProfile) {
        throw new BadRequestException('Requester already belongs to an organization');
      }

      // Tạo tổ chức thực tế qua OrganizationsService
      const newOrg = await this.organizationsService.createOrganization(
        {
          organizationName: application.orgName,
          organizationEmail: application.orgEmail,
          logoUrl: application.logoUrl,
          description: application.description,
        },
        manager,
      );

      // Tạo hồ sơ thành viên qua OrganizationMemberProfilesService
      await this.organizationMemberProfilesService.createMemberProfile(
        {
          userId: application.requesterUser.userId,
          organizationId: Number(newOrg.organizationId),
        },
        manager,
      );

      // Cập nhật trạng thái đơn đăng ký
      application.status = OrganizationRegistrationApplicationStatus.APPROVED;
      application.reviewedBy = adminUser;
      await manager.save(application);
    });

    return {
      message: 'Approve organization registration application successfully',
    };
  }

  // ================= Reject ================
  // Tim đơn đăng ký
  // Kiểm tra xem cái đơn đó có tồn tại hay không
  // Kiểm tra xem đơn đó đã được duyệt hay chưa 
  // Đổi trạng thái thành reject
  // lưu lý do từ chối đó
  // lưu người đã review đơn đó (admin)
  // save xuống database
  public async rejectApplication(
    applicationId: number,
    adminUserId: number,
    dto: RejectOrganizationRegistrationApplicationDto,
  ) {
    // Tim đơn đăng ký
    const application = await this.organizationRegistrationApplicationRepository.findById(applicationId);
    if (!application) {
      throw new NotFoundException('Organization registration application not found');
    }

    if (application.status !== OrganizationRegistrationApplicationStatus.PENDING) {
      throw new BadRequestException('Application is already processed');
    }

    const adminUser = await this.userService.findOne(adminUserId);
    if (!adminUser) {
      throw new NotFoundException('Admin user not found');
    }

    // kiểm tra requestUserId và adminId không bị trùng
    if (adminUser.userId === application.requesterUser.userId) {
      throw new BadRequestException('Requester and admin user cannot be the same');
    }

    application.status = OrganizationRegistrationApplicationStatus.REJECTED;
    application.reviewReason = dto.reviewReason;
    application.reviewedBy = adminUser;

    await this.organizationRegistrationApplicationRepository.save(application);

    return {
      message: 'Reject organization registration application successfully',
    };
  }


}
