import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { LearnersService } from './learners.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { EditLearnerProfileDto } from './dto/edit-learner-profile.dto';
import { ChangePasswordDto } from '../users/dto/change-password.dto';
import { UsersService } from '../users/users.service';
import { UpdateLearnerInfoDto } from './dto/update-learner-info.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';


@ApiTags('Learners')
@Controller('learners')
export class LearnersController {
  constructor(
    private readonly learnersService: LearnersService,
    private usersService:UsersService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('learner')
  @Patch('update-profile/:id')
  @ApiOperation({ summary: 'Update learner profile information' })
  @ApiResponse({ status: 200, description: 'Learner profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Learner not found' })
  async updateProfile(@Param('id') id:number, @Req() req, @Body() dto: UpdateLearnerInfoDto){
    return this.learnersService.updateProfile(id, req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('learner')
  @Patch('change-password')
  @ApiOperation({ summary: 'Change learner password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async changePassword(@Req() req, @Body() dto:ChangePasswordDto){
    return this.usersService.changePassword(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('learner')
  @Patch('edit-profile/:id')
  @UseInterceptors(FileInterceptor('avatarUrl'))
  @ApiOperation({ summary: 'Edit learner profile with avatar upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: EditLearnerProfileDto })
  @ApiResponse({ status: 200, description: 'Learner profile edited successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Learner not found' })
  async editLearnerProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditLearnerProfileDto,
    @Req() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.learnersService.editLearnerProfile(
      id,
      dto,
      req.user.userId,
      file,
    );
  }
  
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'View learner profile' })
  @ApiResponse({ status: 200, description: 'Learner profile returned successfully' })
  @ApiResponse({ status: 404, description: 'Learner not found' })
  async viewLearnerProfile(@Param('id') id: number){
    return this.learnersService.viewLearnerProfile(id);
  }
}
