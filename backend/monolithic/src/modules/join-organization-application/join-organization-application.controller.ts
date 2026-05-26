import { Controller, Get, Param, ParseIntPipe, UseGuards, Patch, Body, Post } from '@nestjs/common';
import { JoinOrganizationApplicationService } from './join-organization-application.service';
import { CurrentUser, type JwtPayloadUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { RoleName } from 'src/common/constants/role.constants';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { ReviewJoinApplicationDto } from './dto/review-join-application.dto';
import { CreateJoinOrganizationApplicationDto } from './dto/create-join-organization-application.dto';

@ApiTags('join-organization-application')
@ApiBearerAuth()
@Controller('join-organization-application')
export class JoinOrganizationApplicationController {

    constructor(private readonly joinOrganizationApplicationService: JoinOrganizationApplicationService) { }
    
    //find all applications, only for admin to view
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    findAll() {
        return this.joinOrganizationApplicationService.findAll();
    }

     //find all applications of an organization, only for admin to view
    @Get('organization/:organizationId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.ADMIN)
    findByOrganizationId(@Param('organizationId', ParseIntPipe) organizationId: number) {
        return this.joinOrganizationApplicationService.findByOrganizationId(organizationId);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.COURSE_PROVIDER)
    @ApiBody({ type: CreateJoinOrganizationApplicationDto })
    createJoinApplication(
      @CurrentUser() user: JwtPayloadUser,
      @Body() dto: CreateJoinOrganizationApplicationDto,
    ) {
      return this.joinOrganizationApplicationService.createJoinApplication(dto, user.userId);
    }

    @Patch(':id/approve')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.COURSE_PROVIDER)
    @ApiBody({
      type: ReviewJoinApplicationDto,
      schema: {
        example: { reviewReason: 'Application meets all onboarding requirements' },
      },
    })
    approveApplication(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayloadUser,
        @Body() dto: ReviewJoinApplicationDto,
    ) {
        return this.joinOrganizationApplicationService.approveApplication(id, user.userId, dto);
    }

    @Patch(':id/reject')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.COURSE_PROVIDER)
    @ApiBody({
      type: ReviewJoinApplicationDto,
      schema: {
        example: { reviewReason: 'Requester does not meet organization criteria' },
      },
    })
    rejectApplication(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayloadUser,
        @Body() dto: ReviewJoinApplicationDto,
    ) {
        return this.joinOrganizationApplicationService.rejectApplication(id, user.userId, dto);
    }

    //find all applications of a user, only for course provider to view their applications
    @Get('me')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.COURSE_PROVIDER)
    findMine(@CurrentUser() user: JwtPayloadUser) {
        return this.joinOrganizationApplicationService.findByUserId(user.userId);
    }

    //organization_member_profiles entity is needed to search organizationId with this userID
    @Get('organization-applications')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleName.COURSE_PROVIDER)
    findByOrganizationMemberProfile(@CurrentUser() user: JwtPayloadUser) {
        return this.joinOrganizationApplicationService.findByOrganizationMemberProfile(user.userId);
    }

}