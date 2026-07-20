import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChallengeRequestRepository } from '../repositories/challenge-request.repository';
import { AssessmentService } from 'src/modules/assessment/service/assessment.service';
import { LearnersService } from 'src/modules/learners/services/learners.service';
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
  ) { }

  async challengeRequests(
    assessmentId: number,
    receiverId: number,
    userId: number,
  ) {

    const challenger = await this.learnerService.getLearnerProfileById(userId);

    if (!challenger) {
      throw new ForbiddenException(`User with ID: ${userId} is not a learner`);
    }

    if (userId === receiverId) {
      throw new BadRequestException('You cannot challenge yourself.');
    }

    if (!this.connectionManager.isOnline(receiverId) && receiverId !== 12) {
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
    ).catch(() => false);
    const checkEnrollReceiver = receiverId === 12
      ? true
      : await this.enrollmentService.checkEnrollment(
          receiverId,
          assessment.courseId,
        ).catch(() => false);

    if (!checkEnrollChallenger || !checkEnrollReceiver) {
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

    if (receiverId === 12 && !this.connectionManager.isOnline(12)) {
      setTimeout(async () => {
        try {
          await this.challengeApprove(
            { challengeId: challenge.challengeId },
            12,
          );
        } catch (e) {
          console.error(`Failed to auto-approve mock challenge: ${e.message}`);
        }
      }, 1500);
    } else {
      setTimeout(async () => {
        await this.challengeExpire(challenge.challengeId);
      }, 30000);
    }
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

    const userIds: number[] = [
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
  ) {
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

  async challengeReject(challengeRejectDto: ChallengeRejectDto, userId: number) {
    const { challengeId } = challengeRejectDto;
    const challenge = await this.challengeRequestRepo.findById(challengeId);

    if (!challenge) {
      throw new NotFoundException(`Challenge with ID: ${challengeId} not found`);
    }

    if (challenge.receiverId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to reject this challenge.',
      );
    }

    if (challenge.status !== ChallengeStatus.PENDING) {
      throw new BadRequestException(
        'Challenge is no longer pending.',
      );
    }

    await this.challengeRequestRepo.rejectChallenge(challengeId);

    this.socketService.emitToUser(
      challenge.challengerId,
      SocketEvents.CHALLENGE_REJECTED,
      { challengeId }
    );
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
  }

  async getChallengeStatus(challengeId: number, userId: number) {
    const challenge = await this.challengeRequestRepo.findById(challengeId);

    if (!challenge) {
      throw new NotFoundException();
    }

    if (
      challenge.challengerId !== userId &&
      challenge.receiverId !== userId
    ) {
      throw new ForbiddenException();
    }

    return {
      challengeId,
      status: challenge.status
    }
  }

  async getOnlinePlayers(userId: number, courseId?: number) {
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(__dirname, '../../../../debug_connections.log');
    const details: any[] = [];
    for (const [uid, sid] of (this.connectionManager as any).userConnections.entries()) {
      let extra = 'no socket found';
      if (this.socketService && (this.socketService as any).server) {
        const socket = (this.socketService as any).server.sockets.sockets.get(sid);
        if (socket) {
          extra = `user-agent: ${socket.handshake.headers['user-agent']}`;
        }
      }
      details.push({ uid, sid, extra });
    }
    const logMsg = `[${new Date().toISOString()}] userConnections details: ${JSON.stringify(details)}\n`;
    fs.appendFileSync(logPath, logMsg);
    const onlineIds = [...this.connectionManager.getOnlineUsers()];

    const result: any[] = [];
    for (const id of onlineIds) {
      if (id === userId) continue;

      // If courseId is provided, check if the user is enrolled in the same course
      if (courseId) {
        try {
          const isEnrolled = await this.enrollmentService.checkEnrollment(id, courseId);
          if (!isEnrolled) continue;
        } catch (e) {
          continue; // Not enrolled or error
        }
      }

      try {
        const profile = await this.learnerService.viewLearnerProfile(id);
        result.push({
          userId: id,
          fullName: profile.fullName,
          email: profile.email,
          avatarUrl: profile.avatarUrl,
          bio: profile.bio,
          level: profile.level
        });
      } catch (e) {
        // Fallback
        result.push({
          userId: id,
          fullName: `User #${id}`,
          email: '',
          avatarUrl: '',
          bio: '',
          level: ''
        });
      }
    }
    return result;
  }
}
