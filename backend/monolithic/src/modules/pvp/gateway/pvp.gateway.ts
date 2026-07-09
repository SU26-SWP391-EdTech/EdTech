import { HttpException } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { ConnectionManager } from '../manager/connection.manager';
import { SocketEvents } from '../constants/socket-events.constant';
import { ChallengeRequestDto } from '../dto/challenge/challenge-request.dto';
import { ChallengeRequestService } from '../services/challenge-request.service';
import { JwtService } from '@nestjs/jwt';
import { ChallengeApproveDto } from '../dto/challenge/challenge-approve.dto';
import { ChallengeRejectDto } from '../dto/challenge/challenge-reject.dto';
import { SocketService } from '../services/socket.service';
import { ChallengeCancelDto } from '../dto/challenge/challenge-cancel.dto';
import { BattleService } from '../services/battle.service';
import { SubmitAnswerDto } from '../dto/battle/submit-answer.dto';
import { LeaveBattleDto } from '../dto/battle/leave-battle.dto';
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PvpGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly connectionManager: ConnectionManager,
    private readonly challengeRequestService: ChallengeRequestService,
    private readonly battleService: BattleService,
    private readonly jwtService: JwtService,
    private readonly socketService: SocketService,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit(){
    this.socketService.setServer(this.server);
  }

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }
      const payload = this.jwtService.verify(token);

      client.data.user = payload;

      this.connectionManager.addConnection(payload.userId, client.id);

      console.log(`User ${payload.userId} connected`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;

    if(user){
        this.connectionManager.removeConnection(client.id);
    }

    console.log(`${client.id} disconnected`);
}

  @SubscribeMessage(SocketEvents.REQUEST_CHALLENGE)
  async challengeRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() challengeRequestDto: ChallengeRequestDto,
  ) {
    await this.handleSocketAction(client, async () => {
      await this.challengeRequestService.challengeRequests(
        challengeRequestDto,
        client.data.user.userId,
      );
    });
  }

  @SubscribeMessage(SocketEvents.APPROVE_CHALLENGE)
  async challengeApprove(
    @ConnectedSocket() client: Socket,
    @MessageBody() challengeApproveDto: ChallengeApproveDto,
  ){
    await this.handleSocketAction(client, async () => {
      await this.challengeRequestService.challengeApprove(
        challengeApproveDto,
        client.data.user.userId,
      );
    });
  }

  @SubscribeMessage(SocketEvents.REJECT_CHALLENGE)
  async challegeReject(
    @ConnectedSocket() client: Socket,
    @MessageBody() challengeRejectDto: ChallengeRejectDto,
  ){
    await this.handleSocketAction(client, async () => {
      await this.challengeRequestService.challengeReject(
        challengeRejectDto
      );
    });
  }

  @SubscribeMessage(SocketEvents.CANCEL_CHALLENGE)
  async challengeCancel(
    @ConnectedSocket() client: Socket,
    @MessageBody() challengeCancelDto: ChallengeCancelDto,
  ){
    const userId = client.data.user.userId;

    await this.handleSocketAction(client, async () => {
      await this.challengeRequestService.cancelChallenge(
        challengeCancelDto.challengeId,
        userId,
      );
    });
  }

  @SubscribeMessage(SocketEvents.SUBMIT_ANSWER)
  async submitAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() submitAnswerDto: SubmitAnswerDto,
  ) {
    await this.handleSocketAction(client, async () => {
      await this.battleService.submitAnswer(
        submitAnswerDto,
        client.data.user.userId,
      );
    });
  }

  @SubscribeMessage(SocketEvents.LEAVE_BATTLE)
  async leaveBattle(
    @ConnectedSocket() client: Socket,
    @MessageBody() leaveBattleDto: LeaveBattleDto,
  ) {
    await this.handleSocketAction(client, async () => {
      await this.battleService.leaveBattle(
        leaveBattleDto,
        client.data.user.userId,
      );
    });
  }

  private async handleSocketAction(
    client: Socket,
    action: () => Promise<void>,
  ): Promise<void> {
    try {
      await action();
    } catch (error) {
      const payload = this.normalizeSocketError(error);

      this.socketService.emitToUser(
        client.data.user.userId,
        SocketEvents.ERROR,
        payload,
      );
    }
  }

  private normalizeSocketError(error: unknown): { code: string; message: string } {
    if (error instanceof HttpException) {
      const response = error.getResponse();

      if (typeof response === 'object' && response !== null) {
        const code =
          'code' in response && typeof response.code === 'string'
            ? response.code
            : 'BAD_REQUEST';

        const message =
          'message' in response
            ? Array.isArray(response.message)
              ? response.message.join(', ')
              : String(response.message)
            : this.getErrorMessage(error);

        return {
          code,
          message,
        };
      }

      return {
        code: 'BAD_REQUEST',
        message: typeof response === 'string' ? response : this.getErrorMessage(error),
      };
    }

    return {
      code: 'INTERNAL_ERROR',
      message: 'Unexpected battle socket error.',
    };
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unexpected battle socket error.';
  }
}
