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
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { RoleEnum } from 'src/common/enums/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Lessons')
@Controller('lessons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) { }

  @Post(':id')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Roles(RoleEnum.COURSE_PROVIDER)
  @UseInterceptors(FileInterceptor('videoUrl'))
  @ApiOperation({ summary: 'Create a lesson in a course' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateLessonDto })
  @ApiResponse({ status: 201, description: 'Lesson created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Param('id', ParseIntPipe) courseId: number, @Body() createLessonDto: CreateLessonDto, @UploadedFile() file?: Express.Multer.File) {
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

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson detail' })
  @ApiResponse({ status: 200, description: 'Lesson returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return await this.lessonsService.findLesson(id, req.user.userId);
  }

  @Patch(':courseId')
  @Roles(RoleEnum.COURSE_PROVIDER)
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
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.lessonsService.update(courseId, lessonId, updateLessonDto, file);
  }

  @Delete(':id')
  @Roles(RoleEnum.COURSE_PROVIDER)
  @ApiOperation({ summary: 'Delete a lesson' })
  @ApiResponse({ status: 200, description: 'Lesson deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.lessonsService.remove(id);
  }
}
