import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssessmentSession } from '../entities/assessment-session.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AssessmentSessionRepository {
  constructor(
    @InjectRepository(AssessmentSession)
    private readonly repo: Repository<AssessmentSession>,
  ) {}

  public async createAssessmentSession(data: Partial<AssessmentSession>) {
    const session = this.repo.create(data);
    return this.repo.save(session);
  }

  public async getAssessmentSessionByUserIdAndAssessmentId(
    userId: number,
    assessmentId: number,
  ): Promise<AssessmentSession | null> {
    return this.repo.findOne({
      where: {
        userId,
        assessmentId,
      },
      order: {
        startedAt: 'DESC',
      },
    });
  }

  public async getAssessmentSessionByUserIdAndSessionId(
    userId: number,
    sessionId: number,
  ): Promise<AssessmentSession | null> {
    return this.repo.findOne({
      where: {
        userId,
        sessionId,
      },
    });
  }

  public async updateAssessmentSession(
    sessionId: number,
    data: Partial<AssessmentSession>,
  ): Promise<AssessmentSession> {
    await this.repo.update({ sessionId }, data);

    return this.repo.findOneOrFail({
      where: { sessionId },
    });
  }

  public async findByCourseAndUser(
    courseId: number,
    userId: number,
): Promise<AssessmentSession[]> {
    return this.repo.createQueryBuilder('session')
        .innerJoin('session.assessment', 'assessment')
        .innerJoin('session.user', 'user')
        .where('assessment.courseId = :courseId', { courseId })
        .andWhere('user.userId = :userId', { userId })
        .getMany();
}

  
}
