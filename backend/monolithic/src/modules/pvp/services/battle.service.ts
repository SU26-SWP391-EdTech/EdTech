import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PvpMatchStatus } from 'src/common/enums/pvp-match-status.enum';
import { BattleConfig } from '../constants/battle-config.constant';
import { SocketEvents } from '../constants/socket-events.constant';
import { CreateBattleDto } from '../dto/battle/create-battle.dto';
import { LeaveBattleDto } from '../dto/battle/leave-battle.dto';
import { SubmitAnswerDto } from '../dto/battle/submit-answer.dto';
import {
  BattleQuestion,
  BattleState,
} from '../interfaces/battle-state.interface';
import { BattleSessionManager } from '../manager/battle-session.manager';
import { RoomManager } from '../manager/room.manager';
import { MatchRepository } from '../repositories/match.repository';
import { SocketService } from './socket.service';

import { ConnectionManager } from '../manager/connection.manager';
import { AssessmentType } from 'src/common/enums/assessment-type.enum';
import { Question } from 'src/modules/question/entities/question.entity';

@Injectable()
export class BattleService {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly battleSessionManager: BattleSessionManager,
    private readonly roomManager: RoomManager,
    private readonly socketService: SocketService,
    private readonly connectionManager: ConnectionManager,
  ) { }

  async createBattle(createBattleDto: CreateBattleDto) {
    const {
      assessmentId,
      challengerId,
      receiverId,
    } = createBattleDto;

    const assessment =
      await this.matchRepository.findAssessmentById(assessmentId);

    if (!assessment) {
      throw new NotFoundException({
        code: 'ASSESSMENT_NOT_FOUND',
        message: `Assessment ${assessmentId} not found.`,
      });
    }

    let questions: Question[];

    if (assessment.type === AssessmentType.PVP) {
      questions = await this.matchRepository.findQuestionsByCourseId(
        assessment.courseId,
      );

      if (questions.length === 0) {
        questions = await this.matchRepository.findAssessmentQuestions(1);
      }
    } else {
      questions =
        await this.matchRepository.findAssessmentQuestions(assessmentId);
    }

    if (questions.length === 0) {
      throw new BadRequestException({
        code: 'QUESTION_NOT_FOUND',
        message: 'Assessment does not contain any battle questions.',
      });
    }

    // Shuffle and select up to 5 questions for competitive PvP match
    const shuffledQuestions = [...questions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffledQuestions.slice(0, 5);

    const match = await this.matchRepository.createMatch({
      assessmentId,
      player1Id: challengerId,
      player2Id: receiverId,
      status: PvpMatchStatus.STARTED,
      player1Score: 0,
      player2Score: 0,
    });

    const room = this.roomManager.createRoom(
      match.matchId,
      challengerId,
      receiverId,
    );

    await this.socketService.joinUserToRoom(challengerId, room.roomId);
    await this.socketService.joinUserToRoom(receiverId, room.roomId);

    const battleQuestions: BattleQuestion[] = selectedQuestions.map((question) => ({
      questionId: question.questionId,
      content: question.content,
      type: question.type,
      position: question.position,
      points: Number(question.points),
      options: question.options.map((option) => ({
        optionId: option.optionId,
        content: option.content,
        position: option.position,
        isCorrect: option.isCorrect,
      })),
    }));

    const firstQuestion = battleQuestions[0];
    const battleState: BattleState = {
      matchId: match.matchId,
      assessmentId,
      roomId: room.roomId,
      player1Id: challengerId,
      player2Id: receiverId,
      currentQuestionIndex: 0,
      currentQuestionId: firstQuestion.questionId,
      player1Score: 0,
      player2Score: 0,
      playerAnswers: {},
      questionAnswers: {},
      isTransitioning: false,
      startedAt: new Date(),
      questions: battleQuestions,
    };

    this.battleSessionManager.createSession(battleState);

    this.socketService.emitToRoom(
      room.roomId,
      SocketEvents.BATTLE_STARTED,
      {
        matchId: match.matchId,
        assessmentId,
        roomId: room.roomId,
        totalQuestions: battleQuestions.length,
        challengerId,
        receiverId,
      },
    );

    await this.emitCurrentQuestion(match.matchId);
    return match;
  }

  async submitAnswer(
    submitAnswerDto: SubmitAnswerDto,
    userId: number,
  ): Promise<void> {
    const session = await this.getActiveSession(submitAnswerDto.matchId);
    this.ensurePlayerBelongsToMatch(session, userId);

    const currentQuestion = session.questions[session.currentQuestionIndex];

    if (submitAnswerDto.questionId !== currentQuestion.questionId) {
      throw new BadRequestException({
        code: 'QUESTION_TIMEOUT',
        message: 'The current question is no longer available.',
      });
    }

    if (session.playerAnswers[userId]) {
      return;
    }

    const selectedOption = currentQuestion.options.find(
      (option) => option.optionId === submitAnswerDto.optionId,
    );

    if (!selectedOption) {
      throw new BadRequestException({
        code: 'INVALID_OPTION',
        message: 'Submitted option does not belong to the current question.',
      });
    }

    const isCorrect = selectedOption.isCorrect;

    if (isCorrect) {
      if (userId === session.player1Id) {
        session.player1Score += Number(currentQuestion.points);
      } else {
        session.player2Score += Number(currentQuestion.points);
      }
    }

    this.battleSessionManager.savePlayerAnswer(
      session.matchId,
      {
        userId,
        optionId: selectedOption.optionId,
        isCorrect,
        answeredAt: new Date(),
      },
    );

    await this.matchRepository.updateScores(
      session.matchId,
      session.player1Score,
      session.player2Score,
    );

    this.socketService.emitToRoom(
      session.roomId,
      SocketEvents.SCORE_UPDATED,
      {
        matchId: session.matchId,
        player1Score: session.player1Score,
        player2Score: session.player2Score,
      },
    );

    const bothPlayersAnswered =
      Boolean(session.playerAnswers[session.player1Id]) &&
      Boolean(session.playerAnswers[session.player2Id]);

    if (!bothPlayersAnswered) {
      return;
    }

    if (session.isTransitioning) {
      return;
    }

    session.isTransitioning = true;

    try {
      await this.advanceBattle(session.matchId);
    } finally {
      const latestSession = this.battleSessionManager.getSession(session.matchId);

      if (latestSession) {
        latestSession.isTransitioning = false;
      }
    }
  }

  async leaveBattle(
    leaveBattleDto: LeaveBattleDto,
    userId: number,
  ): Promise<void> {
    const session = await this.getActiveSession(leaveBattleDto.matchId);
    this.ensurePlayerBelongsToMatch(session, userId);

    const winnerId =
      userId === session.player1Id
        ? session.player2Id
        : session.player1Id;

    this.socketService.emitToRoom(
      session.roomId,
      SocketEvents.OPPONENT_LEFT,
      {
        matchId: session.matchId,
        playerId: userId,
      },
    );

    await this.finishMatch(
      session,
      winnerId,
    );
  }

  private async emitCurrentQuestion(matchId: number): Promise<void> {
    const session = await this.getActiveSession(matchId);
    const question = session.questions[session.currentQuestionIndex];

    session.currentQuestionId = question.questionId;
    this.battleSessionManager.resetCurrentQuestionAnswers(matchId);

    this.socketService.emitToRoom(
      session.roomId,
      SocketEvents.QUESTION,
      {
        matchId: session.matchId,
        questionIndex: session.currentQuestionIndex + 1,
        question: {
          questionId: question.questionId,
          content: question.content,
          type: question.type,
          position: question.position,
          options: question.options.map((option) => ({
            optionId: option.optionId,
            content: option.content,
            position: option.position,
          })),
        },
      },
    );

    const questionTimer = setTimeout(async () => {
      try {
        await this.handleQuestionTimeout(matchId, question.questionId);
      } catch (error) {
        // Ignore stale timeout callbacks once battle has been cleaned up.
      }
    }, BattleConfig.QUESTION_TIME * 1000);

    this.battleSessionManager.setQuestionTimer(matchId, questionTimer);

    // If opponent is mock user (ID 12) and bot is not online, schedule the bot response
    if (session.player2Id === 12 && !this.connectionManager.isOnline(12)) {
      this.scheduleBotAnswer(session, 12, question);
    } else if (session.player1Id === 12 && !this.connectionManager.isOnline(12)) {
      this.scheduleBotAnswer(session, 12, question);
    }
  }

  private scheduleBotAnswer(session: BattleState, botId: number, question: BattleQuestion): void {
    const delayMs = 3000 + Math.random() * 3000; // 3 to 6 seconds delay
    setTimeout(async () => {
      try {
        const currentSession = this.battleSessionManager.getSession(session.matchId);
        if (!currentSession || currentSession.currentQuestionId !== question.questionId) {
          return;
        }
        if (currentSession.playerAnswers[botId]) {
          return;
        }

        const randomOption = question.options[Math.floor(Math.random() * question.options.length)];
        if (!randomOption) return;

        await this.submitAnswer(
          {
            matchId: session.matchId,
            questionId: question.questionId,
            optionId: randomOption.optionId,
          },
          botId,
        );
      } catch (error) {
        console.error('Failed to submit bot answer:', error.message);
      }
    }, delayMs);
  }

  private async handleQuestionTimeout(
    matchId: number,
    questionId: number,
  ): Promise<void> {
    const session = this.battleSessionManager.getSession(matchId);

    if (!session || session.currentQuestionId !== questionId) {
      return;
    }

    if (session.isTransitioning) {
      return;
    }

    session.isTransitioning = true;

    try {
      await this.advanceBattle(matchId);
    } finally {
      const latestSession = this.battleSessionManager.getSession(matchId);

      if (latestSession) {
        latestSession.isTransitioning = false;
      }
    }
  }

  private async advanceBattle(matchId: number): Promise<void> {
    const session = await this.getActiveSession(matchId);
    this.battleSessionManager.clearQuestionTimer(matchId);

    const hasNextQuestion =
      session.currentQuestionIndex < session.questions.length - 1;

    if (!hasNextQuestion) {
      await this.finishMatch(
        session,
        this.determineWinnerId(session),
      );
      return;
    }

    this.battleSessionManager.advanceQuestion(matchId);

    const nextSession = await this.getActiveSession(matchId);

    this.socketService.emitToRoom(
      nextSession.roomId,
      SocketEvents.NEXT_QUESTION,
      {
        matchId: nextSession.matchId,
        questionIndex: nextSession.currentQuestionIndex + 1,
      },
    );

    await this.emitCurrentQuestion(matchId);
  }

  private async finishMatch(
    session: BattleState,
    winnerId: number | null,
  ): Promise<void> {
    this.battleSessionManager.clearQuestionTimer(session.matchId);

    await this.matchRepository.completeMatch(
      session.matchId,
      session.player1Score,
      session.player2Score,
      winnerId,
    );

    this.socketService.emitToRoom(
      session.roomId,
      SocketEvents.GAME_OVER,
      {
        matchId: session.matchId,
        winnerId,
        player1Score: session.player1Score,
        player2Score: session.player2Score,
      },
    );

    const player1CorrectAnswers = this.countCorrectAnswers(
      session,
      session.player1Id,
    );
    const player2CorrectAnswers = this.countCorrectAnswers(
      session,
      session.player2Id,
    );
    const totalQuestions = session.questions.length;

    this.socketService.emitToRoom(
      session.roomId,
      SocketEvents.MATCH_RESULT,
      {
        matchId: session.matchId,
        winner: winnerId,
        loser:
          winnerId === null
            ? null
            : winnerId === session.player1Id
              ? session.player2Id
              : session.player1Id,
        totalQuestions,
        correctAnswers: {
          player1: player1CorrectAnswers,
          player2: player2CorrectAnswers,
        },
        accuracy: {
          player1: totalQuestions === 0 ? 0 : player1CorrectAnswers / totalQuestions,
          player2: totalQuestions === 0 ? 0 : player2CorrectAnswers / totalQuestions,
        },
        battleDuration: Math.round(
          (Date.now() - session.startedAt.getTime()) / 1000,
        ),
      },
    );

    await this.socketService.leaveUserFromRoom(
      session.player1Id,
      session.roomId,
    );
    await this.socketService.leaveUserFromRoom(
      session.player2Id,
      session.roomId,
    );

    this.roomManager.removeRoom(session.matchId);
    this.battleSessionManager.removeSession(session.matchId);
  }

  private async getActiveSession(matchId: number): Promise<BattleState> {
    const session = this.battleSessionManager.getSession(matchId);

    if (session) {
      return session;
    }

    const match = await this.matchRepository.findById(matchId);

    if (!match) {
      throw new NotFoundException({
        code: 'MATCH_NOT_FOUND',
        message: `Match ${matchId} not found.`,
      });
    }

    if (match.status !== PvpMatchStatus.STARTED) {
      throw new BadRequestException({
        code: 'MATCH_FINISHED',
        message: 'This battle has already finished.',
      });
    }

    throw new NotFoundException({
      code: 'MATCH_NOT_FOUND',
      message: `Battle session for match ${matchId} is not available.`,
    });
  }

  private ensurePlayerBelongsToMatch(
    session: BattleState,
    userId: number,
  ): void {
    if (session.player1Id === userId || session.player2Id === userId) {
      return;
    }

    throw new BadRequestException({
      code: 'PLAYER_NOT_IN_MATCH',
      message: 'The current player does not belong to this match.',
    });
  }

  private determineWinnerId(session: BattleState): number | null {
    if (session.player1Score === session.player2Score) {
      return null;
    }

    return session.player1Score > session.player2Score
      ? session.player1Id
      : session.player2Id;
  }

  private countCorrectAnswers(
    session: BattleState,
    userId: number,
  ): number {
    return Object.values(session.questionAnswers).reduce(
      (total, questionAnswerMap) => {
        if (questionAnswerMap[userId]?.isCorrect) {
          return total + 1;
        }

        return total;
      },
      0,
    );
  }
}
