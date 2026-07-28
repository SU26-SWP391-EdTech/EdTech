import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Req,
  Query,
} from '@nestjs/common';
import { LessonsService } from '../service/lessons.service';
import { LessonPrerequisiteService } from '../service/lesson-prerequisite.service';
import { CreateLessonDto } from '../dto/create-lesson.dto';
import { UpdateLessonDto } from '../dto/update-lesson.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { RoleEnum } from 'src/common/enums/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from 'src/common/decorators/public.decorator';
import { UpdateLessonPrerequisitesDto } from '../dto/update-lesson-prerequisites.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayloadUser } from 'src/common/decorators/current-user.decorator';
import { ReorderLessonsDto } from '../dto/reorder-lesson.dto';

@ApiTags('Lessons')
@Controller('lessons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LessonsController {
  constructor(
    private readonly lessonsService: LessonsService,
    private readonly lessonPrerequisiteService: LessonPrerequisiteService,
  ) {}

  @Post(':courseId')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.COURSE_PROVIDER)
  @UseInterceptors(FileInterceptor('videoUrl'))
  @ApiOperation({ summary: 'Create a lesson in a course' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateLessonDto })
  @ApiResponse({ status: 201, description: 'Lesson created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() createLessonDto: CreateLessonDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.lessonsService.create(courseId, createLessonDto, file);
  }

  @Public()
  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get all lessons by course' })
  @ApiResponse({ status: 200, description: 'Lessons returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAllByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return await this.lessonsService.findAllByCourse(courseId);
  }

  @Get('course/:courseId/content')
  @ApiOperation({ summary: 'Get protected lesson content by course' })
  @ApiResponse({ status: 403, description: 'Enrollment, ownership, or staff access required' })
  async findAllByCourseContent(@Param('courseId', ParseIntPipe) courseId: number, @CurrentUser() user: JwtPayloadUser) {
    return await this.lessonsService.findAllByCourseContent(courseId, user.userId, user.roleName);
  }

  @Get('manager-review/:courseId')
  @Roles(RoleEnum.ACADEMIC_MANAGER)
  @ApiOperation({ summary: 'Academic Manager: get all lessons of a course for review (no enrollment required)' })
  @ApiResponse({ status: 200, description: 'Lessons returned successfully for review' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires Academic Manager role' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findAllByCourseForManager(@Param('courseId', ParseIntPipe) courseId: number) {
    return await this.lessonsService.findAllByCourseForManager(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson detail' })
  @ApiResponse({ status: 200, description: 'Lesson returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return await this.lessonsService.findLesson(id, req.user.userId, req.user.roleName);
  }

  @Patch(':courseId')
  @Roles(RoleEnum.COURSE_PROVIDER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('videoUrl'))
  @ApiOperation({ summary: 'Update a lesson in a course' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateLessonDto })
  @ApiResponse({ status: 200, description: 'Lesson updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async update(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query('lessonId', ParseIntPipe) lessonId: number,
    @Body() updateLessonDto: UpdateLessonDto,
    @CurrentUser() user: JwtPayloadUser,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.lessonsService.update(
      courseId,
      lessonId,
      updateLessonDto,
      file,
      user.userId,
    );
  }

  @Delete(':id')
  @Roles(RoleEnum.COURSE_PROVIDER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Delete a lesson' })
  @ApiResponse({ status: 200, description: 'Lesson deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.lessonsService.remove(id);
  }

  // course provider will create lesson prerequisites
  @Post(':lessonId/prerequisites')
  @Roles(RoleEnum.COURSE_PROVIDER)
  @ApiOperation({ summary: 'Update prerequisite lessons for a lesson' })
  @ApiBody({ type: UpdateLessonPrerequisitesDto })
  public async updatePrerequisites(
    @Param('lessonId', ParseIntPipe)
    lessonId: number,

    @Body()
    updateLessonPrerequisitesDto: UpdateLessonPrerequisitesDto,

    @CurrentUser()
    user: JwtPayloadUser,
  ) {
    return await this.lessonPrerequisiteService.updatePrerequisitesService(
      lessonId,
      updateLessonPrerequisitesDto,
      user.userId,
    );
  }

  @Get(':lessonId/milestones')
  @ApiOperation({ summary: 'Get prerequisite by lesson Id' })
  public async getMilestonesByLessonId(
    @Param('lessonId', ParseIntPipe) lessonId: number,
  ) {
    return this.lessonPrerequisiteService.getPrerequisitesByLessonIdService(lessonId);
  }

  @Patch(':lessonId/reorder')
  @Roles(RoleEnum.COURSE_PROVIDER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Reorder lessons in a course' })
  @ApiBody({ type: ReorderLessonsDto })
  @ApiResponse({ status: 200, description: 'Lessons reordered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async reorderLessons(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Body() reorderLessonsDto: ReorderLessonsDto,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return await this.lessonsService.reorderLessons(lessonId, reorderLessonsDto, user.userId);
  }
}
