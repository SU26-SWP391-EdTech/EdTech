import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../stores/auth/auth.stores';
import toast from 'react-hot-toast';
import {
    getLeaderboardCourses,
    getCourseLeaderboardData,
    getOverallLeaderboardData
} from '../../services/leaderboard/leaderboard.service';
import type { LeaderboardEntry, CourseRankInfo, LeaderboardTab, EnrollFilter } from '../../types/leaderboard/leaderboard.types';

export function useLeaderboard() {
    const user = useAuthStore(state => state.user);
    const currentUserId = user?.userId || 1;

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

                const overallData = JSON.parse(JSON.stringify(getOverallLeaderboardData()));
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
        setChallengeModalEntry(null);

        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1500)),
            {
                loading: `Challenging ${targetName}...`,
                success: () => {
                    // Update PvP score in Local State and LocalStorage
                    const currentSaved = localStorage.getItem(`leaderboard_pvp_points_user_${currentUserId}`);
                    const newPvpPoints = (currentSaved ? Number(currentSaved) : 0) + 5;
                    localStorage.setItem(`leaderboard_pvp_points_user_${currentUserId}`, String(newPvpPoints));

                    // Mutate Local Course Leaderboard
                    setCourseLeaderboards(prev => {
                        const copy = { ...prev };
                        const list = copy[selectedCourseId] ? [...copy[selectedCourseId]] : [];
                        const meIndex = list.findIndex(e => e.isCurrentUser);
                        if (meIndex !== -1) {
                            list[meIndex] = {
                                ...list[meIndex],
                                pvp: list[meIndex].pvp + 5,
                                total: list[meIndex].total + 5
                            };
                            list.sort((a, b) => b.total - a.total);
                            list.forEach((e, idx) => { e.rank = idx + 1; });
                            copy[selectedCourseId] = list;
                        }
                        return copy;
                    });

                    // Mutate Local Overall Leaderboard
                    setOverallLeaderboard(prev => {
                        const list = [...prev];
                        const meIndex = list.findIndex(e => e.isCurrentUser);
                        if (meIndex !== -1) {
                            list[meIndex] = {
                                ...list[meIndex],
                                pvp: list[meIndex].pvp + 5,
                                total: list[meIndex].total + 5
                            };
                            list.sort((a, b) => b.total - a.total);
                            list.forEach((e, idx) => { e.rank = idx + 1; });
                        }
                        return list;
                    });

                    // Update local courses list rank too if matching courseId
                    setCourses(prev => {
                        return prev.map(c => {
                            if (c.courseId === selectedCourseId) {
                                const list = courseLeaderboards[selectedCourseId] || [];
                                const meIndex = list.findIndex(e => e.isCurrentUser);
                                return {
                                    ...c,
                                    yourRank: meIndex !== -1 ? list[meIndex].rank : c.yourRank
                                };
                            }
                            return c;
                        });
                    });

                    return `You won the challenge against ${targetName}! +5 PvP pts.`;
                },
                error: 'Failed to send challenge.',
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
