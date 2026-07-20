import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LearnerStreakService } from './services/learner-streak.service';
import { LearnerRepository } from './learners.repository';
import { AssessmentSessionRepository } from '../assessment/repository/assessment-session.repository';
import { Learner } from './entities/learner.entity';
import { AssessmentSession } from '../assessment/entities/assessment-session.entity';
import { AssessmentType } from 'src/common/enums/assessment-type.enum';

const ELIGIBLE_TYPES = [AssessmentType.PRACTICE, AssessmentType.LESSON_QUIZ];

function makeLearner(overrides: Partial<Learner> = {}): Learner {
  return Object.assign(new Learner(), {
    userId: 1,
    currentStreak: 0,
    longestStreak: 0,
    streakLife: 1,
    ...overrides,
  });
}

function makeSession(completedAt: Date): Partial<AssessmentSession> {
  return { completedAt };
}

function daysAgo(n: number): Date {
  const d = new Date('2026-07-20T10:00:00.000Z');
  d.setDate(d.getDate() - n);
  return d;
}

const TODAY = new Date('2026-07-20T10:00:00.000Z');

describe('LearnerStreakService', () => {
  let service: LearnerStreakService;
  let learnerRepo: jest.Mocked<LearnerRepository>;
  let sessionRepo: jest.Mocked<AssessmentSessionRepository>;

  beforeEach(async () => {
    const mockLearnerRepo = {
      findLeanerById: jest.fn(),
      saveLearner: jest.fn(),
    };
    const mockSessionRepo = {
      findLatestCompletedEligible: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearnerStreakService,
        { provide: LearnerRepository, useValue: mockLearnerRepo },
        { provide: AssessmentSessionRepository, useValue: mockSessionRepo },
      ],
    }).compile();

    service = module.get<LearnerStreakService>(LearnerStreakService);
    learnerRepo = module.get(LearnerRepository);
    sessionRepo = module.get(AssessmentSessionRepository);
  });

  it('throws NotFoundException when learner does not exist', async () => {
    learnerRepo.findLeanerById.mockResolvedValue(null);
    await expect(service.updateStreak(999, TODAY)).rejects.toThrow(
      NotFoundException,
    );
  });

  // Rule 1 – no prior completion
  it('Rule 1: sets streak to 1 when learner has never completed an eligible assessment', async () => {
    const learner = makeLearner({ currentStreak: 0, longestStreak: 0, streakLife: 1 });
    learnerRepo.findLeanerById.mockResolvedValue(learner);
    sessionRepo.findLatestCompletedEligible.mockResolvedValue(null);
    learnerRepo.saveLearner.mockImplementation(async (l) => l);

    await service.updateStreak(1, TODAY);

    expect(learnerRepo.saveLearner).toHaveBeenCalledWith(
      expect.objectContaining({ currentStreak: 1, longestStreak: 1, streakLife: 1 }),
    );
  });

  // Rule 2 – already completed today
  it('Rule 2: does nothing when learner already completed an eligible assessment today', async () => {
    const learner = makeLearner({ currentStreak: 5, longestStreak: 10, streakLife: 1 });
    learnerRepo.findLeanerById.mockResolvedValue(learner);
    // previous session completedAt is today (same day)
    sessionRepo.findLatestCompletedEligible.mockResolvedValue(
      makeSession(new Date('2026-07-20T05:00:00.000Z')) as AssessmentSession,
    );

    await service.updateStreak(1, TODAY);

    expect(learnerRepo.saveLearner).not.toHaveBeenCalled();
  });

  // Rule 3 – completed yesterday
  it('Rule 3: increments streak when completed yesterday', async () => {
    const learner = makeLearner({ currentStreak: 5, longestStreak: 10, streakLife: 0 });
    learnerRepo.findLeanerById.mockResolvedValue(learner);
    sessionRepo.findLatestCompletedEligible.mockResolvedValue(
      makeSession(daysAgo(1)) as AssessmentSession,
    );
    learnerRepo.saveLearner.mockImplementation(async (l) => l);

    await service.updateStreak(1, TODAY);

    expect(learnerRepo.saveLearner).toHaveBeenCalledWith(
      expect.objectContaining({ currentStreak: 6, longestStreak: 10, streakLife: 1 }),
    );
  });

  it('Rule 3: updates longestStreak when currentStreak exceeds it', async () => {
    const learner = makeLearner({ currentStreak: 10, longestStreak: 10, streakLife: 0 });
    learnerRepo.findLeanerById.mockResolvedValue(learner);
    sessionRepo.findLatestCompletedEligible.mockResolvedValue(
      makeSession(daysAgo(1)) as AssessmentSession,
    );
    learnerRepo.saveLearner.mockImplementation(async (l) => l);

    await service.updateStreak(1, TODAY);

    expect(learnerRepo.saveLearner).toHaveBeenCalledWith(
      expect.objectContaining({ currentStreak: 11, longestStreak: 11, streakLife: 1 }),
    );
  });

  // Rule 4 + Rule 5 – missed a day but streakLife > 0 → keeps streak
  it('Rule 4+5: consumes one life but keeps streak when streakLife was 1 (becomes 0)', async () => {
    const learner = makeLearner({ currentStreak: 8, longestStreak: 12, streakLife: 1 });
    learnerRepo.findLeanerById.mockResolvedValue(learner);
    sessionRepo.findLatestCompletedEligible.mockResolvedValue(
      makeSession(daysAgo(2)) as AssessmentSession, // missed 1 day
    );
    learnerRepo.saveLearner.mockImplementation(async (l) => l);

    await service.updateStreak(1, TODAY);

    expect(learnerRepo.saveLearner).toHaveBeenCalledWith(
      expect.objectContaining({ currentStreak: 8, longestStreak: 12, streakLife: 0 }),
    );
  });

  // Rule 4 + Rule 6 – missed a day and streakLife was 0 → streak broken
  it('Rule 4+6: resets streak when streakLife drops below 0', async () => {
    const learner = makeLearner({ currentStreak: 8, longestStreak: 12, streakLife: 0 });
    learnerRepo.findLeanerById.mockResolvedValue(learner);
    sessionRepo.findLatestCompletedEligible.mockResolvedValue(
      makeSession(daysAgo(3)) as AssessmentSession, // missed multiple days
    );
    learnerRepo.saveLearner.mockImplementation(async (l) => l);

    await service.updateStreak(1, TODAY);

    expect(learnerRepo.saveLearner).toHaveBeenCalledWith(
      expect.objectContaining({ currentStreak: 1, longestStreak: 12, streakLife: 1 }),
    );
  });

  it('Rule 6: preserves longestStreak during reset if currentStreak was larger', async () => {
    const learner = makeLearner({ currentStreak: 15, longestStreak: 12, streakLife: 0 });
    learnerRepo.findLeanerById.mockResolvedValue(learner);
    sessionRepo.findLatestCompletedEligible.mockResolvedValue(
      makeSession(daysAgo(5)) as AssessmentSession,
    );
    learnerRepo.saveLearner.mockImplementation(async (l) => l);

    await service.updateStreak(1, TODAY);

    expect(learnerRepo.saveLearner).toHaveBeenCalledWith(
      expect.objectContaining({ currentStreak: 1, longestStreak: 15, streakLife: 1 }),
    );
  });
});
