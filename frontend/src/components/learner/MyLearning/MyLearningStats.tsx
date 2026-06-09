import { BookOpen, Route, CheckCircle2 } from 'lucide-react';
import StatCard from './StatCard';

interface MyLearningStatsProps {
    inProgressCoursesCount: number;
    pathsEnrolledCount: number;
    completedCoursesCount: number;
}

export default function MyLearningStats({
    inProgressCoursesCount,
    pathsEnrolledCount,
    completedCoursesCount,
}: MyLearningStatsProps) {
    return (
        <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard 
                icon={<BookOpen className="w-4 h-4" />} 
                label="Courses in Progress" 
                value={inProgressCoursesCount.toString()} 
                delta={`${inProgressCoursesCount} active`} 
                color="#E11D48" 
                tint="#FEF2F2" 
            />
            <StatCard 
                icon={<Route className="w-4 h-4" />} 
                label="Learning Paths Enrolled" 
                value={pathsEnrolledCount.toString()} 
                delta={`${pathsEnrolledCount} active`} 
                color="#F59E0B" 
                tint="#FFFBEB" 
            />
            <StatCard 
                icon={<CheckCircle2 className="w-4 h-4" />} 
                label="Completed Courses" 
                value={completedCoursesCount.toString()} 
                delta={`${completedCoursesCount} done`} 
                color="#10B981" 
                tint="#ECFDF5" 
            />
        </div>
    );
}
