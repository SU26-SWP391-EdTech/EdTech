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
import { QuestionType } from 'src/common/enums/question-type.enum';

@Injectable()
export class AssessmentService {
  constructor(
    private readonly assessmentRepository: AssessmentRepository,
    private readonly courseService: CoursesService,
    private readonly lessonService: LessonsService
  ) { }

  // Create a new assessment
  async createService(userId: number, createAssessmentDto: CreateAssessmentDto): Promise<Assessment> {
    const { courseId, lessonId, title, type } = createAssessmentDto;

    // 1. Verify course exists
    const course = await this.courseService.validateCourseOwner(userId, courseId);

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
      const questionRepo = this.assessmentRepository.manager.getRepository(Question);
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

  async findAssessment(assessmentId: number, lessonId: number, courseId: number) {
    const assessment = await this.assessmentRepository.findAssessmentWithRelation(assessmentId, lessonId, courseId);
    if (!assessment) {
      throw new NotFoundException(
        `Assessment ${assessmentId} not found`,
      );
    }
    return assessment;
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

  async getPvpQuestion(courseId: number){
    return await this.assessmentRepository.getPvpQuestion(courseId);
  }

  async findAssessmentsByLessonId(lessonId: number): Promise<Assessment[]> {
    return await this.assessmentRepository.findByLessonId(lessonId);
  }
}
