export interface PlayerAnswerState {
  userId: number;
  optionId?: number;
  optionIds?: number[];
  isCorrect: boolean;
  answeredAt: Date;
}
