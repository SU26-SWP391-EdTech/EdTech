import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EnrollmentsRepository } from './enrollments.repository';
import { Course } from '../courses/entities/course.entity';
import { EnrollCourseDto } from './dto/enroll-course.dto';
import { EnrollmentStatus } from 'src/common/enums/enrollment.enum';
import { Enrollment } from './entities/enrollment.entity';
import { CourseStatus } from 'src/common/enums/course.enum';

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly enrollmentsRepo: EnrollmentsRepository,

    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    private dataSource: DataSource,
  ) { }

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
    return await this.enrollmentsRepo.findMyEnrollments(userId);
  }

  async getEnrollmentDetail(userId: number, courseId: number): Promise<Enrollment> {
    const enrollment = await this.enrollmentsRepo.findByUserAndCourse(userId, courseId);

    if (!enrollment) {
      throw new NotFoundException(`You have not enrolled in this course!`);
    }

    return enrollment;
  }

}
