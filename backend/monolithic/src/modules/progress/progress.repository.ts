import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LearnerLessonProgress } from './entities/learner-lesson-progress.entity';
import { Repository } from 'typeorm';
import { LessonProgressStatus } from 'src/common/enums/lesson-progress-status.enum';

@Injectable()
export class ProgressRepository {
  constructor(
    @InjectRepository(LearnerLessonProgress)
    private readonly repo: Repository<LearnerLessonProgress>,
  ) {}

  public async findByUserAndLesson(
    userId: number,
    lessonId: number,
  ): Promise<LearnerLessonProgress | null> {
    return this.repo.findOne({
      where: {
        userId,
        lessonId,
      },
    });
  }

  // start new lesson progress
  public async create(
    progress: Partial<LearnerLessonProgress>,
  ): Promise<LearnerLessonProgress> {
    const entity = this.repo.create(progress);
    return this.repo.save(entity);
  }

  // update and return new data of progress lesson
  public async updateStatus(userId: number, lessonId: number, status: LessonProgressStatus): Promise<LearnerLessonProgress | null> {
    await this.repo.update(
      {
        userId, 
        lessonId
      }, {
      status,
      completedAt: new Date()
    })

    return await this.repo.findOneBy({ userId, lessonId });
  }

}
