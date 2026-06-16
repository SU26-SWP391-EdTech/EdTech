import { BadgeCheck, BookOpen } from 'lucide-react';
import { Card } from './Card';

interface CourseProviderCardProps {
  instructorName: string;
  instructorAvatar: string;
  instructorAvatarUrl?: string;
  expertise?: string;
  bio?: string;
  rating?: number;
  courseCount?: number;
}

export function CourseProviderCard({
  instructorName,
  instructorAvatar,
  instructorAvatarUrl,
  expertise,
  bio,
  rating = 4.8,
  courseCount = 0,
}: CourseProviderCardProps) {
  return (
    <Card title="Course Provider">
      <div className="flex items-start gap-4">
        {instructorAvatarUrl ? (
          <img src={instructorAvatarUrl} alt={instructorName} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center text-white text-lg flex-shrink-0" style={{ fontWeight: 700 }}>
            {instructorAvatar}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-base text-[#111827]" style={{ fontWeight: 600 }}>{instructorName}</h3>
            <BadgeCheck className="w-4 h-4 text-[#E11D48]" />
          </div>
          <p className="text-xs text-[#6B7280] mb-2">
            {expertise || 'Course Provider'} - Verified instructor
          </p>

          <div className="flex items-center gap-5 text-xs text-[#6B7280]">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="text-[#111827]" style={{ fontWeight: 600 }}>{courseCount}</span> courses
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
