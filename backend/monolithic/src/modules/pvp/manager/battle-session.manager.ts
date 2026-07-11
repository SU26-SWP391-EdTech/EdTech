import { Injectable } from '@nestjs/common';
import { BattleState } from '../interfaces/battle-state.interface';
import { PlayerAnswerState } from '../interfaces/player-session.interface';

@Injectable()
export class BattleSessionManager {
  private readonly sessions = new Map<number, BattleState>();

  createSession(state: BattleState): BattleState {
    this.sessions.set(state.matchId, state);
    return state;
  }

  getSession(matchId: number): BattleState | undefined {
    return this.sessions.get(matchId);
  }

  removeSession(matchId: number): void {
    const session = this.sessions.get(matchId);

    if (session?.questionTimer) {
      clearTimeout(session.questionTimer);
    }

    this.sessions.delete(matchId);
  }

  setQuestionTimer(matchId: number, timer: NodeJS.Timeout): void {
    const session = this.sessions.get(matchId);

    if (!session) {
      clearTimeout(timer);
      return;
    }

    if (session.questionTimer) {
      clearTimeout(session.questionTimer);
    }

    session.questionTimer = timer;
  }

  clearQuestionTimer(matchId: number): void {
    const session = this.sessions.get(matchId);

    if (!session?.questionTimer) {
      return;
    }

    clearTimeout(session.questionTimer);
    session.questionTimer = undefined;
  }

  savePlayerAnswer(matchId: number, answer: PlayerAnswerState): BattleState | undefined {
    const session = this.sessions.get(matchId);

    if (!session) {
      return undefined;
    }

    session.playerAnswers[answer.userId] = answer;

    if (!session.questionAnswers[session.currentQuestionId]) {
      session.questionAnswers[session.currentQuestionId] = {};
    }

    session.questionAnswers[session.currentQuestionId][answer.userId] = answer;
    return session;
  }

  resetCurrentQuestionAnswers(matchId: number): BattleState | undefined {
    const session = this.sessions.get(matchId);

    if (!session) {
      return undefined;
    }

    session.playerAnswers = {};
    return session;
  }

  advanceQuestion(matchId: number): BattleState | undefined {
    const session = this.sessions.get(matchId);

    if (!session) {
      return undefined;
    }

    session.currentQuestionIndex += 1;
    session.playerAnswers = {};
    return session;
  }
}
