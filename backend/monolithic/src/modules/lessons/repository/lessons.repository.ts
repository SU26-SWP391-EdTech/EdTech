import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Lesson } from '../entities/lesson.entity';
import { Course } from 'src/modules/courses/entities/course.entity';

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
      relations: {
        course: {
          user: {
            role: true,
          },
        },
        prerequisites: true,
        assessments: {
          questions: {
            options: true,
          },
        },
      },
    });
  }

  public async findByIds(ids: number[]): Promise<Lesson[]> {
    if (!ids || ids.length === 0) return [];
    return await this.repo.find({
      where: { lessonId: In(ids) as any },
      relations: {
        course: true,
      },
    });
  }

  public async findCourse(lessonId: number): Promise<Course | null> {
    const lesson = await this.repo.findOne({
      where: { lessonId: lessonId as any },
      relations: ['course'],
    });
    return lesson ? lesson.course : null;
  }

  public async belongsToCourseProvider(lessonId: number, userId: number): Promise<boolean> {
    const lesson = await this.repo.findOne({
      where: { lessonId: lessonId as any },
      relations: {
        course: {
          user: true,
        },
      },
    });
    if (!lesson || !lesson.course || !lesson.course.user) {
      return false;
    }
    return lesson.course.user.userId === userId;
  }

  public async findByCourseId(courseId: number): Promise<Lesson[]> {
    return await this.repo.find({
      where: {
        course: { courseId },
      },
      relations: ['prerequisites', 'course', 'assessments'],
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

