import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Question } from './entities/question.entity';
import { LessonsService } from '../lessons/lessons.service';
import { AssessmentService } from '../assessment/assessment.service';
import { QuestionRepository } from './question.repository';
import { QuestionResponseDto } from './dto/question-response.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { RoleEnum } from 'src/common/enums/role.enum';
import { EnrollmentStatus } from 'src/common/enums/enrollment.enum';
import { EnrollmentsRepository } from '../enrollments/enrollments.repository';
import { Repository } from 'typeorm';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class QuestionService {
  constructor(
    private readonly lessonsService: LessonsService,
    private assessmentService: AssessmentService,
    private questionRepo: QuestionRepository,
    @InjectRepository(Question)
    private enrollmentsRepo: Repository<Enrollment>,
  ) {}

  async createQuestion(
    lessonId: number,
    courseId: number,
    assessmentId: number,
    userId: number,
    createQuestionDto: CreateQuestionDto,
  ): Promise<QuestionResponseDto> {
    const { ...questionData } = createQuestionDto;

    const lessonAssessment = await this.assessmentService.findAssessment(
      assessmentId,
      lessonId,
      courseId,
    );
    await this.lessonsService.findLesson(lessonId, userId);

    const question = await this.questionRepo.createQuestion({
      ...questionData,
      assessment: lessonAssessment,
    });

    return {
      questionId: question.questionId,
      assessmentId: question.assessmentId,
      content: question.content,
      type: question.type,
      points: question.points,
      position: question.position,
    };
  }

  async updateQuestion(
    questionId: number,
    assessmentId: number,
    lessonId: number,
    courseId: number,
    userId: number,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<QuestionResponseDto> {
    const assessment = await this.assessmentService.findAssessment(
      assessmentId,
      lessonId,
      courseId,
    );

    await this.lessonsService.findLesson(lessonId, userId);

    const question = await this.questionRepo.findQuestion(
      questionId,
      assessmentId,
    );

    const updatedQuestion = await this.questionRepo.updateQuestion(
      question,
      updateQuestionDto,
    );

    return {
      questionId: updatedQuestion.questionId,
      assessmentId: updatedQuestion.assessmentId,
      content: updatedQuestion.content,
      type: updatedQuestion.type,
      points: updatedQuestion.points,
      position: updatedQuestion.position,
    };
  }

  async deleteQuestion(
    questionId: number,
    assessmentId: number,
    lessonId: number,
    courseId: number,
    userId: number,
  ): Promise<void> {
    await this.assessmentService.findAssessment(
      assessmentId,
      lessonId,
      courseId,
    );

    await this.lessonsService.findLesson(lessonId, userId);

    const question = await this.questionRepo.findQuestion(
      questionId,
      assessmentId,
    );

    await this.questionRepo.deleteQuestion(question.questionId);
  }

  async getQuestionById(id: number, userId: number): Promise<QuestionResponseDto> {
    const question = await this.questionRepo.findById(id);

    if (!question) {
      throw new NotFoundException(`Question with ${id} not found`);
    }

    if (
      question?.assessment?.lesson?.course?.user?.userId === userId &&
      question?.assessment?.lesson?.course?.user?.role?.roleName ===
        RoleEnum.COURSE_PROVIDER
    ) {
        return new QuestionResponseDto(question);
    }

    const enrollment = await this.enrollmentsRepo.findOne({
      where: {
        user: {
          userId,
        },
        course: {
          courseId: question?.assessment?.lesson?.course?.courseId,
        },
        status: EnrollmentStatus.ACTIVE,
      },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        'You must enroll in this course before accessing questions',
      );
    }

    return new QuestionResponseDto(question);
  }

  async getAllQuestionsOfLesson(
    lessonId: number,
    courseId: number,
    userId: number,
  ): Promise<QuestionResponseDto[]> {


    await this.lessonsService.findLesson(lessonId, userId);

    const questions = await this.questionRepo.findAllByLessonId(lessonId);

    return questions.map((question) => ({
      questionId: question.questionId,
      assessmentId: question.assessmentId,
      content: question.content,
      type: question.type,
      points: question.points,
      position: question.position,
    }));
  }
}
