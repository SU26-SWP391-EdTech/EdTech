import api from '../../lib/axios';
import { searchCourses } from '../course/course.service';
import { getMyEnrollments } from '../enrollment/enrollment.service';
import type { LeaderboardEntry, CourseRankInfo } from '../../types/leaderboard/leaderboard.types';

export async function getLeaderboardCourses(currentUserId: number): Promise<CourseRankInfo[]> {
    try {
        // 1. Fetch all approved courses from backend
        const allCoursesRes = await searchCourses({ status: 'approved' });
        const backendCourses = allCoursesRes.data?.items || [];

        if (!backendCourses || backendCourses.length === 0) {
            throw new Error('No approved courses found in backend');
        }

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

        // 3. Map and filter to CourseRankInfo format (only enrolled courses or owned by provider)
        return backendCourses
            .map((c) => {
                const isEnrolled = enrolledIds.has(c.courseId) || c.user?.userId === currentUserId;
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
        const data = response.data || [];
        
        return data.map((item: any) => {
            const names = item.fullName ? item.fullName.trim().split(/\s+/) : [];
            const initials = names.length > 0 
                ? (names.length === 1 ? names[0].slice(0, 2) : names[0][0] + names[names.length - 1][0])
                : '??';

            return {
                rank: item.rank,
                userId: item.userId,
                fullName: item.fullName || 'Unknown Learner',
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
        const data = response.data || [];
        
        return data.map((item: any) => {
            const names = item.fullName ? item.fullName.trim().split(/\s+/) : [];
            const initials = names.length > 0 
                ? (names.length === 1 ? names[0].slice(0, 2) : names[0][0] + names[names.length - 1][0])
                : '??';

            return {
                rank: item.rank,
                userId: item.userId,
                fullName: item.fullName || 'Unknown Learner',
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
