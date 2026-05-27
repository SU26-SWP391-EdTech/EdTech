import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseIntPipe, Req } from '@nestjs/common';
import { LearnersService } from './learners.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateLearnerProfileDto } from './dto/update-learner-profile.dto';
import { ChangePasswordDto } from '../users/dto/change-password.dto';
import { UsersService } from '../users/users.service';
import { UpdateLearnerInfoDto } from './dto/update-learner-info.dto';


@Controller('learners')
export class LearnersController {
  constructor(
    private readonly learnersService: LearnersService,
    private usersService:UsersService,
  ) {}

  @Patch('update-profile/:id')
  async updateProfile(@Param('id') id:number, @Body() dto: UpdateLearnerInfoDto){
    return this.learnersService.updateProfile(id, dto);
  }

  @Patch('change-password')
  async changePassword(@Req() req, @Body() dto:ChangePasswordDto){
    return this.usersService.changePassword(req.user.id, dto);
  }

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
