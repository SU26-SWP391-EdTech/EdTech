import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { LearnersService } from './learners.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateLearnerProfileDto } from './dto/update-learner-profile.dto';
import { ChangePasswordDto } from '../users/dto/change-password.dto';
import { UsersService } from '../users/users.service';
import { UpdateLearnerInfoDto } from './dto/update-learner-info.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { Role } from '../roles/entities/role.entity';


@Controller('learners')
export class LearnersController {
  constructor(
    private readonly learnersService: LearnersService,
    private usersService:UsersService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('learner')
  @Patch('update-profile/:id')
  async updateProfile(@Param('id') id:number, @Body() dto: UpdateLearnerInfoDto){
    return this.learnersService.updateProfile(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('learner')
  @Patch('change-password')
  async changePassword(@Req() req, @Body() dto:ChangePasswordDto){
    return this.usersService.changePassword(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('learner')
  @Patch('edit-profile/:id')
  @UseInterceptors(FileInterceptor('file'))
  async editLearnerProfile(
    @Param('id', ParseIntPipe) id: number,

    @Body() dto: UpdateLearnerProfileDto,

    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.learnersService.editLearnerProfile(
      id,
      dto,
      file,
    );
  }
  
  @Get(':id')
  async viewLearnerProfile(@Param('id') id: number){
    return this.learnersService.viewLearnerProfile(id);
  }
}
