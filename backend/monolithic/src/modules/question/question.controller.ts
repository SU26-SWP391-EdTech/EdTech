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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionService } from './question.service';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionResponseDto } from './dto/question-response.dto';
import { RoleEnum } from 'src/common/enums/role.enum';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { CreateQuestionOptionDto } from './dto/create-question-option.dto';
import { ReorderQuestionOptionsDto } from './dto/reorder-question-option.dto';
import { UpdateQuestionOptionDto } from './dto/update-question-option.dto';
import { QuestionOptionResponseDto } from './dto/question-option-response.dto';

@ApiTags('Question')
@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Roles(RoleEnum.COURSE_PROVIDER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('courses/:courseId/lesson/:lessonId/assessment/:assessmentId')
  @ApiOperation({ summary: 'Create a question for an assessment' })
  @ApiBody({ type: CreateQuestionDto })
  @ApiResponse({ status: 201, description: 'Question created successfully', type: QuestionResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Lesson, course or assessment not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiBody({ type: UpdateQuestionDto })
  @ApiResponse({ status: 200, description: 'Question updated successfully', type: QuestionResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiResponse({ status: 500, description: 'Internal server error' })
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

  @Roles(RoleEnum.LEARNER, RoleEnum.COURSE_PROVIDER, RoleEnum.ACADEMIC_MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get question by ID' })
  @ApiResponse({ status: 200, description: 'Question details', type: QuestionResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getQuestionById(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return await this.questionService.getQuestionById(id, req.user.userId);
  }

  @Roles(RoleEnum.COURSE_PROVIDER, RoleEnum.ACADEMIC_MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('courses/:courseId/lesson/:lessonId/questions')
  @ApiOperation({ summary: 'Get all questions for a lesson' })
  @ApiResponse({ status: 200, description: 'Question list', type: QuestionResponseDto, isArray: true })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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

  @Roles(RoleEnum.COURSE_PROVIDER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @Post(':questionId/option')
  @ApiOperation({ summary: 'Create an option for a question' })
  @ApiBody({ type: CreateQuestionOptionDto })
  @ApiResponse({ status: 201, description: 'Question option created successfully', type: QuestionOptionResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createQuestionOption(
    @Req() req,
    @Body() dto: CreateQuestionOptionDto,
    @Param('questionId', ParseIntPipe) questionId: number,
  ) {
    return await this.questionService.createQuestionOptionService(req.user.userId, dto, questionId);
  }

  @Roles(RoleEnum.COURSE_PROVIDER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':questionId/options/reorder')
  @ApiOperation({ summary: 'Reorder options for a question' })
  @ApiBody({ type: ReorderQuestionOptionsDto })
  @ApiResponse({ status: 200, description: 'Question options reordered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async reorderQuestionOptions(
    @Param('questionId', ParseIntPipe) questionId: number,
    @Body() dto: ReorderQuestionOptionsDto,
    @Req() req,
  ) {
    return await this.questionService.reorderQuestionOptions(questionId, req.user.userId, dto);
  }

  @Roles(RoleEnum.COURSE_PROVIDER, RoleEnum.ACADEMIC_MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('option/:optionId')
  @ApiOperation({ summary: 'Update a question option' })
  @ApiBody({ type: UpdateQuestionOptionDto })
  @ApiResponse({ status: 200, description: 'Question option updated successfully', type: QuestionOptionResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Question option not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateQuestionOption(
    @Req() req,
    @Body() dto: UpdateQuestionOptionDto,
    @Param('optionId', ParseIntPipe) optionId: number,
  ) {
    return await this.questionService.updateQuestionOptionService(req.user.userId, dto, optionId);
  }

  @Roles(RoleEnum.COURSE_PROVIDER, RoleEnum.ACADEMIC_MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('option/:optionId')
  @ApiOperation({ summary: 'Delete a question option' })
  @ApiResponse({ status: 200, description: 'Question option deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Question option not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteQuestionOption(
    @Param('optionId', ParseIntPipe) optionId: number,
    @Req() req,
  ): Promise<void> {
    await this.questionService.deleteQuestionOptionService(optionId, req.user.userId);
  }

  @Roles(RoleEnum.LEARNER, RoleEnum.COURSE_PROVIDER, RoleEnum.ACADEMIC_MANAGER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('option/:optionId')
  @ApiOperation({ summary: 'Get question option by ID' })
  @ApiResponse({ status: 200, description: 'Question option details', type: QuestionOptionResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Question option not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getQuestionOptionById(
    @Param('optionId', ParseIntPipe) optionId: number,
    @Req() req,
  ): Promise<QuestionOptionResponseDto> {
    return await this.questionService.getQuestionOptionById(optionId, req.user.userId);
  }
}
