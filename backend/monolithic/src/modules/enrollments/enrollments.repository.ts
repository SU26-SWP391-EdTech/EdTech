import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { EnrollmentStatus } from 'src/common/enums/enrollment.enum';

@Injectable()
export class EnrollmentsRepository {
    constructor(
        @InjectRepository(Enrollment)
        private readonly repo: Repository<Enrollment>,
    ) { }

    public async findByUserAndCourse(userId: number, courseId: number): Promise<Enrollment | null> {
        return await this.repo.findOne({
            where: {
                user: { userId },
                course: { courseId },
            },
            relations: ['course'],
        });
    }

    public create(userId: number, courseId: number): Enrollment {
        return this.repo.create({
            user: { userId },
            course: { courseId },
        });
    }

    public async save(enrollment: Enrollment): Promise<Enrollment> {
        return await this.repo.save(enrollment);
    }

    public async findMyEnrollments(userId: number): Promise<Enrollment[]> {
        return await this.repo.find({
            where: {
                user: { userId },
            },
            relations: ['course', 'course.user'],
            order: {
                enrolledAt: 'DESC',
            },
        });
    }

    public async findByUserId(
        userId: number,
    ): Promise<Enrollment[]> {
        return await this.repo.find({
            where: {
                user: {
                    userId,
                },
            },
            relations: ['course'],
        });
    }

    public async findByCourseId(
        courseId: number,
    ): Promise<Enrollment[]> {
        return await this.repo.find({
            where: {
                course: {
                    courseId,
                },
                status: EnrollmentStatus.ACTIVE,
            },
            relations: ['user'],
        });
    }
}

