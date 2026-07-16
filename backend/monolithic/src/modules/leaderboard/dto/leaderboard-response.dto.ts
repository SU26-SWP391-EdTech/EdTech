export interface LeaderboardResponse {
    rank: number;
    userId: number;
    fullName: string;
    avatar: string | null;
    totalPoint: number;
  }