import { Controller, Post, Delete, Get, Body, UseGuards, Req, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { LearningPathsService } from './learning-paths.service';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { RoleEnum } from 'src/common/enums/role.enum';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AddCourseToLearningPathDto } from './dto/add-course-to-learning-path.dto';
import { UpdateLearningPathDto } from './dto/update-learning-path.dto';
import { UpdateCoursePositionDto } from './dto/update-course-position.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { LearningPathFollowingResponseDto } from './dto/learning-path-following-response.dto';

@ApiTags('Learning paths')
@Controller('learning-paths')
export class LearningPathsController {
  constructor(private readonly learningPathsService: LearningPathsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ACADEMIC_MANAGER)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post()
  @ApiOperation({ summary: 'Create a learning path' })
  @ApiBody({ type: CreateLearningPathDto })
  @ApiResponse({ status: 201, description: 'Learning path created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createLearningPathDto: CreateLearningPathDto, @Req() req: any) {
    return this.learningPathsService.create(createLearningPathDto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ACADEMIC_MANAGER)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post(':id/courses')
  @ApiOperation({ summary: 'Add a course to a learning path' })
  @ApiBody({ type: AddCourseToLearningPathDto })
  @ApiResponse({ status: 200, description: 'Course added to learning path successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Learning path or course not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  public async addCourse(
    @Param('id', ParseIntPipe) learningPathId: number,
    @Body() dto: AddCourseToLearningPathDto,
    @Req() req: any,
  ) {
    return this.learningPathsService.addCourse(learningPathId, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ACADEMIC_MANAGER)
  @Delete(':id/courses/:courseId')
  @ApiOperation({ summary: 'Remove a course from a learning path' })
  @ApiResponse({ status: 200, description: 'Course removed from learning path successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Learning path or course not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  public async removeCourse(
    @Param('id', ParseIntPipe) learningPathId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.learningPathsService.removeCourse(learningPathId, courseId);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all learning paths' })
  @ApiResponse({ status: 200, description: 'List of all learning paths' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'No learning paths found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAll() {
    return this.learningPathsService.getAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get learning path detail by ID' })
  @ApiResponse({ status: 200, description: 'Learning path details' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Learning path not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.learningPathsService.getLearningPathById(id);
  }

  @Public()
  @Get(':id/courses')
  @ApiOperation({ summary: 'Get courses in a learning path' })
  @ApiResponse({ status: 200, description: 'List of courses in the learning path' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Learning path not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  public async getCourses(@Param('id', ParseIntPipe) learningPathId: number) {
    return this.learningPathsService.getCoursesInLearningPath(learningPathId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ACADEMIC_MANAGER)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a learning path' })
  @ApiBody({ type: UpdateLearningPathDto })
  @ApiResponse({ status: 200, description: 'Learning path updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Learning path or course not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  public async updateLearningPath(
    @Param('id', ParseIntPipe) learningPathId: number,
    @Body() dto: UpdateLearningPathDto,
    @Req() req: any,
  ) {
    return this.learningPathsService.updateLearningPath(req.user, learningPathId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ACADEMIC_MANAGER)
  @Patch(':id/courses/:courseId/position')
  @ApiOperation({ summary: 'Update a course position in a learning path' })
  @ApiBody({ type: UpdateCoursePositionDto })
  @ApiResponse({ status: 200, description: 'Course position updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Learning path or course not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  public async updateCoursePos(
    @Param('id', ParseIntPipe) learningPathId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: UpdateCoursePositionDto,
    @Req() req: any,
  ) {
    return this.learningPathsService.updateCoursePosition(req.user, learningPathId, courseId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ACADEMIC_MANAGER)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a learning path' })
  @ApiResponse({ status: 200, description: 'Learning path deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Learning path not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  public async deleteLearningPath(@Param('id', ParseIntPipe) id: number) {
    return this.learningPathsService.delete(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.LEARNER, RoleEnum.COURSE_PROVIDER, RoleEnum.ACADEMIC_MANAGER)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post(':learningPathId')
  @ApiOperation({ summary: 'Follow a learning path' })
  @ApiResponse({ status: 200, description: 'Learning path followed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Learning path not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  public async followLearningPath(@Param('learningPathId', ParseIntPipe) learningPathId: number, @Req() req) {
    return this.learningPathsService.followLearningPathService(learningPathId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.COURSE_PROVIDER, RoleEnum.ACADEMIC_MANAGER)
  @Get(':learningPathId/follower')
  @ApiOperation({ summary: 'View followers of a learning path' })
  @ApiResponse({ status: 200, description: 'Followers returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Learning path not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  public async viewLearningPathFollower(@Param('learningPathId', ParseIntPipe) learningPathId: number) {
    return this.learningPathsService.viewLearningPathFollower(learningPathId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.LEARNER)
  @Get('me/following-learning-paths')
  @ApiOperation({ summary: 'Get learning paths I am following' })
  @ApiResponse({ status: 200, description: 'Following learning paths returned successfully', type: LearningPathFollowingResponseDto, isArray: true })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getMyFollowingLearningPaths(@Req() req): Promise<LearningPathFollowingResponseDto[]> {
    return await this.learningPathsService.getMyFollowingLearningPaths(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.LEARNER)
  @Delete('learning-paths/:learningPathId/unfollow')
  @ApiOperation({ summary: 'Unfollow a learning path' })
  @ApiResponse({ status: 200, description: 'Learning path unfollowed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Follow relationship not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async unfollowLearningPath(@Param('learningPathId', ParseIntPipe) learningPathId: number, @Req() req): Promise<void> {
    await this.learningPathsService.unfollowLearningPath(learningPathId, req.user.userId);
  }
}
