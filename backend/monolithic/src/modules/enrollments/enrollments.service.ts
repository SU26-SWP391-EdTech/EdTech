import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnrollmentsRepository } from './enrollments.repository';
import { Course } from '../courses/entities/course.entity';
import { EnrollCourseDto } from './dto/enroll-course.dto';
import { EnrollmentStatus } from 'src/common/enums/enrollment.enum';
import { Enrollment } from './entities/enrollment.entity';

@Injectable()
export class EnrollmentsService {
    constructor(
        private readonly enrollmentsRepo: EnrollmentsRepository,

        @InjectRepository(Course)
        private readonly courseRepo: Repository<Course>,
    ) { }

    async enrollCourse(userId: number, dto: EnrollCourseDto): Promise<Enrollment> {
        const { courseId } = dto;

        const course = await this.courseRepo.findOne({
            where: { courseId },
        });

        if (!course) {
            throw new NotFoundException(`Not found course with ID ${courseId}`);
        }

        const existingEnrollment = await this.enrollmentsRepo.findByUserAndCourse(userId, courseId);

        if (existingEnrollment) {
            if (existingEnrollment.status === EnrollmentStatus.ACTIVE) {
                throw new BadRequestException('You have already enrolled in this course!');
            }
            existingEnrollment.status = EnrollmentStatus.ACTIVE;
            existingEnrollment.enrolledAt = new Date();
            existingEnrollment.progress = 0;

            course.enrollmentCount = (course.enrollmentCount || 0) + 1;
            await this.courseRepo.save(course);

            return await this.enrollmentsRepo.save(existingEnrollment);
        }

        const newEnrollment = this.enrollmentsRepo.create(userId, courseId);
        newEnrollment.status = EnrollmentStatus.ACTIVE;
        newEnrollment.progress = 0;
        newEnrollment.enrolledAt = new Date();

        const savedEnrollment = await this.enrollmentsRepo.save(newEnrollment);

        course.enrollmentCount = (course.enrollmentCount || 0) + 1;
        await this.courseRepo.save(course);

        return savedEnrollment;
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
