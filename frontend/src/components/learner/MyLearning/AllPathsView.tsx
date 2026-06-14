import { ArrowLeft } from 'lucide-react';
import PathCard from './PathCard';
import type { LearningPath } from '../../../services/learning-path/learning-path.service';
import type { Enrollment } from '../../../services/enrollment/enrollment.service';

interface AllPathsViewProps {
    learningPaths: LearningPath[];
    completedCourses: Enrollment[];
    enrollments: Enrollment[];
    getPathAccent: (level: string) => string;
    onBack: () => void;
    onPathClick: (pathId: number) => void;
}

export default function AllPathsView({
    learningPaths,
    completedCourses,
    enrollments,
    getPathAccent,
    onBack,
    onPathClick
}: AllPathsViewProps) {
    return (
        <div className="space-y-6">
            <button
                onClick={onBack}
                className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#E11D48] transition-colors"
                style={{ fontWeight: 500 }}
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </button>

            <div>
                <h1 className="text-[32px] text-[#111827] mb-1.5 font-bold animate-fade-in" style={{ letterSpacing: '-0.02em' }}>
                    My Learning Paths
                </h1>
                <p className="text-[#6B7280] text-[15px]">
                    All learning paths you have registered to learn.
                </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
                {learningPaths.map((path) => {
                    const pathCourses = path.learningPathCourses || [];
                    const completedInPath = pathCourses.filter(pc =>
                        completedCourses.some(e => e.course.courseId === pc.courseId)
                    ).length;
                    const progress = pathCourses.length > 0
                        ? Math.round((completedInPath / pathCourses.length) * 100)
                        : 0;
                    const remainingHours = pathCourses
                        .filter(pc => !completedCourses.some(e => e.course.courseId === pc.courseId))
                        .reduce((sum, pc) => sum + (pc.course?.duration || 0), 0);

                    const isAnyStarted = pathCourses.some(pc =>
                        enrollments.some(e => e.course.courseId === pc.courseId)
                    );
                    const status = progress === 100 ? 'completed' : (isAnyStarted ? 'in-progress' : 'not-started');

                    return (
                        <PathCard
                            key={path.learningPathId}
                            title={path.title}
                            description={path.description || 'Curated roadmap to guide your learning.'}
                            progress={progress}
                            coursesDone={completedInPath}
                            coursesTotal={pathCourses.length}
                            remaining={`${remainingHours}h`}
                            difficulty={path.level.charAt(0).toUpperCase() + path.level.slice(1)}
                            status={status}
                            accent={getPathAccent(path.level)}
                            onClick={() => onPathClick(path.learningPathId)}
                        />
                    );
                })}
            </div>
        </div>
    );
}
