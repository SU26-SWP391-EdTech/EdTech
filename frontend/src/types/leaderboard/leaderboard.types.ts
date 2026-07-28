export interface LeaderboardEntry {
    rank: number;
    userId: number;
    fullName: string;
    avatarUrl?: string;
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

export interface LeaderboardRule {
    ruleId: number;
    scoreWeight: number;
    timeWeight: number;
    attemptWeight: number;
    course?: {
        courseId: number;
        title?: string;
    };
}

export interface CreateLeaderboardRulePayload {
    scoreWeight: number;
    timeWeight: number;
    attemptWeight: number;
}

export interface UpdateLeaderboardRulePayload {
    scoreWeight?: number;
    timeWeight?: number;
    attemptWeight?: number;
}

