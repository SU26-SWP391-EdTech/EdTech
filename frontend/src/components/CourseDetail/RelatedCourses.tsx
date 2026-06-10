import { BookOpen, Star } from 'lucide-react';
import { Card } from './Card';

interface RelatedCourse {
  title: string;
  diff: string;
  duration: string;
  rating: number;
  thumb: string;
}

interface RelatedCoursesProps {
  onViewCourse?: (title: string) => void;
}

export function RelatedCourses({ onViewCourse }: RelatedCoursesProps) {
  const relatedList: RelatedCourse[] = [
    { title: 'Java Basic for Beginners', diff: 'Beginner', duration: '8h 30m', rating: 4.8, thumb: 'from-[#F59E0B] to-[#D97706]' },
    { title: 'SQL Database Fundamentals', diff: 'Beginner', duration: '6h 15m', rating: 4.7, thumb: 'from-[#10B981] to-[#059669]' },
    { title: 'Authentication with JWT', diff: 'Intermediate', duration: '5h', rating: 4.9, thumb: 'from-[#6366F1] to-[#4F46E5]' },
  ];

  return (
    <Card title="Related Courses" subtitle="Other learners also enrolled in">
      <div className="grid grid-cols-3 gap-4">
        {relatedList.map((c) => (
          <div key={c.title} className="border border-[#E5E7EB] rounded-xl overflow-hidden hover:shadow-md hover:border-[#E11D48]/20 transition-all">
            <div className={`aspect-video bg-gradient-to-br ${c.thumb} flex items-center justify-center`}>
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div className="p-3">
              <h3 className="text-sm text-[#111827] mb-1 line-clamp-1" style={{ fontWeight: 600 }}>{c.title}</h3>
              <div className="flex items-center gap-2 text-[11px] text-[#6B7280] mb-2">
                <span className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                  <span className="text-[#111827]" style={{ fontWeight: 600 }}>{c.rating}</span>
                </span>
                <span>·</span>
                <span>{c.duration}</span>
                <span>·</span>
                <span>{c.diff}</span>
              </div>
              <button 
                onClick={() => onViewCourse?.(c.title)}
                className="w-full py-1.5 bg-[#111827] text-white rounded-lg text-xs hover:bg-black transition-colors" 
                style={{ fontWeight: 500 }}
              >
                View Course
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
