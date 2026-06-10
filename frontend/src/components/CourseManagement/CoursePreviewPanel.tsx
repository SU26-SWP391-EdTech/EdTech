import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, PlayCircle, Users, Globe } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { StarRating } from './StarRating';
import type { Course } from './types';

interface CoursePreviewPanelProps {
  course: Course;
  onViewDetails?: () => void;
}

export function CoursePreviewPanel({ course, onViewDetails }: CoursePreviewPanelProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      const basePath = location.pathname.endsWith('/courses')
        ? `${location.pathname}/detail`
        : location.pathname.endsWith('/pending-courses')
          ? `${location.pathname.replace('/pending-courses', '/courses')}/detail`
          : `${location.pathname}/courses/detail`;
      navigate(basePath);
    }
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
      {/* Thumbnail */}
      <div className="relative">
        <div className="w-full h-36 flex items-center justify-center overflow-hidden" style={{ background: course.thumbBg }}>
          {course.thumbnailUrl ? (
            <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 opacity-80">
              {course.thumbIcon}
              <span className="text-white/70 text-xs" style={{ fontWeight: 500 }}>{course.category}</span>
            </div>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <StatusBadge status={course.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-[#111827] mb-1" style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.3 }}>{course.title}</h3>
        <p className="text-xs text-[#6B7280] mb-4" style={{ lineHeight: 1.5 }}>{course.description}</p>

        {/* Provider */}
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#F3F4F6]">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: course.providerColor, fontSize: '10px', fontWeight: 700 }}>
            {course.providerInitials}
          </div>
          <div>
            <p className="text-xs text-[#111827]" style={{ fontWeight: 500 }}>{course.provider}</p>
            <p className="text-[10px] text-[#9CA3AF]">Course Provider</p>
          </div>
          <StarRating rating={course.rating} />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { icon: <Clock className="w-3.5 h-3.5 text-[#9CA3AF]" />, label: 'Duration', val: course.duration },
            { icon: <PlayCircle className="w-3.5 h-3.5 text-[#9CA3AF]" />, label: 'Lessons', val: `${course.lessons} lessons` },
            { icon: <Users className="w-3.5 h-3.5 text-[#9CA3AF]" />, label: 'Students', val: course.students > 0 ? course.students.toLocaleString() : '—' },
            { icon: <Globe className="w-3.5 h-3.5 text-[#9CA3AF]" />, label: 'Language', val: course.language },
          ].map(s => (
            <div key={s.label} className="bg-[#F8FAFC] border border-[#F3F4F6] rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 mb-1">{s.icon}<span className="text-[10px] text-[#9CA3AF]">{s.label}</span></div>
              <p className="text-xs text-[#111827]" style={{ fontWeight: 600 }}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Progress */}
        {course.progress > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[#6B7280]">Completion rate</span>
              <span className="text-xs text-[#E11D48]" style={{ fontWeight: 600 }}>{course.progress}%</span>
            </div>
            <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
              <div className="h-full bg-[#E11D48] rounded-full transition-all" style={{ width: `${course.progress}%` }} />
            </div>
          </div>
        )}

        {/* View Details Button */}
        <button
          onClick={handleViewDetails}
          className="w-full mt-2 py-2 border border-[#E5E7EB] text-[#374151] rounded-xl text-xs hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors flex items-center justify-center gap-1.5"
          style={{ fontWeight: 600 }}
        >
          View Course Details
        </button>

      </div>
    </div>
  );
}
