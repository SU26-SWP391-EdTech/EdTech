import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Patch,
  Delete,
} from '@nestjs/common';
import { AssessmentService } from '../service/assessment.service';
import { CreateAssessmentDto } from '../dto/create-assessment.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { RoleEnum } from 'src/common/enums/role.enum';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayloadUser } from 'src/common/decorators/current-user.decorator';
import { AssessmentSessionService } from '../service/assessment-session.service';
import { SubmitAssessmentDto } from '../dto/submit-answer.dto';

@ApiTags('Assessments')
@Controller('assessment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssessmentController {
  constructor(
    private readonly assessmentService: AssessmentService,
    private readonly assessmentSessionService: AssessmentSessionService,
  ) {}

  @Post()
  @Roles(RoleEnum.COURSE_PROVIDER)
  @ApiOperation({ summary: 'Create a new assessment' })
  @ApiBody({ type: CreateAssessmentDto })
  @ApiResponse({ status: 201, description: 'Assessment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Course or Lesson not found' })
  async create(
    @Body()
    createAssessmentDto: CreateAssessmentDto,

    @CurrentUser()
    user: JwtPayloadUser,
  ) {
    return await this.assessmentService.createService(
      user.userId,
      createAssessmentDto,
    );
  }

  @Get('courses/:courseId/pvp')
  @Roles(RoleEnum.LEARNER)
  @ApiOperation({ summary: 'Get or create PvP assessment for a course' })
  @ApiResponse({
    status: 200,
    description: 'PvP assessment retrieved successfully',
  })
  async getOrCreatePvp(@Param('courseId', ParseIntPipe) courseId: number) {
    return await this.assessmentService.getOrCreatePvpAssessment(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assessment detail by ID' })
  @ApiResponse({
    status: 200,
    description: 'Assessment details retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Assessment not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.assessmentService.findOneService(id);
  }

  @Get('courses/:courseId/lesson/:lessonId/assessment/:assessmentId')
  async findAssessment(
    @Param('assessmentId', ParseIntPipe) assessmentId: number,
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return await this.assessmentService.findAssessment(
      assessmentId,
      lessonId,
      courseId,
    );
  }

  @Delete(':id')
  @Roles(RoleEnum.COURSE_PROVIDER)
  async remove(
    @Param('id', ParseIntPipe) assessmentId: number,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    await this.assessmentService.removeService(user.userId, assessmentId);
    return { success: true };
  }

  // learner start quiz will craete assessment_sessions
  @Post(':id/session')
  @Roles(RoleEnum.LEARNER)
  @ApiOperation({ summary: 'Start quiz will craete assessment_sessions' })
  async createAssesmentSession(
    @Param('id', ParseIntPipe)
    assessmentId: number,

    @CurrentUser()
    user: JwtPayloadUser,
  ) {
    return await this.assessmentSessionService.startAssessmentSessionService(
      user.userId,
      assessmentId,
    );
  }

  @Get('course/:courseId/pvp')
  async getPvpQuestion(@Param('courseId', ParseIntPipe) courseId: number) {
    return await this.assessmentService.getPvpQuestion(courseId);
  }

  @Patch(':id/session/submit')
  @Roles(RoleEnum.LEARNER)
  @ApiOperation({ summary: 'Submit the test and get it graded' })
  @ApiBody({
    type: SubmitAssessmentDto,
  })
  async submitAssessment(
    @Param('id', ParseIntPipe)
    assessmentId: number,

    @Body()
    submitAnswerDto: SubmitAssessmentDto,

    @CurrentUser()
    user: JwtPayloadUser,
  ) {
    return await this.assessmentSessionService.submitAssessmentSessionService(
      user.userId,
      assessmentId,
      submitAnswerDto,
    );
  }

  @Get('lesson/:lessonId/result')
  @Roles(RoleEnum.LEARNER)
  @ApiOperation({ summary: 'Get last assessment result for a lesson' })
  async getAssessmentResult(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return await this.assessmentSessionService.getAssessmentResultByLessonService(
      user.userId,
      lessonId,
    );
  }
}

// Submit the test and get it graded and will complete assessment_sessions
