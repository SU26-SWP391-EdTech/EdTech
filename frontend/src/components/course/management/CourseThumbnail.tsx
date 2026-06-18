import type { Course } from '../../../types/course/course-management.types';

export function CourseThumbnail({ course, size = 'sm' }: { course: Course; size?: 'sm' | 'lg' }) {
  const dim = size === 'sm' ? 'w-12 h-9 rounded-lg' : 'w-full h-36 rounded-xl';
  return (
    <div
      className={`${dim} flex items-center justify-center shrink-0 overflow-hidden`}
      style={{ background: course.thumbBg }}
    >
      {course.thumbnailUrl ? (
        <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
      ) : (
        course.thumbIcon
      )}
    </div>
  );
}
