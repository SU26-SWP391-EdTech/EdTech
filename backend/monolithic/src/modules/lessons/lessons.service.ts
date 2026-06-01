import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonsRepository } from './lessons.repository';
import { Course } from '../courses/entities/course.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from './entities/lesson.entity';

@Injectable()
export class LessonsService {
    constructor(
        private readonly lessonsRepo: LessonsRepository,

        @InjectRepository(Course)
        private readonly courseRepo: Repository<Course>,
    ) { }

    async create(dto: CreateLessonDto): Promise<Lesson> {
        const { courseId, ...lessonData } = dto;

        const course = await this.courseRepo.findOne({
            where: { courseId },
        });

        if (!course) {
            throw new NotFoundException(`Not found course with ID ${courseId}`);
        }

        return await this.lessonsRepo.createLesson({
            ...lessonData,
            course,
        });
    }

    async findAllByCourse(courseId: number): Promise<Lesson[]> {
        const course = await this.courseRepo.findOne({ where: { courseId } });
        if (!course) {
            throw new NotFoundException(`Not found course with ID ${courseId}`);
        }

        return await this.lessonsRepo.findByCourseId(courseId);
    }

    async findOne(id: number): Promise<Lesson> {
        const lesson = await this.lessonsRepo.findById(id);

        if (!lesson) {
            throw new NotFoundException(`Not found lesson with ID ${id}`);
        }

        return lesson;
    }


    async update(id: number, dto: UpdateLessonDto): Promise<Lesson> {
        const lesson = await this.findOne(id);

        if (dto.courseId) {
            const course = await this.courseRepo.findOne({ where: { courseId: dto.courseId } });
            if (!course) {
                throw new NotFoundException(`Not found course with ID ${dto.courseId}`);
            }
            lesson.course = course;
        }

        const { courseId, ...updateData } = dto;
        Object.assign(lesson, updateData);

        return await this.lessonsRepo.save(lesson);
    }

    async remove(id: number): Promise<{ success: boolean; message: string }> {
        await this.findOne(id);
        await this.lessonsRepo.delete(id);
        return {
            success: true,
            message: `Lesson with ID ${id} has been deleted successfully`,
        };
    }
}
