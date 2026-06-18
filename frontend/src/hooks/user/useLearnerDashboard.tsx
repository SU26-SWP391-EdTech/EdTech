import React, { useEffect, useState } from 'react';
import { Flame, Clock, GraduationCap } from 'lucide-react';
import { useAuthStore } from '../../stores/auth/auth.stores';
import { getMyEnrollments, type Enrollment } from '../../services/enrollment/enrollment.service';
import { getLearningPaths, type LearningPath } from '../../services/learning-path/learning-path.service';
import type { NodeState } from '../../components/User/dashboard/learner/RoadmapNode';
import { getLearnerProfile } from '../../services/learner/learner.services';

export function useLearnerDashboard() {
    const user = useAuthStore((state) => state.user);
    const [profile, setProfile] = useState<any>(null);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!user) return;
            try {
                setIsLoading(true);
                const [profileData, enrollmentsData, pathsData] = await Promise.all([
                    getLearnerProfile(user.userId),
                    getMyEnrollments(),
                    getLearningPaths()
                ]);

                const completedCount = enrollmentsData.filter(
                    e => e.status === 'completed' || e.progress === 100
                ).length;

                const totalHours = enrollmentsData.reduce((acc, curr) => {
                    const duration = curr.course.duration || 10;
                    return acc + Math.round(duration * (curr.progress / 100));
                }, 0);

                setProfile({
                    ...profileData,
                    streakCount: (profileData as any).streakCount ?? 0,
                    completedCourses: completedCount,
                    learningHours: totalHours,
                });

                setEnrollments(enrollmentsData);
                setLearningPaths(pathsData);
            } catch (error) {
                console.error("Failed to load dashboard data from API:", error);
                setProfile(null);
                setEnrollments([]);
                setLearningPaths([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadDashboardData();
    }, [user]);

    // Summary stats based on profile & enrollments
    const activeStats = [
        {
            id: 'streak',
            label: 'Day Streak',
            value: (profile?.streakCount ?? 0).toString(),
            sub: 'Active daily learning',
            icon: React.createElement(Flame, { className: "w-5 h-5" }),
            color: '#F59E0B',
            bg: '#FFF7ED',
            sparkData: (profile?.streakCount ?? 0) === 0 ? [0, 0, 0, 0, 0, 0, 0] : [0, 2, 3, 5, 4, 8, profile?.streakCount ?? 0],
        },
        {
            id: 'completed',
            label: 'Courses Done',
            value: (profile?.completedCourses ?? 0).toString(),
            sub: 'Completed courses',
            icon: React.createElement(GraduationCap, { className: "w-5 h-5" }),
            color: '#10B981',
            bg: '#F0FDF4',
            sparkData: (profile?.completedCourses ?? 0) === 0 ? [0, 0, 0, 0, 0, 0, 0] : [0, 0, 0, 0, 0, 0, profile?.completedCourses ?? 0],
        },
        {
            id: 'hours',
            label: 'Hours Learned',
            value: (profile?.learningHours ?? 0).toString(),
            sub: 'Total study time',
            icon: React.createElement(Clock, { className: "w-5 h-5" }),
            color: '#3B82F6',
            bg: '#EFF6FF',
            sparkData: (profile?.learningHours ?? 0) === 0 ? [0, 0, 0, 0, 0, 0, 0] : [0, 15, 30, 45, 60, 90, profile?.learningHours ?? 0],
        },
    ];

    // Continue Learning courses mapping
    const continueCourses = enrollments
        .filter(e => e.status === 'active' && e.progress < 100)
        .slice(0, 3)
        .map((enrollment, idx) => {
            const parentPath = learningPaths.find(p =>
                p.learningPathCourses?.some(lpc => lpc.courseId === enrollment.course.courseId)
            );
            const pathTitle = parentPath ? parentPath.title : 'Individual Course';

            const gradients = [
                'linear-gradient(135deg, #1E40AF 0%, #7C3AED 100%)',
                'linear-gradient(135deg, #065F46 0%, #0EA5E9 100%)',
                'linear-gradient(135deg, #9D174D 0%, #F59E0B 100%)',
            ];

            return {
                id: enrollment.enrollmentId,
                courseId: enrollment.course.courseId,
                title: enrollment.course.title,
                path: pathTitle,
                progress: enrollment.progress,
                gradient: gradients[idx % gradients.length],
                initials: enrollment.course.title.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
            };
        });

    // Roadmap active path & nodes mapping
    const enrolledPathIds = learningPaths.filter(path => {
        const pathCourses = path.learningPathCourses || [];
        if (pathCourses.length === 0) return false;
        return pathCourses.some(pc =>
            enrollments.some(e => e.course?.courseId === pc.courseId)
        );
    }).map(p => p.learningPathId);

    const activePath = learningPaths.find(path =>
        enrolledPathIds.includes(path.learningPathId)
    ) || null;

    const pathCourses = activePath ? [...(activePath.learningPathCourses || [])].sort((a, b) => a.position - b.position) : [];

    let foundCurrentOrUpcoming = false;
    const roadmapNodes = pathCourses.map((lpc, idx) => {
        const enrollment = enrollments.find(e => e.course.courseId === lpc.courseId);

        let state: NodeState = 'locked';
        let progress: number | undefined = undefined;

        if (enrollment) {
            if (enrollment.status === 'completed' || enrollment.progress === 100) {
                state = 'completed';
                progress = 100;
            } else {
                state = 'current';
                progress = enrollment.progress;
                foundCurrentOrUpcoming = true;
            }
        } else {
            if (!foundCurrentOrUpcoming) {
                state = 'upcoming';
                foundCurrentOrUpcoming = true;
            } else {
                state = 'locked';
            }
        }

        return {
            id: lpc.courseId,
            label: lpc.course?.title || `Course ${idx + 1}`,
            state,
            course: lpc.course?.description || 'Curated course in this path',
            progress,
        };
    });

    const completedCount = roadmapNodes.filter(n => n.state === 'completed').length;

    return {
        profile,
        activeStats,
        continueCourses,
        activePath,
        roadmapNodes,
        completedCount,
        enrollments,
        isLoading
    };
}
