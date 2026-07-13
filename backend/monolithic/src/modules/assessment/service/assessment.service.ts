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
}
