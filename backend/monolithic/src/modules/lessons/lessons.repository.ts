import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';

@Injectable()
export class LessonsRepository {
    constructor(
        @InjectRepository(Lesson)
        private readonly repo: Repository<Lesson>,
    ) { }

    public async createLesson(data: Partial<Lesson>): Promise<Lesson> {
        const lesson = this.repo.create(data);
        return await this.repo.save(lesson);
    }

    public async findById(lessonId: number): Promise<Lesson | null> {
        return await this.repo.findOne({
            where: { lessonId: lessonId as any },
            relations: ['course', 'prerequisites'],
        });
    }

    public async findByCourseId(courseId: number): Promise<Lesson[]> {
        return await this.repo.find({
            where: {
                course: { courseId },
            },
            relations: ['prerequisites'],
            order: {
                position: 'ASC',
            },
        });
    }


    public async save(lesson: Lesson): Promise<Lesson> {
        return await this.repo.save(lesson);
    }

    public async delete(lessonId: number): Promise<void> {
        await this.repo.delete(lessonId);
    }
    
}
