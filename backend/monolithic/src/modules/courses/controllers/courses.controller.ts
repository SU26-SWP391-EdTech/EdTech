import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Req,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from '../services/courses.service';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { SearchCourseDto } from '../dto/search-course.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RoleEnum } from 'src/common/enums/role.enum';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { ApproveCourseDto, CourseTagsDto } from '../dto/course-tags.dto';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.COURSE_PROVIDER)
  @Post()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseInterceptors(FileInterceptor('thumbnailUrl'))
  @ApiOperation({ summary: 'Create a course' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateCourseDto })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Req() req,
    @Body() createCourseDto: CreateCourseDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.coursesService.create(createCourseDto, req.user.userId, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.COURSE_PROVIDER)
  @Post('submit-to-review')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseInterceptors(FileInterceptor('thumbnailUrl'))
  @ApiOperation({ summary: 'Create a course and submit it for review' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateCourseDto })
  @ApiResponse({
    status: 201,
    description: 'Course created and submitted for review successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Only Course Providers can submit courses for review',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  submitNewCourseToReview(
    @Req() req,
    @Body() createCourseDto: CreateCourseDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.coursesService.createAndSubmitToReview(
      createCourseDto,
      req.user.userId,
      file,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.COURSE_PROVIDER)
  @Post(':courseId/submit-review')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Submit an existing draft course for review' })
  @ApiResponse({
    status: 200,
    description: 'Draft course submitted for review successfully',
  })
  @ApiResponse({ status: 400, description: 'Only draft courses can be submitted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  submitDraftToReview(
    @Req() req,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.coursesService.submitDraftToReview(req.user.userId, courseId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.COURSE_PROVIDER)
  @Post(':courseId/submit-to-review')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Submit an existing draft course for review' })
  submitDraftToReviewLegacy(
    @Req() req,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.coursesService.submitDraftToReview(req.user.userId, courseId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ACADEMIC_MANAGER, RoleEnum.COURSE_PROVIDER, RoleEnum.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({
    status: 200,
    description: 'All Courses returned successfully',
  })
  async findAllCourse() {
    return this.coursesService.findAll();
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search courses' })
  @ApiResponse({ status: 200, description: 'Courses returned successfully' })
  async search(@Query() query: SearchCourseDto) {
    return this.coursesService.search(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get course detail' })
  @ApiResponse({ status: 200, description: 'Course returned successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @Roles(RoleEnum.COURSE_PROVIDER, RoleEnum.ACADEMIC_MANAGER)
  @UseInterceptors(FileInterceptor('thumbnailUrl'))
  @ApiOperation({ summary: 'Update a course' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateCourseDto })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({
    status: 403,
    description: 'You dont have permission to access',
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
    @Req() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.coursesService.update(
      id,
      updateCourseDto,
      req.user.userId,
      file,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ACADEMIC_MANAGER)
  @Patch(':id/tags')
  @ApiOperation({ summary: 'Set official course tags' })
  @ApiResponse({ status: 200, description: 'Course tags updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid tags' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  updateCourseTags(
    @Param('id', ParseIntPipe) id: number,
    @Body() courseTagsDto: CourseTagsDto,
  ) {
    return this.coursesService.updateCourseTags(id, courseTagsDto.tags);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ACADEMIC_MANAGER)
  @Delete(':id/tags/:tagId')
  @ApiOperation({ summary: 'Remove a tag from a course' })
  @ApiResponse({ status: 200, description: 'Tag removed from course successfully' })
  @ApiResponse({ status: 404, description: 'Course or tag not found' })
  removeCourseTag(
    @Param('id', ParseIntPipe) id: number,
    @Param('tagId', ParseIntPipe) tagId: number,
  ) {
    return this.coursesService.removeCourseTag(id, tagId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @Roles(RoleEnum.COURSE_PROVIDER, RoleEnum.ACADEMIC_MANAGER)
  @ApiOperation({ summary: 'Delete a course' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'You dont have permission to delete',
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.coursesService.remove(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ACADEMIC_MANAGER)
  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a course' })
  @ApiResponse({ status: 200, description: 'Course approved successfully' })
  @ApiResponse({
    status: 400,
    description: 'Course is not in pending status or missing lessons',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires Academic Manager role',
  })
  @ApiResponse({ status: 404, description: 'Course or Reviewer not found' })
  approveCourse(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() approveCourseDto: ApproveCourseDto,
  ) {
    return this.coursesService.approveCourse(
      id,
      req.user.userId,
      approveCourseDto.tags,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ACADEMIC_MANAGER)
  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a course' })
  @ApiResponse({ status: 200, description: 'Course rejected successfully' })
  @ApiResponse({ status: 400, description: 'Course is not in pending status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires Academic Manager role',
  })
  @ApiResponse({ status: 404, description: 'Course or Reviewer not found' })
  rejectCourse(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body('reason') reason?: string,
  ) {
    return this.coursesService.rejectCourse(id, req.user.userId, reason);
  }
}
