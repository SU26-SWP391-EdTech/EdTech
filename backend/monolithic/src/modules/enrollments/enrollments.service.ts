import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EnrollmentsRepository } from './enrollments.repository';
import { Course } from '../courses/entities/course.entity';
import { EnrollCourseDto } from './dto/enroll-course.dto';
import { EnrollmentStatus } from 'src/common/enums/enrollment.enum';
import { Enrollment } from './entities/enrollment.entity';
import { CourseStatus } from 'src/common/enums/course.enum';
import { Lesson } from '../lessons/entities/lesson.entity';
import { LearnerLessonProgress } from '../progress/entities/learner-lesson-progress.entity';
import { LessonProgressStatus } from 'src/common/enums/lesson-progress-status.enum';

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly enrollmentsRepo: EnrollmentsRepository,

    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    private dataSource: DataSource,
  ) { }

  private async calculateAndSyncEnrollmentProgress(userId: number, enrollment: Enrollment): Promise<Enrollment> {
    if (!enrollment || !enrollment.course || !enrollment.course.courseId) {
      return enrollment;
    }
    try {
      const courseId = enrollment.course.courseId;
      const totalLessons = await this.dataSource.getRepository(Lesson).count({
        where: { course: { courseId } },
      });

      if (totalLessons > 0) {
        const completedLessonsCount = await this.dataSource
          .getRepository(LearnerLessonProgress)
          .createQueryBuilder('progress')
          .innerJoin('progress.lesson', 'lesson')
          .where('progress.userId = :userId', { userId })
          .andWhere('lesson.course_id = :courseId', { courseId })
          .andWhere('progress.status = :status', { status: LessonProgressStatus.COMPLETED })
          .getCount();

        const calcProgress = Math.min(100, Math.round((completedLessonsCount / totalLessons) * 100));
        if (enrollment.progress !== calcProgress || (calcProgress >= 100 && enrollment.status !== EnrollmentStatus.COMPLETED)) {
          enrollment.progress = calcProgress;
          if (calcProgress >= 100) {
            enrollment.status = EnrollmentStatus.COMPLETED;
            if (!enrollment.completedAt) {
              enrollment.completedAt = new Date();
            }
          }
          await this.enrollmentsRepo.save(enrollment);
        }
      }
    } catch (error) {
      console.error('Failed to sync enrollment progress:', error);
    }
    return enrollment;
  }

  async enrollCourse(
    userId: number,
    courseId: number,
  ): Promise<Enrollment> {
    const course = await this.courseRepo.findOne({
      where: { courseId },
    });

    if (!course) {
      throw new NotFoundException(
        `Course with ID ${courseId} not found`,
      );
    }

    if (course.status !== CourseStatus.APPROVED) {
      throw new BadRequestException(
        'This course is not available for enrollment',
      );
    }

    const existingEnrollment =
      await this.enrollmentsRepo.findByUserAndCourse(
        userId,
        courseId,
      );

    if (
      existingEnrollment &&
      existingEnrollment.status === EnrollmentStatus.ACTIVE
    ) {
      throw new BadRequestException(
        'You have already enrolled in this course',
      );
    }

    return await this.dataSource.transaction(
      async (manager): Promise<Enrollment> => {
        let enrollment: Enrollment;

        if (existingEnrollment) {
          existingEnrollment.status =
            EnrollmentStatus.ACTIVE;
          existingEnrollment.progress = 0;
          existingEnrollment.enrolledAt = new Date();

          enrollment = await manager.save(
            Enrollment,
            existingEnrollment,
          );
        } else {
          enrollment = manager.create(Enrollment, {
            user: {
              userId,
            },
            course: {
              courseId,
            },
            status: EnrollmentStatus.ACTIVE,
            progress: 0,
            enrolledAt: new Date(),
          });

          enrollment = await manager.save(
            Enrollment,
            enrollment,
          );
        }

        await manager.increment(
          Course,
          {
            courseId,
          },
          'enrollmentCount',
          1,
        );

        return enrollment;
      },
    );
  }

  async getMyEnrollments(userId: number): Promise<Enrollment[]> {
    const enrollments = await this.enrollmentsRepo.findMyEnrollments(userId);
    for (let i = 0; i < enrollments.length; i++) {
      enrollments[i] = await this.calculateAndSyncEnrollmentProgress(userId, enrollments[i]);
    }
    return enrollments;
  }

  async getEnrollmentDetail(userId: number, courseId: number): Promise<Enrollment> {
    const enrollment = await this.enrollmentsRepo.findByUserAndCourse(userId, courseId);

    if (!enrollment) {
      throw new NotFoundException(`You have not enrolled in this course!`);
    }

    return await this.calculateAndSyncEnrollmentProgress(userId, enrollment);
  }

  async checkEnrollment(userId: number, courseId: number) : Promise<Boolean>{
    const enrollment = await this.enrollmentsRepo.findByUserAndCourse(userId, courseId);

    if(!enrollment){
      throw new NotFoundException(`You have not enrolled in this course!`);
      return false;
    }

    return true;
  }

  async findEnrollmentByUserId(userId: number){
    return await this.enrollmentsRepo.findByUserId(userId);
  }

  async findEnrollmentsByCourseId(courseId: number) {
    return await this.enrollmentsRepo.findByCourseId(courseId);
  }
}
