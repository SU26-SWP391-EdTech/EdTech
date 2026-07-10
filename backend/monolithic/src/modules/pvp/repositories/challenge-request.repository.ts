import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChallengeRequest } from '../entities/challenge-request.entity';
import { EntityManager, Repository } from 'typeorm';
import { ChallengeStatus } from 'src/common/enums/challenge-status.enum';

@Injectable()
export class ChallengeRequestRepository {
  constructor(
    @InjectRepository(ChallengeRequest)
    private readonly repo: Repository<ChallengeRequest>,
  ) {}

  get manager(): EntityManager {
    return this.repo.manager;
  }

  public async createRequest(
    data: Partial<ChallengeRequest>,
  ): Promise<ChallengeRequest> {
    const request = this.repo.create(data);
    return await this.repo.save(request);
  }

  public async findById(challengeId: number): Promise<ChallengeRequest | null> {
    return await this.repo.findOne({ where: { challengeId } });
  }

  public async updateStatus(
    challengeId: number,
    status: ChallengeStatus,
  ): Promise<void> {
    await this.repo.update(challengeId, { status });
  }

  async findPendingRequestForMatch(
    assessmentId: number,
    currentUserId: number,
    manager: EntityManager = this.manager,
  ): Promise<ChallengeRequest | null> {
    return await manager
      .createQueryBuilder(ChallengeRequest, 'challenge')
      .setLock('pessimistic_write') // Row-level locking to handle race conditions
      .where('challenge.assessment_id = :assessmentId', { assessmentId })
      .andWhere('challenge.status = :status', {
        status: ChallengeStatus.PENDING,
      })
      .andWhere('challenge.challenger_id != :currentUserId', { currentUserId }) // Do not match with oneself
      .andWhere('challenge.receiver_id IS NULL')
      .orderBy('challenge.created_at', 'ASC') // Match with the oldest request first
      .getOne();
  }

  public async findUserPendingRequest(userId: number, assessmentId: number): Promise<ChallengeRequest | null> {
    return await this.repo.findOne({
      where: {
        challengerId: userId,
        assessmentId,
        status: ChallengeStatus.PENDING,
      },
    });
  }
}
