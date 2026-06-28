import api from '../../lib/axios';
import { searchCourses } from '../course/course.service';
import { getMyEnrollments } from '../enrollment/enrollment.service';
import type { LeaderboardEntry, CourseRankInfo } from '../../types/leaderboard/leaderboard.types';
import { getInitials } from '../../utils/leaderboard/leaderboardUtils';

// Mock course-specific leaderboard data
const MOCK_COURSE_LEADERBOARD_DATA: Record<number, LeaderboardEntry[]> = {
    1: [
        { rank: 1, userId: 3, fullName: 'Nguyễn Văn A', initials: 'NA', isCurrentUser: false, score: 85, time: 10, attempt: 5, pvp: 20, total: 120 },
        { rank: 2, userId: 6, fullName: 'Trần Văn B', initials: 'TB', isCurrentUser: false, score: 80, time: 8, attempt: 4, pvp: 10, total: 102 },
        { rank: 3, userId: 1, fullName: 'You', initials: 'JD', isCurrentUser: true, score: 78, time: 6, attempt: 5, pvp: 0, total: 89 },
        { rank: 4, userId: 8, fullName: 'Lê Thị Hoa', initials: 'LH', isCurrentUser: false, score: 75, time: 12, attempt: 3, pvp: 5, total: 83 },
        { rank: 5, userId: 12, fullName: 'Phạm Minh Đức', initials: 'PD', isCurrentUser: false, score: 72, time: 9, attempt: 6, pvp: 0, total: 72 },
        { rank: 6, userId: 5, fullName: 'Hoàng Thị Mai', initials: 'HM', isCurrentUser: false, score: 70, time: 15, attempt: 4, pvp: 0, total: 67 },
        { rank: 7, userId: 9, fullName: 'Vũ Quốc Hùng', initials: 'VH', isCurrentUser: false, score: 68, time: 11, attempt: 5, pvp: 0, total: 63 },
        { rank: 8, userId: 14, fullName: 'Đinh Thị Lan', initials: 'DL', isCurrentUser: false, score: 65, time: 14, attempt: 3, pvp: 0, total: 60 },
    ],
    2: [
        { rank: 1, userId: 12, fullName: 'Phạm Minh Đức', initials: 'PD', isCurrentUser: false, score: 92, time: 7, attempt: 3, pvp: 15, total: 134 },
        { rank: 2, userId: 6, fullName: 'Trần Văn B', initials: 'TB', isCurrentUser: false, score: 88, time: 9, attempt: 4, pvp: 10, total: 118 },
        { rank: 3, userId: 5, fullName: 'Hoàng Thị Mai', initials: 'HM', isCurrentUser: false, score: 84, time: 11, attempt: 3, pvp: 5, total: 104 },
        { rank: 4, userId: 8, fullName: 'Lê Thị Hoa', initials: 'LH', isCurrentUser: false, score: 81, time: 13, attempt: 5, pvp: 0, total: 95 },
        { rank: 5, userId: 3, fullName: 'Nguyễn Văn A', initials: 'NA', isCurrentUser: false, score: 79, time: 10, attempt: 4, pvp: 0, total: 88 },
        { rank: 6, userId: 9, fullName: 'Vũ Quốc Hùng', initials: 'VH', isCurrentUser: false, score: 76, time: 16, attempt: 3, pvp: 0, total: 79 },
        { rank: 7, userId: 1, fullName: 'You', initials: 'JD', isCurrentUser: true, score: 74, time: 8, attempt: 5, pvp: 0, total: 74 },
        { rank: 8, userId: 14, fullName: 'Đinh Thị Lan', initials: 'DL', isCurrentUser: false, score: 70, time: 18, attempt: 2, pvp: 0, total: 68 },
    ],
    3: [
        { rank: 1, userId: 9, fullName: 'Vũ Quốc Hùng', initials: 'VH', isCurrentUser: false, score: 96, time: 5, attempt: 2, pvp: 20, total: 141 },
        { rank: 2, userId: 3, fullName: 'Nguyễn Văn A', initials: 'NA', isCurrentUser: false, score: 91, time: 8, attempt: 3, pvp: 10, total: 120 },
        { rank: 3, userId: 6, fullName: 'Trần Văn B', initials: 'TB', isCurrentUser: false, score: 87, time: 10, attempt: 4, pvp: 5, total: 107 },
        { rank: 4, userId: 14, fullName: 'Đinh Thị Lan', initials: 'DL', isCurrentUser: false, score: 83, time: 12, attempt: 5, pvp: 0, total: 96 },
        { rank: 5, userId: 8, fullName: 'Lê Thị Hoa', initials: 'LH', isCurrentUser: false, score: 80, time: 14, attempt: 3, pvp: 0, total: 88 },
        { rank: 12, userId: 1, fullName: 'You', initials: 'JD', isCurrentUser: true, score: 65, time: 20, attempt: 4, pvp: 0, total: 60 },
    ],
    4: [
        { rank: 1, userId: 8, fullName: 'Lê Thị Hoa', initials: 'LH', isCurrentUser: false, score: 94, time: 6, attempt: 2, pvp: 25, total: 149 },
        { rank: 2, userId: 14, fullName: 'Đinh Thị Lan', initials: 'DL', isCurrentUser: false, score: 90, time: 9, attempt: 3, pvp: 15, total: 130 },
        { rank: 3, userId: 12, fullName: 'Phạm Minh Đức', initials: 'PD', isCurrentUser: false, score: 86, time: 11, attempt: 4, pvp: 5, total: 112 },
        { rank: 4, userId: 3, fullName: 'Nguyễn Văn A', initials: 'NA', isCurrentUser: false, score: 82, time: 13, attempt: 5, pvp: 0, total: 95 },
        { rank: 5, userId: 1, fullName: 'You', initials: 'JD', isCurrentUser: true, score: 80, time: 10, attempt: 3, pvp: 0, total: 90 },
        { rank: 6, userId: 6, fullName: 'Trần Văn B', initials: 'TB', isCurrentUser: false, score: 77, time: 15, attempt: 4, pvp: 0, total: 82 },
    ],
};

const MOCK_OVERALL_LEADERBOARD_DATA: (LeaderboardEntry & { coursesCompleted: number })[] = [
    { rank: 1, userId: 3, fullName: 'Nguyễn Văn A', initials: 'NA', isCurrentUser: false, score: 338, time: 41, attempt: 17, pvp: 45, total: 435, coursesCompleted: 4 },
    { rank: 2, userId: 6, fullName: 'Trần Văn B', initials: 'TB', isCurrentUser: false, score: 325, time: 42, attempt: 16, pvp: 25, total: 411, coursesCompleted: 4 },
    { rank: 3, userId: 12, fullName: 'Phạm Minh Đức', initials: 'PD', isCurrentUser: false, score: 312, time: 37, attempt: 14, pvp: 15, total: 390, coursesCompleted: 3 },
    { rank: 4, userId: 8, fullName: 'Lê Thị Hoa', initials: 'LH', isCurrentUser: false, score: 301, time: 44, attempt: 14, pvp: 10, total: 371, coursesCompleted: 4 },
    { rank: 5, userId: 1, fullName: 'You', initials: 'JD', isCurrentUser: true, score: 297, time: 34, attempt: 17, pvp: 0, total: 342, coursesCompleted: 4 },
    { rank: 6, userId: 9, fullName: 'Vũ Quốc Hùng', initials: 'VH', isCurrentUser: false, score: 280, time: 43, attempt: 14, pvp: 20, total: 338, coursesCompleted: 3 },
    { rank: 7, userId: 5, fullName: 'Hoàng Thị Mai', initials: 'HM', isCurrentUser: false, score: 272, time: 44, attempt: 12, pvp: 5, total: 320, coursesCompleted: 3 },
    { rank: 8, userId: 14, fullName: 'Đinh Thị Lan', initials: 'DL', isCurrentUser: false, score: 263, time: 58, attempt: 13, pvp: 0, total: 284, coursesCompleted: 4 },
];

export async function getLeaderboardCourses(currentUserId: number): Promise<CourseRankInfo[]> {
    try {
        // 1. Fetch all approved courses from backend
        const allCoursesRes = await searchCourses({ status: 'approved' });
        const backendCourses = allCoursesRes.data?.items || [];

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
            console.warn('Failed to load enrollments, using empty set:', err);
        }

        // 3. Map to CourseRankInfo format
        return backendCourses.map((c, index) => {
            const isEnrolled = enrolledIds.has(c.courseId);
            // Simulated Rank calculation or lookup
            // If the course doesn't have custom mock rank, assign a deterministic rank
            let yourRank = isEnrolled ? (index % 5) + 3 : 0;
            if (c.courseId === 1) yourRank = 3;
            else if (c.courseId === 2) yourRank = 7;
            else if (c.courseId === 3) yourRank = 12;
            else if (c.courseId === 4) yourRank = 5;

            return {
                courseId: c.courseId,
                title: c.title,
                enrolledCount: c.enrollmentCount || 50 + (c.courseId * 13) % 90,
                yourRank,
                isEnrolled
            };
        });
    } catch (err) {
        console.warn('Failed to fetch courses from API, fallback to mock:', err);
        return [
            { courseId: 1, title: 'Java Basic', enrolledCount: 120, yourRank: 3, isEnrolled: true },
            { courseId: 2, title: 'Spring Boot REST API', enrolledCount: 87, yourRank: 7, isEnrolled: true },
            { courseId: 3, title: 'Data Structures', enrolledCount: 64, yourRank: 12, isEnrolled: false },
            { courseId: 4, title: 'React & TypeScript', enrolledCount: 142, yourRank: 5, isEnrolled: true },
        ];
    }
}

export function getCourseLeaderboardData(courseId: number): LeaderboardEntry[] {
    // If not found in mock, return a default mock dataset
    return MOCK_COURSE_LEADERBOARD_DATA[courseId] || MOCK_COURSE_LEADERBOARD_DATA[1];
}

export function getOverallLeaderboardData(): (LeaderboardEntry & { coursesCompleted: number })[] {
    return MOCK_OVERALL_LEADERBOARD_DATA;
}
