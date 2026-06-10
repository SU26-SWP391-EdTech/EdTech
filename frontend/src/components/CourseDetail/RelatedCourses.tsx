import { BookOpen, Star } from 'lucide-react';
import type { Course } from '../../services/course/course.service';
import { Card } from './Card';

interface RelatedCoursesProps {
  courses: Course[];
  onViewCourse?: (courseId: number) => void;
}

const gradients = [
  'from-[#F59E0B] to-[#D97706]',
  'from-[#10B981] to-[#059669]',
  'from-[#6366F1] to-[#4F46E5]',
];

export function RelatedCourses({ courses, onViewCourse }: RelatedCoursesProps) {
  return (
    <Card title="Related Courses" subtitle="Other learners also enrolled in">
      <div className="grid grid-cols-3 gap-4">
        {courses.map((course, index) => {
          const diff = course.duration && course.duration > 15
            ? 'Advanced'
            : course.duration && course.duration > 10
              ? 'Intermediate'
              : 'Beginner';

          return (
            <div key={course.courseId} className="border border-[#E5E7EB] rounded-xl overflow-hidden hover:shadow-md hover:border-[#E11D48]/20 transition-all">
              <div className={`aspect-video bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center`}>
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="p-3">
                <h3 className="text-sm text-[#111827] mb-1 line-clamp-1" style={{ fontWeight: 600 }}>{course.title}</h3>
                <div className="flex items-center gap-2 text-[11px] text-[#6B7280] mb-2">
                  <span className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                    <span className="text-[#111827]" style={{ fontWeight: 600 }}>4.8</span>
                  </span>
                  <span>-</span>
                  <span>{course.duration}h</span>
                  <span>-</span>
                  <span>{diff}</span>
                </div>
                <button
                  onClick={() => onViewCourse?.(course.courseId)}
                  className="w-full py-1.5 bg-[#111827] text-white rounded-lg text-xs hover:bg-black transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  View Course
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
