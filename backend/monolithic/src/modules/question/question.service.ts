import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Question } from './entities/question.entity';
import { LessonsService } from '../lessons/service/lessons.service';
import { AssessmentService } from '../assessment/service/assessment.service';
import { QuestionRepository } from './question.repository';
import { QuestionResponseDto } from './dto/question-response.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { RoleEnum } from 'src/common/enums/role.enum';
import { EnrollmentStatus } from 'src/common/enums/enrollment.enum';
import { Repository } from 'typeorm';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateQuestionOptionDto } from './dto/create-question-option.dto';
import { QuestionOptionResponseDto } from './dto/question-option-response.dto';
import { QuestionOptionRepository } from './question-option.repository';
import { ReorderQuestionOptionsDto } from './dto/reorder-question-option.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UpdateQuestionOptionDto } from './dto/update-question-option.dto';
import { QuestionOption } from './entities/question-option.entity';

@Injectable()
export class QuestionService {
  constructor(
    private readonly lessonsService: LessonsService,
    private assessmentService: AssessmentService,
    private questionRepo: QuestionRepository,
    private questionOptionRepo: QuestionOptionRepository,
    @InjectRepository(Enrollment)
    private enrollmentsRepo: Repository<Enrollment>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
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

    return new QuestionResponseDto(question);
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

    return new QuestionResponseDto(updatedQuestion);
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

  async getQuestionById(
    id: number,
    userId: number,
  ): Promise<QuestionResponseDto> {
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

  async getQuestionEntity(
    id: number,
    userId: number,
  ): Promise<Question> {
    const question = await this.questionRepo.findById(id);
  
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
  
    // Course Provider sở hữu course
    if (
      question?.assessment?.lesson?.course.user.userId === userId &&
      question?.assessment?.lesson?.course.user.role.roleName ===
        RoleEnum.COURSE_PROVIDER
    ) {
      return question;
    }
  
    // Student đã enroll
    const enrollment = await this.enrollmentsRepo.findOne({
      where: {
        user: {
          userId,
        },
        course: {
          courseId: question?.assessment?.lesson?.course.courseId,
        },
        status: EnrollmentStatus.ACTIVE,
      },
    });
  
    if (!enrollment) {
      throw new ForbiddenException(
        'You must enroll in this course before accessing questions',
      );
    }
  
    return question;
  }

  async getAllQuestionsOfLesson(
    lessonId: number,
    courseId: number,
    userId: number,
  ): Promise<QuestionResponseDto[]> {
    await this.lessonsService.findLesson(lessonId, userId);

    const questions = await this.questionRepo.findAllByLessonId(lessonId);

    return questions.map((question) => new QuestionResponseDto(question));
  }

  async createQuestionOptionService(
    userId: number,
    createQuestionOptionDto: CreateQuestionOptionDto,
    questionId: number,
  ): Promise<QuestionOptionResponseDto> {
  
    const question = await this.getQuestionEntity(
      questionId,
      userId,
    );
  
    const questionOption = await this.questionOptionRepo.createQuestionOption(
        question,
        createQuestionOptionDto,
      );
  
    return new QuestionOptionResponseDto(questionOption);
  }

  async reorderQuestionOptions(
    questionId: number,
    userId: number,
    dto: ReorderQuestionOptionsDto,
  ): Promise<void> {
  
    const question = await this.getQuestionEntity(
      questionId,
      userId,
    );
  
    const options = await this.questionOptionRepo.findByQuestionId(
      question.questionId,
    );
  
    if (options.length !== dto.optionIds.length) {
      throw new BadRequestException('Invalid option list');
    }
  
    const idsInDb = new Set(
      options.map((o) => o.optionId),
    );
  
    const valid = dto.optionIds.every((id) =>
      idsInDb.has(id),
    );
  
    if (!valid) {
      throw new BadRequestException(
        'Some options do not belong to this question',
      );
    }
  
    await this.dataSource.transaction(async (manager) => {
      await this.questionOptionRepo.reorder(
        dto.optionIds,
        manager,
      );
    });
  }

  async getQuestionOptionEntity(
    optionId: number,
    userId: number,
  ): Promise<QuestionOption> {
    const option = await this.questionOptionRepo.findById(optionId);
  
    if (!option) {
      throw new NotFoundException(
        `Question option with ID ${optionId} not found`,
      );
    }
  
    // Course Provider sở hữu course
    if (
      option?.question?.assessment?.lesson?.course.user.userId === userId &&
      option?.question?.assessment?.lesson?.course.user.role.roleName ===
        RoleEnum.COURSE_PROVIDER
    ) {
      return option;
    }
  
    // Student đã enroll
    const enrollment = await this.enrollmentsRepo.findOne({
      where: {
        user: {
          userId,
        },
        course: {
          courseId:
            option?.question?.assessment?.lesson?.course.courseId,
        },
        status: EnrollmentStatus.ACTIVE,
      },
    });
  
    if (!enrollment) {
      throw new ForbiddenException(
        'You must enroll in this course before accessing question options',
      );
    }
  
    return option;
  }

  async getQuestionOptionById(
    optionId: number,
    userId: number,
  ): Promise<QuestionOptionResponseDto> {
    const option = await this.getQuestionOptionEntity(
      optionId,
      userId,
    );
  
    return new QuestionOptionResponseDto(option);
  }

  async updateQuestionOptionService(
    userId: number, 
    updateQuestionOptionDto: UpdateQuestionOptionDto, 
    optionId: number) : Promise<QuestionOptionResponseDto>{
      const option = await this.getQuestionOptionEntity(
        optionId,
        userId,
      );

      Object.assign(option, updateQuestionOptionDto);

      const updated = await this.questionOptionRepo.updateQuestionOption(option);

      return new QuestionOptionResponseDto(updated);
      
  }

  async deleteQuestionOptionService(
    optionId: number,
    userId: number,
  ): Promise<void> {
  
    const option = await this.getQuestionOptionEntity(
      optionId,
      userId,
    );
  
    await this.questionOptionRepo.deleteQuestionOption(
      option.optionId,
    );
  
    const remainingOptions =
      await this.questionOptionRepo.findByQuestionId(
        option.question.questionId,
      );
  
    await this.questionOptionRepo.reorder(
      remainingOptions.map((o) => o.optionId),
    );
  }
}
