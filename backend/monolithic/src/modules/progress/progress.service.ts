import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProgressRepository } from './progress.repository';
import { LearnerLessonProgress } from './entities/learner-lesson-progress.entity';
import { LessonsService } from '../lessons/service/lessons.service';
import { LessonProgressStatus } from 'src/common/enums/lesson-progress-status.enum';
import { LearnersService } from '../learners/services/learners.service';
import { LessonPrerequisiteService } from '../lessons/service/lesson-prerequisite.service';

@Injectable()
export class ProgressService {
  constructor(
    private readonly progressRepo: ProgressRepository,

    @Inject(forwardRef(() => LessonsService))
    private readonly lessonService: LessonsService,

    @Inject(forwardRef(() => LessonPrerequisiteService))
    private readonly lessonPrerequisiteService: LessonPrerequisiteService,

    private readonly learnerService: LearnersService,
  ) { }

  // find lesson progress by userId and lessonId
  public async findByUserAndLessonService(
    userId: number,
    lessonId: number,
  ): Promise<LearnerLessonProgress> {
    const lessonProgress = await this.progressRepo.findByUserAndLesson(
      userId,
      lessonId,
    );
    if (!lessonProgress) {
      throw new NotFoundException(
        'Can not find progress of lesson by user and lesson',
      );
    }
    return lessonProgress;
  }

  // went leaner click lesson it will start progress
  public async startLessonService(
    userId: number,
    lessonId: number,
  ): Promise<LearnerLessonProgress> {
    await this.learnerService.getLearnerProfileById(userId);
    await this.lessonService.findLessonByIdService(lessonId);

    const canStart =
      await this.lessonPrerequisiteService.checkLessonPrerequisite(
        userId,
        lessonId,
      );

    if (!canStart) {
      throw new ForbiddenException(
        'You must complete prerequisite lessons first.',
      );
    }

    let existed = await this.progressRepo.findByUserAndLesson(userId, lessonId);
    if (existed) {
      return existed;
    }

    const newLessonProgress = await this.progressRepo.create({
      userId,
      lessonId,
      status: LessonProgressStatus.ACTIVE,
    });

    return newLessonProgress;
  }

  // learer complete lesson
  public async completeLessonService(
    userId: number,
    lessonId: number,
  ): Promise<LearnerLessonProgress | null> {
    const learnerProfile =
      await this.learnerService.getLearnerProfileById(userId);

    const lesson = await this.lessonService.findLessonByIdService(lessonId);

    const lessonProgress = await this.findByUserAndLessonService(
      userId,
      lessonId,
    );
    const completeLesson = await this.progressRepo.updateStatus(
      userId,
      lessonId,
      LessonProgressStatus.COMPLETED,
    );
    return completeLesson;
  }

  public async isLessonCompleted(userId, lessonId): Promise<boolean> {
    const lessonProgress = await this.progressRepo.findByUserAndLesson(
      userId,
      lessonId,
    );

    if (!lessonProgress) {
      return false;
    }

    return lessonProgress.status === LessonProgressStatus.COMPLETED;
  }
}
