import SectionHeader from './SectionHeader';
import PathCard from './PathCard';
import type { Enrollment } from '../../../services/enrollment/enrollment.service';
import type { LearningPath } from '../../../services/learning-path/learning-path.service';

interface MyLearningPathsSectionProps {
    learningPaths: LearningPath[];
    completedCourses: Enrollment[];
    enrollments: Enrollment[];
    getPathAccent: (level: string) => string;
    onViewAll: () => void;
    onPathClick: (pathId: number) => void;
}

export default function MyLearningPathsSection({
    learningPaths,
    completedCourses,
    enrollments,
    getPathAccent,
    onViewAll,
    onPathClick,
}: MyLearningPathsSectionProps) {
    return (
        <section>
            <SectionHeader
                title="My Learning Paths"
                subtitle={`${learningPaths.length} paths available`}
                actionLabel="View all"
                onAction={onViewAll}
            />
            <div className="grid grid-cols-3 gap-4">
                {learningPaths.slice(0, 3).map((path) => {
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
        </section>
    );
}
