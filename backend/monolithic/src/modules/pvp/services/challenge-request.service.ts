<<<<<<< HEAD
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChallengeRequestRepository } from '../repositories/challenge-request.repository';
import { ChallengeRequestDto } from '../dto/challenge/challenge-request.dto';
import { AssessmentService } from 'src/modules/assessment/service/assessment.service';
import { LearnersService } from 'src/modules/learners/learners.service';
import { AssessmentType } from 'src/common/enums/assessment-type.enum';
import { EnrollmentsService } from 'src/modules/enrollments/enrollments.service';
import { ConnectionManager } from '../manager/connection.manager';
import { ChallengeStatus } from 'src/common/enums/challenge-status.enum';
import { ChallengeApproveDto } from '../dto/challenge/challenge-approve.dto';
import { ChallengeRejectDto } from '../dto/challenge/challenge-reject.dto';
import { SocketService } from './socket.service';
import { SocketEvents } from '../constants/socket-events.constant';
import { BattleService } from './battle.service';
@Injectable()
export class ChallengeRequestService {
  constructor(
    private readonly assessmentService: AssessmentService,
    private readonly learnerService: LearnersService,
    private readonly enrollmentService: EnrollmentsService,
    private readonly connectionManager: ConnectionManager,
    private readonly challengeRequestRepo: ChallengeRequestRepository,
    private readonly socketService: SocketService,
    private readonly battleService: BattleService,
  ) {}

  async challengeRequests(
    challengeRequestDto: ChallengeRequestDto,
    userId: number,
  ) {
    const { assessmentId, receiverId } = challengeRequestDto;

    const challenger = await this.learnerService.getLearnerProfileById(userId);

    if (!challenger) {
      throw new ForbiddenException(`User with ID: ${userId} is not a learner`);
    }

    if (userId === receiverId) {
      throw new BadRequestException('You cannot challenge yourself.');
    }

    if (!this.connectionManager.isOnline(receiverId)) {
      throw new BadRequestException('Opponent is offline.');
    }

    const pendingChallenge =
      await this.challengeRequestRepo.findPendingChallenge(userId, receiverId);

    if (pendingChallenge) {
      throw new ConflictException(
        'A pending challenge already exists between these two players.',
      );
    }

    const assessment =
      await this.assessmentService.findOneService(assessmentId);

    if (!assessment) {
      throw new NotFoundException(
        `Not found assessment with ID: ${assessmentId}`,
      );
    }

    const checkEnrollChallenger = await this.enrollmentService.checkEnrollment(
      userId,
      assessment.courseId,
    );
    const checkEnrollReceiver = await this.enrollmentService.checkEnrollment(
      receiverId,
      assessmentId,
    );

    if (!checkEnrollChallenger && !checkEnrollReceiver) {
      throw new BadRequestException(
        `You have not enrolled in this course yet!`,
      );
    } else if (!checkEnrollChallenger || !checkEnrollReceiver) {
      throw new BadRequestException(
        `You have not enrolled in this course yet!`,
      );
    }

    if (assessment.type !== AssessmentType.PVP) {
      throw new BadRequestException(
        `The assessment for match must be in PVP type`,
      );
    }

    const rival = await this.learnerService.getLearnerProfileById(receiverId);

    if (!rival) {
      throw new ForbiddenException(
        `User with ID: ${receiverId} is not a learner`,
      );
    }
    const challenge = await this.challengeRequestRepo.create({
        challengerId: userId,
        receiverId,
        assessmentId,
        status: ChallengeStatus.PENDING,
    });

    this.socketService.emitToUser(
      receiverId,
      SocketEvents.CHALLENGE_RECEIVED,
      challenge,
  );

    setTimeout(async () => {
      await this.challengeExpire(challenge.challengeId);
    }, 30000);
  }

  async challengeExpire(challengeId: number) {

    const challenge = await this.challengeRequestRepo.findById(challengeId);

    if (!challenge) return;

    if (challenge.status !== ChallengeStatus.PENDING) {
        return;
    }

    await this.challengeRequestRepo.expireChallenge(
        challengeId
    );

    const userIds : number[] = [
      challenge.challengerId, 
      challenge.receiverId
    ]

    this.socketService.emitToUsers(
      userIds,
      SocketEvents.CHALLENGE_EXPIRED,
      challenge
    );

}

  async challengeApprove(
    challengeApproveDto: ChallengeApproveDto,
    userId: number,
  ){
    const { challengeId } = challengeApproveDto;
    const challenge = await this.challengeRequestRepo.findById(challengeId);

    if (challenge.receiverId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to approve this challenge.',
      );
    }

    if (challenge.status !== ChallengeStatus.PENDING) {
      throw new BadRequestException(
        'Challenge is no longer pending.',
      );
    }

    await this.challengeRequestRepo.approveChallenge(challengeId);

    await this.battleService.createBattle({
      challengeId: challenge.challengeId,
      assessmentId: challenge.assessmentId,
      challengerId: challenge.challengerId,
      receiverId: challenge.receiverId,
    });
  }

  async challengeReject(challengeRejectDto: ChallengeRejectDto){
    const { challengeId } = challengeRejectDto;
    return await this.challengeRequestRepo.rejectChallenge(challengeId);
  }

  async cancelChallenge(
    challengeId: number,
    userId: number,
  ): Promise<void> {
  
    const challenge =
      await this.challengeRequestRepo.findById(challengeId);
  
    if (!challenge) {
      throw new NotFoundException(
        `Challenge ${challengeId} not found`,
      );
    }
  
    // Chỉ người gửi challenge mới được hủy
    if (challenge.challengerId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to cancel this challenge.',
      );
    }
  
    // Chỉ hủy khi đang chờ phản hồi
    if (challenge.status !== ChallengeStatus.PENDING) {
      throw new BadRequestException(
        'Challenge cannot be cancelled.',
      );
    }
  
    await this.challengeRequestRepo.cancelChallenge(
      challengeId
    );
  
    this.socketService.emitToUser(
      challenge.receiverId,
      SocketEvents.CHALLENGE_CANCELLED,
      {
        challengeId,
      },
    );
=======
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ChallengeStatus } from 'src/common/enums/challenge-status.enum';
import { PvpMatchStatus } from 'src/common/enums/pvp-match-status.enum';
import { DataSource, EntityManager } from 'typeorm';
import { ChallengeRequest } from '../entities/challenge-request.entity';
import { PvpMatch } from '../entities/pvp-match.entity';
import { ChallengeRequestRepository } from '../repositories/challenge-request.repository';

@Injectable()
export class ChallengeRequestService {
  constructor(
    private readonly challengeRequestRepository: ChallengeRequestRepository,
    private readonly dataSource: DataSource,
  ) { }

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
>>>>>>> develop
  }
}
