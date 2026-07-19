import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Assessment } from '../entities/assessment.entity';
@Injectable()
export class AssessmentRepository extends Repository<Assessment> {
  constructor(private dataSource: DataSource) {
    super(Assessment, dataSource.createEntityManager());
  }

  // Find an assessment by ID with relations (course, lesson, and questions)
  async findById(assessmentId: number): Promise<Assessment | null> {
    return this.findOne({
      where: {
        assessmentId,
      },
      relations: ['course', 'lesson', 'questions', 'questions.options'],
    });
  }

  async findAssessmentWithRelation(assessmentId: number, lessonId: number, courseId: number): Promise<Assessment | null> {
    return this.findOne({
      where: {
        assessmentId,
        lesson: {
          lessonId,
        },
        course: {
          courseId,
        }
      },
      relations: ['course', 'lesson', 'questions', 'questions.options'],
    });
  }

  // Find assessments by course ID
  async findByCourseId(courseId: number): Promise<Assessment[]> {
    return this.find({
      where: { courseId },
      relations: ['lesson'],
    });
  }

  // Find assessments by lesson ID
  async findByLessonId(lessonId: number): Promise<Assessment[]> {
    return this.find({
      where: { lessonId },
      relations: ['course'],
    });
  }
}
