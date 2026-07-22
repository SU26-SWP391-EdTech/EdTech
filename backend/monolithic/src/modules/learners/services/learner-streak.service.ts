import { Injectable, NotFoundException } from '@nestjs/common';
import { AssessmentType } from 'src/common/enums/assessment-type.enum';
import { AssessmentSessionRepository } from 'src/modules/assessment/repository/assessment-session.repository';
import { LearnerRepository } from '../learners.repository';

const ELIGIBLE_TYPES: AssessmentType[] = [
  AssessmentType.PRACTICE,
  AssessmentType.LESSON_QUIZ,
];

@Injectable()
export class LearnerStreakService {
  constructor(
    private readonly learnerRepository: LearnerRepository,
    private readonly assessmentSessionRepository: AssessmentSessionRepository,
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
    currentSessionId: number,
  ): Promise<void> {
    // 1. Load learner
    const learner = await this.learnerRepository.findLeanerById(learnerId);
    if (!learner) {
      throw new NotFoundException(`Learner ${learnerId} not found`);
    }

    // 2. Compute today's boundary (midnight of completedAt)
    const todayStart = new Date(completedAt);
    todayStart.setHours(0, 0, 0, 0);

    // 3. Retrieve the most-recent completed eligible session before today
    //    (we exclude sessions completed today by filtering completedAt < todayStart)
    const previousSession =
      await this.assessmentSessionRepository.findLatestCompletedEligible(
        learnerId,
        ELIGIBLE_TYPES,
        currentSessionId, // no session to exclude; we query only *before* today
      );

    // For Rule 2: check if previous session was already today
    const hasCompletedToday =
      previousSession?.completedAt !== undefined &&
      previousSession.completedAt !== null &&
      previousSession.completedAt >= todayStart;

    // Rule 2 – already completed an eligible assessment today → skip
    if (hasCompletedToday) {
      return;
    }

    // Rule 1 – no prior eligible completion ever
    if (!previousSession) {
      learner.currentStreak = 1;
      learner.longestStreak = Math.max(learner.longestStreak, 1);
      learner.streakLife = 1;
      await this.learnerRepository.saveLearner(learner);
      return;
    }

    // Determine gap in days between previous completion and today
    const prevDate = new Date(previousSession.completedAt!);
    prevDate.setHours(0, 0, 0, 0);
    const diffMs = todayStart.getTime() - prevDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Rule 3 – completed yesterday → extend streak
      learner.currentStreak += 1;
      if (learner.currentStreak > learner.longestStreak) {
        learner.longestStreak = learner.currentStreak;
      }
      // Restore one life (cap behaviour: spec says restore to 1, not increment)
      learner.streakLife = 1;
    } else {
      // Rule 4 – missed one or more days → consume one life
      const streakBeforeReset = learner.currentStreak;
      learner.streakLife -= 1;

      if (learner.streakLife >= 0) {
        // Rule 5 – still has a life left → keep streak
        // (streakLife may now be 0, streak is preserved)
      } else {
        // Rule 6 – no lives left → reset streak
        learner.longestStreak = Math.max(
          learner.longestStreak,
          streakBeforeReset,
        );
        learner.currentStreak = 1;
        learner.streakLife = 1;
      }
    }

    await this.learnerRepository.saveLearner(learner);
  }
}
