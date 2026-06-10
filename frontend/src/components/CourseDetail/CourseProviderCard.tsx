import { BadgeCheck, Star, BookOpen, Users } from 'lucide-react';
import { Card } from './Card';

interface CourseProviderCardProps {
  instructorName: string;
  instructorAvatar: string;
  onViewProfile?: () => void;
}

export function CourseProviderCard({ instructorName, instructorAvatar, onViewProfile }: CourseProviderCardProps) {
  const bio = instructorName === 'Tech Mentors'
    ? 'A team of senior backend engineers from leading tech companies, focused on shipping practical, production-grade backend curriculums.'
    : 'Professional educator providing high-quality courses and instructional resources on the EdTech Platform.';

  return (
    <Card title="Course Provider">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center text-white text-lg flex-shrink-0" style={{ fontWeight: 700 }}>
          {instructorAvatar}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-base text-[#111827]" style={{ fontWeight: 600 }}>{instructorName}</h3>
            <BadgeCheck className="w-4 h-4 text-[#E11D48]" />
          </div>
          <p className="text-xs text-[#6B7280] mb-2">Course Provider · Verified instructor</p>
          <p className="text-sm text-[#374151] mb-3">
            {bio}
          </p>
          <div className="flex items-center gap-5 text-xs text-[#6B7280]">
            <span className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
              <span className="text-[#111827]" style={{ fontWeight: 600 }}>4.9</span> instructor rating
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="text-[#111827]" style={{ fontWeight: 600 }}>14</span> courses
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span className="text-[#111827]" style={{ fontWeight: 600 }}>18,420</span> learners
            </span>
          </div>
        </div>
        <button 
          onClick={onViewProfile} 
          className="px-3.5 py-2 bg-white border border-[#E5E7EB] text-[#111827] rounded-lg text-sm hover:bg-[#F8FAFC] transition-colors" 
          style={{ fontWeight: 500 }}
        >
          View Profile
        </button>
      </div>
    </Card>
  );
}
