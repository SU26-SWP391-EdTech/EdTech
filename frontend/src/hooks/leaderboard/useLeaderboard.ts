import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../stores/auth/auth.stores';
import toast from 'react-hot-toast';
import {
    getLeaderboardCourses,
    getCourseLeaderboardData,
    getOverallLeaderboardData
} from '../../services/leaderboard/leaderboard.service';
import type { LeaderboardEntry, CourseRankInfo, LeaderboardTab, EnrollFilter } from '../../types/leaderboard/leaderboard.types';
import { usePvp } from '../../context/PvpContext';
import api from '../../lib/axios';

export function useLeaderboard() {
    const user = useAuthStore(state => state.user);
    const currentUserId = user?.userId || 1;
    const { sendChallenge } = usePvp();

    // UI and Filtering states
    const [tab, setTab] = useState<LeaderboardTab>('course');
    const [selectedCourseId, setSelectedCourseId] = useState<number>(1);
    const [search, setSearch] = useState<string>('');
    const [showCourseDropdown, setShowCourseDropdown] = useState<boolean>(false);
    const [enrollFilter, setEnrollFilter] = useState<EnrollFilter>('all');
    const [challengeModalEntry, setChallengeModalEntry] = useState<LeaderboardEntry | null>(null);

    // Data states
    const [courses, setCourses] = useState<CourseRankInfo[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Leaderboard state matrices to support interactive real-time updates
    const [courseLeaderboards, setCourseLeaderboards] = useState<Record<number, LeaderboardEntry[]>>({});
    const [overallLeaderboard, setOverallLeaderboard] = useState<(LeaderboardEntry & { coursesCompleted: number })[]>([]);

    // Fetch initial list of courses and enrollments
    useEffect(() => {
        async function initData() {
            try {
                setIsLoading(true);
                const fetchedCourses = await getLeaderboardCourses(currentUserId);
                setCourses(fetchedCourses);

                // Set initial course if there are any enrolled courses
                const firstEnrolled = fetchedCourses.find(c => c.isEnrolled);
                if (firstEnrolled) {
                    setSelectedCourseId(firstEnrolled.courseId);
                } else if (fetchedCourses.length > 0) {
                    setSelectedCourseId(fetchedCourses[0].courseId);
                }

                // Hydrate leaderboard states
                const courseDataMap: Record<number, LeaderboardEntry[]> = {};
                fetchedCourses.forEach(c => {
                    // Clone mock arrays so we can mutate safely in local state
                    courseDataMap[c.courseId] = JSON.parse(JSON.stringify(getCourseLeaderboardData(c.courseId)));
                });
                setCourseLeaderboards(courseDataMap);

                const overallData = JSON.parse(JSON.stringify(await getOverallLeaderboardData()));
                setOverallLeaderboard(overallData);
            } catch (err) {
                console.error('Failed to load leaderboard data:', err);
                toast.error('Failed to retrieve leaderboard data.');
            } finally {
                setIsLoading(false);
            }
        }
        initData();
    }, [currentUserId]);

    // Load custom PvP points from localStorage if they exist to persist between page loads
    useEffect(() => {
        const savedPoints = localStorage.getItem(`leaderboard_pvp_points_user_${currentUserId}`);
        if (savedPoints) {
            const pvpBonus = Number(savedPoints);
            if (pvpBonus > 0) {
                // Update local state arrays with saved pvpBonus points
                setCourseLeaderboards(prev => {
                    const copy = { ...prev };
                    Object.keys(copy).forEach(cId => {
                        const list = [...copy[Number(cId)]];
                        const meIndex = list.findIndex(e => e.isCurrentUser);
                        if (meIndex !== -1) {
                            list[meIndex] = {
                                ...list[meIndex],
                                pvp: pvpBonus,
                                total: list[meIndex].total + pvpBonus - list[meIndex].pvp
                            };
                            // Re-sort and re-rank
                            list.sort((a, b) => b.total - a.total);
                            list.forEach((e, idx) => { e.rank = idx + 1; });
                            copy[Number(cId)] = list;
                        }
                    });
                    return copy;
                });

                setOverallLeaderboard(prev => {
                    const list = [...prev];
                    const meIndex = list.findIndex(e => e.isCurrentUser);
                    if (meIndex !== -1) {
                        list[meIndex] = {
                            ...list[meIndex],
                            pvp: pvpBonus,
                            total: list[meIndex].total + pvpBonus - list[meIndex].pvp
                        };
                        list.sort((a, b) => b.total - a.total);
                        list.forEach((e, idx) => { e.rank = idx + 1; });
                    }
                    return list;
                });
            }
        }
    }, [currentUserId, isLoading]);

    // Sync selectedCourseId when enrollFilter changes to ensure a course matching the filter is selected
    useEffect(() => {
        if (courses.length === 0) return;

        const currentCourse = courses.find(c => c.courseId === selectedCourseId);
        if (!currentCourse) return;

        if (enrollFilter === 'enrolled' && !currentCourse.isEnrolled) {
            const firstEnrolled = courses.find(c => c.isEnrolled);
            if (firstEnrolled) {
                setSelectedCourseId(firstEnrolled.courseId);
            }
        } else if (enrollFilter === 'not_enrolled' && currentCourse.isEnrolled) {
            const firstUnenrolled = courses.find(c => !c.isEnrolled);
            if (firstUnenrolled) {
                setSelectedCourseId(firstUnenrolled.courseId);
            }
        }
    }, [enrollFilter, courses, selectedCourseId]);

    // Filtering logic for the courses dropdown
    const filteredCoursesDropdown = useMemo(() => {
        return courses.filter(c => {
            if (enrollFilter === 'enrolled') return c.isEnrolled;
            if (enrollFilter === 'not_enrolled') return !c.isEnrolled;
            return true;
        });
    }, [courses, enrollFilter]);

    const selectedCourse = useMemo(() => {
        return courses.find(c => c.courseId === selectedCourseId) || {
            courseId: selectedCourseId,
            title: 'Select Course',
            enrolledCount: 0,
            yourRank: 0,
            isEnrolled: false
        };
    }, [courses, selectedCourseId]);

    const activeList = useMemo(() => {
        if (tab === 'course') {
            return courseLeaderboards[selectedCourseId] || [];
        }
        return overallLeaderboard;
    }, [tab, selectedCourseId, courseLeaderboards, overallLeaderboard]);

    // Apply search filter
    const searchedList = useMemo(() => {
        return activeList.filter(e =>
            e.fullName.toLowerCase().includes(search.toLowerCase())
        );
    }, [activeList, search]);

    const currentUserCourseEntry = useMemo(() => {
        const list = courseLeaderboards[selectedCourseId] || [];
        return list.find(e => e.isCurrentUser);
    }, [courseLeaderboards, selectedCourseId]);

    const currentUserOverallEntry = useMemo(() => {
        return overallLeaderboard.find(e => e.isCurrentUser);
    }, [overallLeaderboard]);

    // Handlers
    const handleSendChallenge = () => {
        if (!challengeModalEntry) return;

        const targetName = challengeModalEntry.fullName;
        const receiverId = challengeModalEntry.userId;
        setChallengeModalEntry(null);

        toast.promise(
            (async () => {
                let pvpAssessmentId = 1; // Fallback to 1 (seeded)
                try {
                    const res = await api.get(`/assessment/courses/${selectedCourseId}/pvp`);
                    if (res.data && res.data.length > 0) {
                        pvpAssessmentId = res.data[0].assessmentId;
                    }
                } catch (err) {
                    console.warn('Failed to fetch PvP assessment for course, using default ID: 1', err);
                }

                // Send the socket event
                sendChallenge(receiverId, pvpAssessmentId);
            })(),
            {
                loading: `Challenging ${targetName}...`,
                success: `Challenge invitation sent to ${targetName}!`,
                error: `Could not send challenge to ${targetName}.`
            }
        );
    };

    return {
        tab,
        setTab,
        selectedCourseId,
        setSelectedCourseId,
        search,
        setSearch,
        showCourseDropdown,
        setShowCourseDropdown,
        enrollFilter,
        setEnrollFilter,
        challengeModalEntry,
        setChallengeModalEntry,
        courses,
        filteredCoursesDropdown,
        selectedCourse,
        searchedList,
        currentUserCourseEntry,
        currentUserOverallEntry,
        isLoading,
        handleSendChallenge
    };
}
