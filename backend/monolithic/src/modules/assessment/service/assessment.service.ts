import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssessmentRepository } from '../repository/assessment.repository';
import { Assessment } from '../entities/assessment.entity';
import { CreateAssessmentDto } from '../dto/create-assessment.dto';
import { CoursesService } from 'src/modules/courses/services/courses.service';
import { LessonsService } from 'src/modules/lessons/service/lessons.service';
import { Lesson } from 'src/modules/lessons/entities/lesson.entity';
import { AssessmentType } from 'src/common/enums/assessment-type.enum';
import { Not, In } from 'typeorm';
import { Question } from 'src/modules/question/entities/question.entity';
import { QuestionOption } from 'src/modules/question/entities/question-option.entity';
import { QuestionType } from 'src/common/enums/question-type.enum';
import { SyncAssessmentTreeDto } from '../dto/sync-assessment-tree.dto';

@Injectable()
export class AssessmentService {
  constructor(
    private readonly assessmentRepository: AssessmentRepository,
    private readonly courseService: CoursesService,
    private readonly lessonService: LessonsService,
  ) {}

  // Create a new assessment
  async createService(
    userId: number,
    createAssessmentDto: CreateAssessmentDto,
  ): Promise<Assessment> {
    const { courseId, lessonId, title, type } = createAssessmentDto;

    // 1. Verify course exists
    await this.courseService.validateCourseOwner(userId, courseId);

    let lesson: Lesson | null = null;
    // 2. Verify lesson exists and belongs to the course if provided
    if (lessonId) {
      lesson = await this.lessonService.findLessonByIdService(lessonId);
      // Check if lesson belongs to the course

      // In LessonsRepository, lesson.course is joined
      const lessonCourseId = lesson.course?.courseId;
      if (lessonCourseId !== courseId) {
        throw new BadRequestException(
          `Lesson with ID ${lessonId} does not belong to Course with ID ${courseId}`,
        );
      }
    }

    const assessment = this.assessmentRepository.create({
      courseId,
      lessonId: lessonId || undefined,
      title,
      type,
      questions: createAssessmentDto.questions,
    });

    return await this.assessmentRepository.save(assessment);
  }

  // Get assessment detail by ID
  async findOneService(id: number): Promise<Assessment> {
    const assessment = await this.assessmentRepository.findById(id);
    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${id} not found`);
    }

    if (assessment.type === AssessmentType.PVP) {
      const questionRepo =
        this.assessmentRepository.manager.getRepository(Question);
      const assessments = await this.assessmentRepository.find({
        where: {
          courseId: assessment.courseId,
          type: Not(AssessmentType.PVP),
        },
      });

      if (assessments.length > 0) {
        const assessmentIds = assessments.map((a) => a.assessmentId);
        assessment.questions = await questionRepo.find({
          where: {
            assessmentId: In(assessmentIds),
          },
          relations: {
            options: true,
          },
          order: {
            position: 'ASC',
            options: {
              position: 'ASC',
            },
          },
        });
      }

      // Fallback if course has no questions
      if (!assessment.questions || assessment.questions.length === 0) {
        assessment.questions = await questionRepo.find({
          where: {
            assessmentId: 1, // Fallback to Spring Boot quiz
          },
          relations: {
            options: true,
          },
          order: {
            position: 'ASC',
            options: {
              position: 'ASC',
            },
          },
        });
      }
    }

    return assessment;
  }

  async findAssessment(
    assessmentId: number,
    lessonId: number,
    courseId: number,
  ) {
    const assessment =
      await this.assessmentRepository.findAssessmentWithRelation(
        assessmentId,
        lessonId,
        courseId,
      );
    if (!assessment) {
      throw new NotFoundException(`Assessment ${assessmentId} not found`);
    }
    return assessment;
  }

  async removeService(userId: number, assessmentId: number): Promise<void> {
    const assessment = await this.findOneService(assessmentId);
    await this.courseService.validateCourseOwner(userId, assessment.courseId);

    if (assessment.sessions?.length > 0) {
      throw new BadRequestException(
        'Assessment with learner sessions cannot be deleted',
      );
    }

    const questionIds = (assessment.questions || []).map(
      (question) => question.questionId,
    );

    await this.assessmentRepository.manager.transaction(async (manager) => {
      if (questionIds.length > 0) {
        await manager.delete(QuestionOption, {
          questionId: In(questionIds),
        });
        await manager.delete(Question, {
          assessmentId,
        });
      }
      await manager.delete(Assessment, { assessmentId });
    });
  }

  async syncLessonAssessmentTree(
    userId: number,
    courseId: number,
    lessonId: number,
    dto: SyncAssessmentTreeDto,
  ): Promise<Assessment[]> {
    await this.courseService.validateCourseOwner(userId, courseId);
    const lesson = await this.lessonService.findLessonByIdService(lessonId);
    if (lesson.course?.courseId !== courseId) {
      throw new BadRequestException(
        `Lesson with ID ${lessonId} does not belong to Course with ID ${courseId}`,
      );
    }

    for (const assessment of dto.assessments) {
      if (
        assessment.type === AssessmentType.PVP &&
        assessment.questions.length < 5
      ) {
        throw new BadRequestException(
          'PvP assessments require at least 5 questions',
        );
      }
      for (const question of assessment.questions) {
        if (question.options.length < 2) {
          throw new BadRequestException(
            'Each question requires at least 2 answer options',
          );
        }
        const correctCount = question.options.filter(
          (option) => option.isCorrect,
        ).length;
        if (
          (question.type === QuestionType.MULTIPLE_CHOICE_SINGLE ||
            question.type === QuestionType.TRUE_FALSE) &&
          correctCount !== 1
        ) {
          throw new BadRequestException(
            'Single choice and true/false questions require exactly one correct option',
          );
        }
        if (
          question.type === QuestionType.MULTIPLE_CHOICE_MULTI &&
          correctCount < 1
        ) {
          throw new BadRequestException(
            'Multiple choice questions require at least one correct option',
          );
        }
        if (
          question.type === QuestionType.TRUE_FALSE &&
          question.options.length !== 2
        ) {
          throw new BadRequestException(
            'True/false questions require exactly 2 options',
          );
        }
      }
    }

    await this.assessmentRepository.manager.transaction(async (manager) => {
      const assessmentRepo = manager.getRepository(Assessment);
      const questionRepo = manager.getRepository(Question);
      const optionRepo = manager.getRepository(QuestionOption);
      const existing = await assessmentRepo.find({
        where: { courseId, lessonId },
        relations: ['questions', 'questions.options', 'sessions'],
      });
      const existingById = new Map(
        existing.map((item) => [item.assessmentId, item]),
      );
      const submittedAssessmentIds = new Set(
        dto.assessments.flatMap((item) =>
          item.assessmentId ? [item.assessmentId] : [],
        ),
      );

      for (const assessmentDto of dto.assessments) {
        let assessment: Assessment;
        if (assessmentDto.assessmentId) {
          const current = existingById.get(assessmentDto.assessmentId);
          if (!current) {
            throw new BadRequestException(
              'Assessment does not belong to this lesson',
            );
          }
          assessment = current;
          assessment.title = assessmentDto.title;
          assessment.type = assessmentDto.type;
        } else {
          assessment = assessmentRepo.create({
            courseId,
            lessonId,
            title: assessmentDto.title,
            type: assessmentDto.type,
          });
        }
        assessment = await assessmentRepo.save(assessment);

        const currentQuestions =
          existingById.get(assessment.assessmentId)?.questions || [];
        const currentQuestionById = new Map(
          currentQuestions.map((item) => [item.questionId, item]),
        );
        const submittedQuestionIds = new Set(
          assessmentDto.questions.flatMap((item) =>
            item.questionId ? [item.questionId] : [],
          ),
        );

        for (const questionDto of assessmentDto.questions) {
          let question: Question;
          if (questionDto.questionId) {
            const current = currentQuestionById.get(questionDto.questionId);
            if (!current) {
              throw new BadRequestException(
                'Question does not belong to this assessment',
              );
            }
            question = current;
            Object.assign(question, {
              content: questionDto.content,
              type: questionDto.type,
              points: questionDto.points,
              position: questionDto.position,
            });
          } else {
            question = questionRepo.create({
              assessmentId: assessment.assessmentId,
              content: questionDto.content,
              type: questionDto.type,
              points: questionDto.points,
              position: questionDto.position,
            });
          }
          question = await questionRepo.save(question);

          const currentOptions =
            currentQuestionById.get(question.questionId)?.options || [];
          const currentOptionById = new Map(
            currentOptions.map((item) => [item.optionId, item]),
          );
          const submittedOptionIds = new Set(
            questionDto.options.flatMap((item) =>
              item.optionId ? [item.optionId] : [],
            ),
          );

          for (const optionDto of questionDto.options) {
            let option: QuestionOption;
            if (optionDto.optionId) {
              const current = currentOptionById.get(optionDto.optionId);
              if (!current) {
                throw new BadRequestException(
                  'Option does not belong to this question',
                );
              }
              option = current;
              Object.assign(option, {
                content: optionDto.content,
                isCorrect: optionDto.isCorrect,
                position: optionDto.position,
              });
            } else {
              option = optionRepo.create({
                questionId: question.questionId,
                content: optionDto.content,
                isCorrect: optionDto.isCorrect,
                position: optionDto.position,
              });
            }
            await optionRepo.save(option);
          }

          const removedOptionIds = currentOptions
            .map((item) => item.optionId)
            .filter((id) => !submittedOptionIds.has(id));
          if (removedOptionIds.length > 0) {
            await optionRepo.delete({ optionId: In(removedOptionIds) });
          }
        }

        const removedQuestions = currentQuestions.filter(
          (item) => !submittedQuestionIds.has(item.questionId),
        );
        const removedQuestionIds = removedQuestions.map(
          (item) => item.questionId,
        );
        if (removedQuestionIds.length > 0) {
          await optionRepo.delete({ questionId: In(removedQuestionIds) });
          await questionRepo.delete({ questionId: In(removedQuestionIds) });
        }
      }

      for (const removedAssessment of existing.filter(
        (item) => !submittedAssessmentIds.has(item.assessmentId),
      )) {
        if (removedAssessment.sessions?.length > 0) {
          throw new BadRequestException(
            'Assessment with learner sessions cannot be deleted',
          );
        }
        const questionIds = (removedAssessment.questions || []).map(
          (item) => item.questionId,
        );
        if (questionIds.length > 0) {
          await optionRepo.delete({ questionId: In(questionIds) });
          await questionRepo.delete({
            assessmentId: removedAssessment.assessmentId,
          });
        }
        await assessmentRepo.delete({
          assessmentId: removedAssessment.assessmentId,
        });
      }
    });

    return this.assessmentRepository.find({
      where: { courseId, lessonId },
      relations: ['questions', 'questions.options'],
      order: {
        assessmentId: 'ASC',
        questions: { position: 'ASC', options: { position: 'ASC' } },
      },
    });
  }

  async getOrCreatePvpAssessment(courseId: number): Promise<Assessment> {
    const course = await this.courseService.findOne(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    let pvpAssessment = await this.assessmentRepository.findOne({
      where: {
        courseId,
        type: AssessmentType.PVP,
      },
    });

    if (!pvpAssessment) {
      pvpAssessment = this.assessmentRepository.create({
        courseId,
        title: `${course.title} PvP Challenge`,
        type: AssessmentType.PVP,
      });
      pvpAssessment = await this.assessmentRepository.save(pvpAssessment);
    }

    return pvpAssessment;
  }

  async getPvpQuestion(courseId: number) {
    return await this.assessmentRepository.getPvpQuestion(courseId);
  }

  async findAssessmentsByLessonId(lessonId: number): Promise<Assessment[]> {
    return await this.assessmentRepository.findByLessonId(lessonId);
  }
}
