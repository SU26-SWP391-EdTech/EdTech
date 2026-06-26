import { Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayloadUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { RoleEnum } from 'src/common/enums/role.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { ProgressService } from './progress.service';

@ApiTags('Progress')
@Controller('progress')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProgressController {
  // learner went start 1 lesson will create lesson progress
  constructor(
    private readonly progressService: ProgressService
  ) {}
  @Post('lesson/:lessonId/start')
  @Roles(RoleEnum.LEARNER)
  @ApiOperation({
    summary: 'Start grogress of lesson',
    description:
      'Create lesson progress for the current learner when starting a lesson.',
  })
  @ApiParam({
    name: 'lessonId',
    type: Number,
    example: 1,
    description: 'Lesson ID',
  })
  public async createLessonProgress(
    @Param('lessonId', ParseIntPipe)
    lessonId: number,

    @CurrentUser()
    user: JwtPayloadUser,
  ) {
    return await this.progressService.startLessonService(user.userId, lessonId);
  }

  // learner complete lesson
  @Patch('lesson/:lessonId/complete')
  @Roles(RoleEnum.LEARNER)
  @ApiOperation({
    summary: 'Complete a lesson',
    description: 'Learner marks a lesson as completed',
  })
  @ApiParam({
    name: 'lessonId',
    type: Number,
    description: 'ID of the lesson to complete',
    example: 1,
  })
  public async completeLessonProgress(
    @Param('lessonId', ParseIntPipe)
    lessonId: number,

    @CurrentUser()
    user: JwtPayloadUser,
  ) {
    return await this.progressService.completeLessonService(user.userId, lessonId);
  }

  // learner can see progress lesson of myself
  @Get('lessonId/:lessonId/complete')
  @Roles(RoleEnum.LEARNER)
   @ApiOperation({
    summary: 'Get lesson progress',
    description: 'Learner gets their own progress status of a lesson',
  })
  @ApiParam({
    name: 'lessonId',
    type: Number,
    description: 'ID of the lesson',
    example: 1,
  })
  public async getProgessLesson(
    @Param('lessonId', ParseIntPipe)
    lessonId: number,

    @CurrentUser()
    user: JwtPayloadUser
  ) {
    return this.progressService.findByUserAndLessonService(user.userId, lessonId);
  }
}
