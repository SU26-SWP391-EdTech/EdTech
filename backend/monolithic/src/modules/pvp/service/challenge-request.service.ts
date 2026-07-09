import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ChallengeStatus } from 'src/common/enums/challenge-status.enum';
import { PvpMatchStatus } from 'src/common/enums/pvp-match-status.enum';
import { DataSource, EntityManager } from 'typeorm';
import { ChallengeRequest } from '../entities/challenge-request.entity';
import { PvpMatch } from '../entities/pvp-match.entity';
import { ChallengeRequestRepository } from '../repository/challenge-request.repository';

@Injectable()
export class ChallengeRequestService {
  constructor(
    private readonly challengeRequestRepository: ChallengeRequestRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Find a match for the learner.
   * If there is an existing pending request from the same user for this assessment, return it.
   * If there is a pending request from another user, match them (status = APPROVED, receiver_id = current user)
   * and create a new PvpMatch.
   * Otherwise, create a new pending challenge request.
   */
  async findOrCreateChallenge(userId: number, assessmentId: number): Promise<ChallengeRequest> {
    // 1. Check if the current user already has a pending challenge request for this assessment.
    const existingRequest = await this.challengeRequestRepository.findUserPendingRequest(userId, assessmentId);
    if (existingRequest) {
      return existingRequest;
    }

    // 2. Use a transaction to perform row-level locking on pending matches
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      // Find a pending request from another user
      const match = await this.challengeRequestRepository.findPendingRequestForMatch(
        assessmentId,
        userId,
        manager,
      );

      if (match) {
        // Match found! Update the challenge request
        match.receiverId = userId;
        match.status = ChallengeStatus.APPROVED;
        match.respondedAt = new Date();
        const savedRequest = await manager.save(ChallengeRequest, match);

        // Create a corresponding PVP match
        const pvpMatch = manager.create(PvpMatch, {
          assessmentId,
          player1Id: match.challengerId,
          player2Id: userId,
          status: PvpMatchStatus.STARTED,
          player1Score: 0,
          player2Score: 0,
        });
        await manager.save(PvpMatch, pvpMatch);

        return savedRequest;
      } else {
        // No match found, create a new challenge request
        const newRequest = manager.create(ChallengeRequest, {
          assessmentId,
          challengerId: userId,
          status: ChallengeStatus.PENDING,
        });
        return await manager.save(ChallengeRequest, newRequest);
      }
    });
  }

  /**
   * Get the status of a specific challenge request.
   * Ensures the requesting user is either the challenger or the receiver.
   */
  async getChallengeStatus(challengeId: number, userId: number): Promise<ChallengeRequest> {
    const challenge = await this.challengeRequestRepository.findById(challengeId);
    if (!challenge) {
      throw new NotFoundException(`Challenge request with ID ${challengeId} not found`);
    }

    if (challenge.challengerId !== userId && challenge.receiverId !== userId) {
      throw new BadRequestException('You are not authorized to view this challenge request status');
    }

    return challenge;
  }

  /**
   * Cancel a pending challenge request.
   * Ensures only the creator can cancel and only if it's still pending.
   */
  async cancelChallenge(challengeId: number, userId: number): Promise<ChallengeRequest> {
    const challenge = await this.challengeRequestRepository.findById(challengeId);
    if (!challenge) {
      throw new NotFoundException(`Challenge request with ID ${challengeId} not found`);
    }

    if (challenge.challengerId !== userId) {
      throw new BadRequestException('You can only cancel challenge requests that you created');
    }

    if (challenge.status !== ChallengeStatus.PENDING) {
      throw new BadRequestException(`Cannot cancel a challenge request that is already ${challenge.status.toLowerCase()}`);
    }

    challenge.status = ChallengeStatus.REJECTED;
    challenge.respondedAt = new Date();
    await this.challengeRequestRepository.updateStatus(challengeId, ChallengeStatus.REJECTED);

    return challenge;
  }
}
