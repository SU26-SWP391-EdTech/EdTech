import api from '../../lib/axios';
import { searchCourses } from '../course/course.service';
import { getMyEnrollments } from '../enrollment/enrollment.service';
import type {
    LeaderboardEntry,
    CourseRankInfo,
    LeaderboardRule,
    CreateLeaderboardRulePayload,
    UpdateLeaderboardRulePayload
} from '../../types/leaderboard/leaderboard.types';

export async function getLeaderboardCourses(currentUserId: number, userRole?: string): Promise<CourseRankInfo[]> {
    try {
        // 1. Fetch all approved courses from backend
        const allCoursesRes = await searchCourses({ status: 'approved' });
        const backendCourses = allCoursesRes.data?.items || [];

        if (!backendCourses || backendCourses.length === 0) {
            return [];
        }

        // Check if user is academic manager or admin (they can manage/view all courses)
        const isAcademicOrAdmin = userRole === 'ACADEMIC_MANAGER' || userRole === 'ADMIN' || userRole === 'academic_manager' || userRole === 'admin';

        // 2. Fetch current user's enrollments to determine isEnrolled
        let enrolledIds = new Set<number>();
        try {
            const enrollments = await getMyEnrollments();
            enrollments.forEach(e => {
                if (e.course?.courseId) {
                    enrolledIds.add(e.course.courseId);
                }
            });
        } catch (err) {
            console.warn('Failed to load enrollments:', err);
        }

        // 3. Map and filter to CourseRankInfo format
        return backendCourses
            .map((c) => {
                const isEnrolled = isAcademicOrAdmin || enrolledIds.has(c.courseId) || c.user?.userId === currentUserId;
                return {
                    courseId: c.courseId,
                    title: c.title,
                    enrolledCount: c.enrollmentCount || 0,
                    yourRank: 0,
                    isEnrolled
                };
            })
            .filter((c) => c.isEnrolled);
    } catch (err) {
        console.warn('Failed to fetch courses from API:', err);
        return [];
    }
}

export async function getCourseLeaderboardData(courseId: number, currentUserId: number): Promise<LeaderboardEntry[]> {
    try {
        const response = await api.get(`/leaderboard/course/${courseId}`);
        const rawData = response.data;
        const data = Array.isArray(rawData)
            ? rawData
            : (Array.isArray(rawData?.data) ? rawData.data : (Array.isArray(rawData?.items) ? rawData.items : []));
        
        return data.map((item: any) => {
            const names = item.fullName ? item.fullName.trim().split(/\s+/) : [];
            const initials = names.length > 0 
                ? (names.length === 1 ? names[0].slice(0, 2) : names[0][0] + names[names.length - 1][0])
                : '??';

            return {
                rank: item.rank,
                userId: item.userId,
                fullName: item.fullName || 'Unknown Learner',
                avatarUrl: item.avatarUrl || item.avatar || item.profilePicture || item.user?.avatarUrl || item.user?.avatar || undefined,
                initials: initials.toUpperCase(),
                isCurrentUser: item.userId === currentUserId,
                score: item.score || 0,
                time: item.time || 0,
                attempt: item.attempt || 0,
                pvp: item.pvp || 0,
                total: Math.round(item.totalPoint || 0)
            };
        });
    } catch (err) {
        console.warn(`Failed to fetch course ${courseId} leaderboard from API:`, err);
        return [];
    }
}

export async function getOverallLeaderboardData(currentUserId: number): Promise<(LeaderboardEntry & { coursesCompleted: number })[]> {
    try {
        const response = await api.get('/leaderboard');
        const rawData = response.data;
        const data = Array.isArray(rawData)
            ? rawData
            : (Array.isArray(rawData?.data) ? rawData.data : (Array.isArray(rawData?.items) ? rawData.items : []));
        
        return data.map((item: any) => {
            const names = item.fullName ? item.fullName.trim().split(/\s+/) : [];
            const initials = names.length > 0 
                ? (names.length === 1 ? names[0].slice(0, 2) : names[0][0] + names[names.length - 1][0])
                : '??';

            return {
                rank: item.rank,
                userId: item.userId,
                fullName: item.fullName || 'Unknown Learner',
                avatarUrl: item.avatarUrl || item.avatar || item.profilePicture || item.user?.avatarUrl || item.user?.avatar || undefined,
                initials: initials.toUpperCase(),
                isCurrentUser: item.userId === currentUserId,
                score: item.score || 0,
                time: item.time || 0,
                attempt: item.attempt || 0,
                pvp: item.pvp || 0,
                total: Math.round(item.totalPoint || 0),
                coursesCompleted: item.coursesCompleted || 0
            };
        });
    } catch (err) {
        console.warn('Failed to fetch overall leaderboard from API:', err);
        return [];
    }
}

/**
 * Fetch leaderboard rule for a specific course (Academic Manager / Provider)
 */
export async function getLeaderboardRule(courseId: number): Promise<LeaderboardRule | null> {
    try {
        const response = await api.get(`/leaderboard/courses/${courseId}/leaderboard-rule`);
        return response.data;
    } catch (err: any) {
        if (err?.response?.status === 404) {
            return null;
        }
        console.warn(`Failed to fetch leaderboard rule for course ${courseId}:`, err);
        return null;
    }
}

/**
 * Create leaderboard rule for a specific course (Academic Manager)
 */
export async function createLeaderboardRule(
    courseId: number,
    payload: CreateLeaderboardRulePayload
): Promise<LeaderboardRule> {
    const response = await api.post(`/leaderboard/course/${courseId}`, payload);
    return response.data;
}

/**
 * Update leaderboard rule for a specific course (Academic Manager)
 */
export async function updateLeaderboardRule(
    courseId: number,
    payload: UpdateLeaderboardRulePayload
): Promise<LeaderboardRule> {
    const response = await api.patch(`/leaderboard/courses/${courseId}/leaderboard-rule`, payload);
    return response.data;
}

