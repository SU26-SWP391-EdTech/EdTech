import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionService } from './question.service';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionResponseDto } from './dto/question-response.dto';
import { RoleEnum } from 'src/common/enums/role.enum';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
@ApiTags('Question')
@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Roles(RoleEnum.COURSE_PROVIDER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('courses/:courseId/lesson/:lessonId/assessment/:assessmentId')
  @ApiOperation({ summary: 'Create a question for an assessment' })
  @ApiResponse({ status: 201, description: 'Question created successfully', type: QuestionResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createQuestion(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('assessmentId', ParseIntPipe) assessmentId: number,
    @Req() req,
    @Body() createQuestionDto: CreateQuestionDto,
  ) {
    return await this.questionService.createQuestion(
      lessonId,
      courseId,
      assessmentId,
      req.user.userId,
      createQuestionDto,
    );
  }

  @Roles(RoleEnum.COURSE_PROVIDER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(
    'courses/:courseId/lesson/:lessonId/assessment/:assessmentId/question/:questionId',
  )
  @ApiOperation({ summary: 'Update a question' })
  @ApiResponse({ status: 200, description: 'Question updated successfully', type: QuestionResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async updateQuestion(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Param('assessmentId', ParseIntPipe) assessmentId: number,
    @Param('questionId', ParseIntPipe) questionId: number,
    @Req() req,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return await this.questionService.updateQuestion(
      questionId,
      assessmentId,
      lessonId,
      courseId,
      req.user.userId,
      updateQuestionDto,
    );
  }

  @Roles(RoleEnum.COURSE_PROVIDER, RoleEnum.ACADEMIC_MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(
    'courses/:courseId/lesson/:lessonId/assessment/:assessmentId/question/:questionId',
  )
  @ApiOperation({ summary: 'Delete a question' })
  @ApiResponse({ status: 200, description: 'Question deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async deleteQuestion(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Param('assessmentId', ParseIntPipe) assessmentId: number,
    @Param('questionId', ParseIntPipe) questionId: number,
    @Req() req,
  ) {
    return await this.questionService.deleteQuestion(
      questionId,
      assessmentId,
      lessonId,
      courseId,
      req.user.userId,
    );
  }

  @Roles(RoleEnum.LEARNER,RoleEnum.COURSE_PROVIDER, RoleEnum.ACADEMIC_MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get question by ID' })
  @ApiResponse({ status: 200, description: 'Question details', type: QuestionResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async getQuestionById(@Param('id', ParseIntPipe) id: number, @Req() req){
    return await this.questionService.getQuestionById(id, req.user.userId);
  }

  @Roles(RoleEnum.COURSE_PROVIDER, RoleEnum.ACADEMIC_MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(
    'courses/:courseId/lesson/:lessonId/questions',
  )
  @ApiOperation({ summary: 'Get all questions for a lesson' })
  @ApiResponse({ status: 200, description: 'Question list', type: QuestionResponseDto, isArray: true })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async getAllQuestions(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Param('assessmentId', ParseIntPipe) assessmentId: number,
    @Req() req,
  ) {
    return await this.questionService.getAllQuestionsOfLesson(
      lessonId,
      courseId,
      req.user.userId,
    );
  }
}
