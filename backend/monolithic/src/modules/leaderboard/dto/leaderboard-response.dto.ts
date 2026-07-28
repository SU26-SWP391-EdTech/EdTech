export interface LeaderboardResponse {
  rank: number;
  userId: number;
  fullName: string;
  avatar: string | null;
  score: number;
  time: number;
  attempt: number;
  pvp: number;
  coursesCompleted?: number;
  totalPoint: number;
}