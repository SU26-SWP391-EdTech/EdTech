import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Assessment } from '../entities/assessment.entity';
import { AssessmentType } from 'src/common/enums/assessment-type.enum';
@Injectable()
export class AssessmentRepository extends Repository<Assessment> {
  constructor(private dataSource: DataSource) {
    super(Assessment, dataSource.createEntityManager());
  }

  // Find an assessment by ID with relations (course, lesson, and questions)
  async findById(assessmentId: number): Promise<Assessment | null> {
    return this.findOne({
      where: { assessmentId,
       },
      relations: ['course', 'lesson', 'questions'],
    });
  }

  async findAssessmentWithRelation(assessmentId: number, lessonId: number, courseId:number): Promise<Assessment | null> {
    return this.findOne({
      where: { assessmentId,
        lesson: {
          lessonId,
        },
        course: {
          courseId,
        }
       },
      relations: ['course', 'lesson', 'questions'],
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

  async getPvpQuestion(courseId: number) {
    return this.createQueryBuilder('assessment')
      .leftJoin('assessment.questions', 'question')
      .addSelect([
        'question.questionId',
        'question.content',
        'question.point',
        'question.position',
      ])
      .leftJoin('question.options', 'option')
      .addSelect([
        'option.optionId',
        'option.content',
        'option.isCorrect',
        'option.position',
      ])
      .where('assessment.type = :type', {
        type: AssessmentType.PVP,
      })
      .andWhere('assessment.courseId = :courseId', {
        courseId,
      })
      .orderBy('question.position', 'ASC')
      .addOrderBy('option.position', 'ASC')
      .getMany();
  }
}
