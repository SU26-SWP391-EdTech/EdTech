import { Controller, Post, Delete, Get, Body, UseGuards, Req, Param, ParseIntPipe } from '@nestjs/common';
import { LearningPathsService } from './learning-paths.service';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { RoleEnum } from 'src/common/enums/role.enum';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AddCourseToLearningPathDto } from './dto/add-course-to-learning-path.dto';
import { User } from '../users/entities/user.entity';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Learning paths')
@Controller('learning-paths')
export class LearningPathsController {
  constructor(private readonly learningPathsService: LearningPathsService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ACADEMIC_MANAGER)
  @Post()
  @ApiOperation({
    summary: 'Create a learning path',
  })
  @ApiResponse({
    status: 201,
    description: 'Learning path created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  async create(
    @Body() createLearningPathDto: CreateLearningPathDto,
    @Req() req: any,
  ) {
    // req.user is attached by JwtAuthGuard
    return this.learningPathsService.create(createLearningPathDto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ACADEMIC_MANAGER)
  @Post(':id/courses')
  @ApiOperation({
    summary: 'Add a course to a learning path',
  })
  @ApiResponse({
    status: 200,
    description: 'Course added to learning path successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Learning path or course not found',
  })
  public async addCourse(
    @Param('id', ParseIntPipe)
    learningPathId: number,

    @Body()
    dto: AddCourseToLearningPathDto,

    @Req()
    req: any

  ) {
    return this.learningPathsService.addCourse(learningPathId, dto, req.user)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ACADEMIC_MANAGER)
  @Delete(':id/courses/:courseId')
  @ApiOperation({
    summary: 'Remove a course from a learning path',
  })
  @ApiResponse({
    status: 200,
    description: 'Course removed from learning path successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Learning path or course not found',
  })
  public async removeCourse(
    @Param('id', ParseIntPipe) learningPathId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.learningPathsService.removeCourse(learningPathId, courseId);
  }

  @Public()
  @Get(':id/courses')
  @ApiOperation({
    summary: 'Get courses in a learning path',
  })
  @ApiResponse({
    status: 200,
    description: 'List of courses in the learning path',
  })
  @ApiResponse({
    status: 404,
    description: 'Learning path not found',
  })
  public async getCourses(
    @Param('id', ParseIntPipe) learningPathId: number,
  ) {
    return this.learningPathsService.getCoursesInLearningPath(learningPathId);
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Get all learning paths',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all learning paths',
  })
  public async findAll() {
    return this.learningPathsService.findAll();
  }
}
