import { PlayerAnswerState } from './player-session.interface';

export interface BattleQuestionOption {
  optionId: number;
  content: string;
  position: number;
  isCorrect: boolean;
}

export interface BattleQuestion {
  questionId: number;
  content: string;
  type: string;
  position: number;
  points: number;
  options: BattleQuestionOption[];
}

export interface BattleState {
  matchId: number;
  assessmentId: number;
  roomId: string;
  player1Id: number;
  player2Id: number;
  currentQuestionIndex: number;
  currentQuestionId: number;
  player1Score: number;
  player2Score: number;
  playerAnswers: Record<number, PlayerAnswerState>;
  questionAnswers: Record<number, Record<number, PlayerAnswerState>>;
  isTransitioning: boolean;
  startedAt: Date;
  questionTimer?: NodeJS.Timeout;
  questions: BattleQuestion[];
}