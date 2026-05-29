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

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.findOne(Number(id));
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() CreateUserDto: CreateUserDto) {
    return this.usersService.create(CreateUserDto);
  }

  @Roles('course provider','academic manager','learner')
  @Patch('change-password')
  async changePassword(
    @Req() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(req.user.id, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('course provider','academic manager')
  @Patch('update-academic-user-profile/:id')
  async updateProfile(
    @Param('id') id: number,
    @Body() dto: UpdateAcademicUserInfoDto,
  ) {
    return this.usersService.updateProfile(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('course provider','academic manager')
  @Patch('edit-academic-user-profile/:id')
  async editAcademicUserProfile(
    @Param('id') id: number,
    @Body() dto: EditAcademicUserProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usersService.editAcademicUserProfile(id, dto, file);
  }

  @Get('academic-user/:id')
  async viewAcademicUserProfile(
    @Param('id') id: number,
    dto: GetAcademicUserProfileDto,
  ) {
    return this.usersService.viewAcademicUserProfile(id, dto);
  }

  
  @Patch(':id')
  update(@Param('id') id: string, @Body() UpdateUserDto: UpdateUserDto) {
    return this.usersService.update(Number(id), UpdateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(Number(id));
  }
}
