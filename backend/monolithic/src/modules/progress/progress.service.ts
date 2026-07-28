import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { ProgressRepository } from './progress.repository';
import { LearnerLessonProgress } from './entities/learner-lesson-progress.entity';
import { LessonsService } from '../lessons/service/lessons.service';
import { LessonProgressStatus } from 'src/common/enums/lesson-progress-status.enum';
import { LearnersService } from '../learners/services/learners.service';
import { LessonPrerequisiteService } from '../lessons/service/lesson-prerequisite.service';
import { LearnerStreakService } from '../learners/services/learner-streak.service';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { EnrollmentStatus } from 'src/common/enums/enrollment.enum';

@Injectable()
export class ProgressService {
  constructor(
    private readonly progressRepo: ProgressRepository,

    @Inject(forwardRef(() => LessonsService))
    private readonly lessonService: LessonsService,

    @Inject(forwardRef(() => LessonPrerequisiteService))
    private readonly lessonPrerequisiteService: LessonPrerequisiteService,

    private readonly learnerService: LearnersService,

    @Inject(forwardRef(() => LearnerStreakService))
    private readonly learnerStreakService: LearnerStreakService,

    private readonly dataSource: DataSource,
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
    const lesson = await this.lessonService.findLessonByIdService(lessonId);
    await this.requireValidEnrollment(userId, lesson.course.courseId);

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
    await this.requireValidEnrollment(userId, lesson.course.courseId);

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
    let completeLesson: LearnerLessonProgress | null = null;

    if (!existed) {
      completeLesson = await this.progressRepo.create({
        userId,
        lessonId,
        status: LessonProgressStatus.COMPLETED,
        completedAt: new Date(),
      });
    } else {
      completeLesson = await this.progressRepo.updateStatus(
        userId,
        lessonId,
        LessonProgressStatus.COMPLETED,
      );
    }

    // Update Streak when completing any lesson (Video, Reading, etc.)
    try {
      await this.learnerStreakService.updateStreak(userId, new Date());
    } catch (error) {
      // Gracefully handle error so that completion progress is not blocked
    }

    // Update Enrollment progress for the course
    try {
      if (lesson && lesson.course && lesson.course.courseId) {
        const courseId = lesson.course.courseId;
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
          const enrollmentRepo = this.dataSource.getRepository(Enrollment);
          const enrollment = await enrollmentRepo.findOne({
            where: { user: { userId }, course: { courseId } },
          });

          if (enrollment) {
            enrollment.progress = calcProgress;
            if (calcProgress >= 100) {
              enrollment.status = EnrollmentStatus.COMPLETED;
              if (!enrollment.completedAt) {
                enrollment.completedAt = new Date();
              }
            }
            await enrollmentRepo.save(enrollment);
          }
        }
      }
    } catch (error) {
      console.error('Failed to update course enrollment progress:', error);
    }

    return completeLesson;
  }

  private async requireValidEnrollment(userId: number, courseId: number): Promise<void> {
    const enrollment = await this.dataSource.getRepository(Enrollment).findOne({ where: { user: { userId }, course: { courseId } } });
    if (!enrollment || ![EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED].includes(enrollment.status)) {
      throw new ForbiddenException('An active or completed enrollment is required to update lesson progress');
    }
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
