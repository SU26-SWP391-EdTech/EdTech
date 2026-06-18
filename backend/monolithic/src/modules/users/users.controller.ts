import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { UpdateAcademicUserInfoDto } from './dto/update-academic-user-info.dto';
import { EditAcademicUserProfileDto } from './dto/edit-academic-user-profile.dto';
import { GetAcademicUserProfileDto } from './dto/get-academic-user-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoleEnum } from 'src/common/enums/role.enum';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Users')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUser(@Param('id') id: string) {
    return this.usersService.findOne(Number(id));
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @Roles(RoleEnum.COURSE_PROVIDER, RoleEnum.ACADEMIC_MANAGER, RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @Post() 
  @ApiOperation({ summary: 'Create a user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() CreateUserDto: CreateUserDto) {
    return this.usersService.create(CreateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ACADEMIC_MANAGER, RoleEnum.COURSE_PROVIDER, RoleEnum.LEARNER)
  @Patch('change-password')
  @ApiOperation({ summary: 'Change current user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async changePassword(
    @Req() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(req.user.userId, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.COURSE_PROVIDER,RoleEnum.ACADEMIC_MANAGER)
  @Patch('update-academic-user-profile/:id')
  @ApiOperation({ summary: 'Update academic user profile information' })
  @ApiResponse({ status: 200, description: 'Academic user profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Academic user not found' })
  async updateProfile(
    @Param('id') id: number,
    @Body() dto: UpdateAcademicUserInfoDto,
  ) {
    return this.usersService.updateProfile(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.COURSE_PROVIDER,RoleEnum.ACADEMIC_MANAGER)
  @Patch('edit-academic-user-profile/:id')
  @UseInterceptors(FileInterceptor('avatarUrl'))
  @ApiOperation({ summary: 'Edit academic user profile with avatar upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: EditAcademicUserProfileDto })
  @ApiResponse({ status: 200, description: 'Academic user profile edited successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Academic user not found' })
  async editAcademicUserProfile(
    @Param('id') id: number,
    @Body() dto: EditAcademicUserProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usersService.editAcademicUserProfile(id, dto, file);
  }
  @Public()
  @Get('academic-user/:id')
  @ApiOperation({ summary: 'View academic user profile' })
  @ApiResponse({ status: 200, description: 'Academic user profile returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Academic user not found' })
  async viewAcademicUserProfile(
    @Param('id') id: number,
    dto: GetAcademicUserProfileDto,
  ) {
    return this.usersService.viewAcademicUserProfile(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @Get('admin/dashboard')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getDashboardStats() {
    return this.usersService.getAdminDashboardStats();
  }

  @Roles(RoleEnum.ADMIN)
  @Get('admin/analytics')
  @ApiOperation({ summary: 'Get admin analytics statistics' })
  @ApiResponse({ status: 200, description: 'Analytics stats returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getAnalyticsStats() {
    return this.usersService.getAdminAnalyticsStats();
  }

  @Roles(RoleEnum.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() UpdateUserDto: UpdateUserDto) {
    return this.usersService.update(Number(id), UpdateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(Number(id));
  }
}
