import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { OrganizationRegistrationApplicationService } from './organization-registration-application.service';
import { CreateOrganizationRegistrationApplicationDto } from './dto/create-organization-registration-application.dto';
import { RejectOrganizationRegistrationApplicationDto } from './dto/reject-organization-registration-application.dto';
import {
  CurrentUser,
  type JwtPayloadUser,
} from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';

@Controller('organization-registration-application')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationRegistrationApplicationController {
  constructor(
    private readonly organizationRegistrationApplicationService: OrganizationRegistrationApplicationService,
  ) { }

  // xu ly sau
  @Get()
  public getAllOrganizationRegistrationApplications() {
    return this.organizationRegistrationApplicationService.getAllOrganizationRegistrationApplications();
  }

  // gui don dang ky to chuc
  @Roles('course provider')
  @Post()
  public async createApplication(
    @CurrentUser()
    requestUser: JwtPayloadUser,

    @Body()
    dto: CreateOrganizationRegistrationApplicationDto,
  ) {
    return await this.organizationRegistrationApplicationService.createApplication(
      requestUser.userId,
      dto,
    );
  }

  // duyệt đơn đăng ký
  @Roles('admin')
  @Patch(':id/approve')
  public async approveApplication(
    @Param('id')
    id: string,

    @CurrentUser()
    requestUser: JwtPayloadUser,
  ) {
    return await this.organizationRegistrationApplicationService.approveApplication(
      Number(id),
      requestUser.userId,
    );
  }

  // từ chối đơn đăng ký
  @Roles('admin')
  @Patch(':id/reject')
  public async rejectApplication(
    @Param('id') id: string,

    @CurrentUser()
    requestUser: JwtPayloadUser,

    @Body()
    dto: RejectOrganizationRegistrationApplicationDto,
  ) {
    return await this.organizationRegistrationApplicationService.rejectApplication(
      Number(id),
      requestUser.userId,
      dto,
    );
  }
}
