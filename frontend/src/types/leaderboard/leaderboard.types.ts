export interface LeaderboardEntry {
    rank: number;
    userId: number;
    fullName: string;
    initials: string;
    isCurrentUser: boolean;
    score: number;
    time: number;
    attempt: number;
    pvp: number;
    total: number;
    coursesCompleted?: number;
}

export interface CourseRankInfo {
    courseId: number;
    title: string;
    enrolledCount: number;
    yourRank: number;
    isEnrolled: boolean;
}

export type LeaderboardTab = 'course' | 'overall';
export type EnrollFilter = 'all' | 'enrolled' | 'not_enrolled';
