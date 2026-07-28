import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, LessThan, MoreThanOrEqual } from 'typeorm';
import { AssessmentType } from 'src/common/enums/assessment-type.enum';
import { AssessmentSessionRepository } from 'src/modules/assessment/repository/assessment-session.repository';
import { LearnerRepository } from '../learners.repository';
import { LearnerLessonProgress } from 'src/modules/progress/entities/learner-lesson-progress.entity';
import { LessonProgressStatus } from 'src/common/enums/lesson-progress-status.enum';
import { AssessmentSession } from 'src/modules/assessment/entities/assessment-session.entity';

const ELIGIBLE_TYPES: AssessmentType[] = [
  AssessmentType.PRACTICE,
  AssessmentType.LESSON_QUIZ,
];

@Injectable()
export class LearnerStreakService {
  constructor(
    private readonly learnerRepository: LearnerRepository,
    private readonly assessmentSessionRepository: AssessmentSessionRepository,
    private readonly dataSource: DataSource,
  ) {}

  public async getCurrentStreak(
    userId: number
  ){
    const learner = await this.learnerRepository.findLeanerById(userId);
    if (!learner) {
      throw new NotFoundException(`Learner ${userId} not found`);
    }
    return learner.currentStreak;
  }

  public async updateStreak(
    learnerId: number,
    completedAt: Date,
    currentSessionId?: number,
  ): Promise<void> {
    // 1. Load learner
    const learner = await this.learnerRepository.findLeanerById(learnerId);
    if (!learner) {
      throw new NotFoundException(`Learner ${learnerId} not found`);
    }

    // 2. Compute today's boundary (midnight of completedAt)
    const todayStart = new Date(completedAt);
    todayStart.setHours(0, 0, 0, 0);

    const assessmentRepo = this.dataSource.getRepository(AssessmentSession);
    const lessonProgressRepo = this.dataSource.getRepository(LearnerLessonProgress);

    // 3. Count total completed activities today (sessions + completed lessons)
    const sessionsTodayCount = await assessmentRepo.count({
      where: {
        userId: learnerId,
        completedAt: MoreThanOrEqual(todayStart),
      },
    });

    const lessonsTodayCount = await lessonProgressRepo.count({
      where: {
        userId: learnerId,
        status: LessonProgressStatus.COMPLETED,
        completedAt: MoreThanOrEqual(todayStart),
      },
    });

    const totalToday = sessionsTodayCount + lessonsTodayCount;

    // If learner already completed an activity today AND already has a non-zero streak, skip increment
    if (totalToday > 1 && learner.currentStreak > 0) {
      return;
    }

    // 4. Retrieve the most recent completed activity strictly BEFORE today
    const previousSession = await assessmentRepo.findOne({
      where: {
        userId: learnerId,
        completedAt: LessThan(todayStart),
      },
      order: { completedAt: 'DESC' },
    });

    const previousLesson = await lessonProgressRepo.findOne({
      where: {
        userId: learnerId,
        status: LessonProgressStatus.COMPLETED,
        completedAt: LessThan(todayStart),
      },
      order: { completedAt: 'DESC' },
    });

    let latestPriorDate: Date | null = null;
    if (previousSession?.completedAt && previousLesson?.completedAt) {
      latestPriorDate =
        previousSession.completedAt > previousLesson.completedAt
          ? previousSession.completedAt
          : previousLesson.completedAt;
    } else if (previousSession?.completedAt) {
      latestPriorDate = previousSession.completedAt;
    } else if (previousLesson?.completedAt) {
      latestPriorDate = previousLesson.completedAt;
    }

    // Rule 1 – no prior completion ever before today
    if (!latestPriorDate) {
      learner.currentStreak = 1;
      learner.longestStreak = Math.max(learner.longestStreak, 1);
      learner.streakLife = 1;
      await this.learnerRepository.saveLearner(learner);
      return;
    }

    // Determine gap in days between previous completion and today
    const prevDate = new Date(latestPriorDate);
    prevDate.setHours(0, 0, 0, 0);
    const diffMs = todayStart.getTime() - prevDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Rule 3 – completed yesterday → extend streak
      learner.currentStreak = Math.max(1, learner.currentStreak + 1);
      if (learner.currentStreak > learner.longestStreak) {
        learner.longestStreak = learner.currentStreak;
      }
      learner.streakLife = 1;
    } else if (diffDays > 1) {
      // Rule 4 – missed one or more days → consume one life
      const streakBeforeReset = learner.currentStreak;
      learner.streakLife -= 1;

      if (learner.streakLife < 0) {
        // Reset streak
        learner.longestStreak = Math.max(
          learner.longestStreak,
          streakBeforeReset,
        );
        learner.currentStreak = 1;
        learner.streakLife = 1;
      }
    } else {
      // Same day fallback if streak was 0
      learner.currentStreak = Math.max(1, learner.currentStreak);
      learner.longestStreak = Math.max(learner.longestStreak, learner.currentStreak);
    }

    await this.learnerRepository.saveLearner(learner);
  }
}
