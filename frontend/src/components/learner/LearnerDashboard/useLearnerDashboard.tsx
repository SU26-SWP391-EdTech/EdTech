import React, { useEffect, useState } from 'react';
import { Flame, Clock, Target, GraduationCap } from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.stores';
import type { Enrollment } from '../../../services/enrollment/enrollment.service';
import type { LearningPath } from '../../../services/learning-path/learning-path.service';
import type { NodeState } from './RoadmapNode';

export function useLearnerDashboard() {
    const user = useAuthStore((state) => state.user);
    const [profile, setProfile] = useState<any>(null);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);

    useEffect(() => {
        const loadDashboardData = async () => {
            const { MOCK_PROFILE, MOCK_ENROLLMENTS, MOCK_LEARNING_PATHS } = await import('../../../db/data');
            setProfile(MOCK_PROFILE);
            setLearningPaths(MOCK_LEARNING_PATHS);

            const storedEnrollments = sessionStorage.getItem('explore_cache_enrollments');
            setEnrollments(storedEnrollments ? JSON.parse(storedEnrollments) : MOCK_ENROLLMENTS);
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
            sparkData: [0, 2, 3, 5, 4, 8, profile?.streakCount ?? 0],
        },
        {
            id: 'completed',
            label: 'Courses Done',
            value: (profile?.completedCourses ?? 0).toString(),
            sub: 'Completed courses',
            icon: React.createElement(GraduationCap, { className: "w-5 h-5" }),
            color: '#10B981',
            bg: '#F0FDF4',
            sparkData: [0, 0, 0, 0, 0, 0, profile?.completedCourses ?? 0],
        },
        {
            id: 'hours',
            label: 'Hours Learned',
            value: (profile?.learningHours ?? 0).toString(),
            sub: 'Total study time',
            icon: React.createElement(Clock, { className: "w-5 h-5" }),
            color: '#3B82F6',
            bg: '#EFF6FF',
            sparkData: [0, 15, 30, 45, 60, 90, profile?.learningHours ?? 0],
        },
        {
            id: 'paths',
            label: 'Learning Paths Enrolled',
            value: (profile?.enrolledPaths ?? 0).toString(),
            sub: 'Roadmaps active',
            icon: React.createElement(Target, { className: "w-5 h-5" }),
            color: '#E11D48',
            bg: '#FFF1F4',
            sparkData: [0, 0, 0, 1, 1, 1, profile?.enrolledPaths ?? 0],
        },
    ];

    // Continue Learning courses mapping
    const continueCourses = enrollments
        .filter(e => e.status === 'active' && e.progress < 100)
        .map((enrollment, idx) => {
            const parentPath = learningPaths.find(p =>
                p.learningPathCourses?.some(lpc => lpc.courseId === enrollment.course.courseId)
            );
            const pathTitle = parentPath ? parentPath.title : 'Individual Course';
            const total = enrollment.course.totalLessons || 10;
            const completed = Math.round(total * (enrollment.progress / 100));
            const remaining = total - completed;
            const remainingHours = Math.round((enrollment.course.duration || 10) * (1 - enrollment.progress / 100));

            const gradients = [
                'linear-gradient(135deg, #1E40AF 0%, #7C3AED 100%)',
                'linear-gradient(135deg, #065F46 0%, #0EA5E9 100%)',
                'linear-gradient(135deg, #9D174D 0%, #F59E0B 100%)',
            ];

            return {
                id: enrollment.enrollmentId,
                title: enrollment.course.title,
                path: pathTitle,
                progress: enrollment.progress,
                lesson: `Lesson ${completed + 1} of ${total}`,
                remaining,
                duration: `${remainingHours}h left`,
                gradient: gradients[idx % gradients.length],
                initials: enrollment.course.title.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
            };
        });

    // Roadmap active path & nodes mapping
    const activePath = learningPaths.find(path =>
        path.learningPathCourses?.some(pc =>
            enrollments.some(e => e.course.courseId === pc.courseId)
        )
    ) || learningPaths[0] || null;

    const pathCourses = [...(activePath?.learningPathCourses || [])].sort((a, b) => a.order - b.order);

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
        completedCount
    };
}
