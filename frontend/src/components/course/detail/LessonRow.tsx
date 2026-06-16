import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Video, BookOpen, ClipboardList, FileText } from 'lucide-react';
import type { Lesson, LessonType } from '../../types/course/course-detail.types';
import { StatusIcon } from './StatusIcon';

interface LessonRowProps {
  lesson: Lesson;
  courseId: number;
}

export function LessonRow({ lesson, courseId }: LessonRowProps) {
  const navigate = useNavigate();
  const isVideo = lesson.type === 'Video' || lesson.type === 'Video & Reading';
  const isReading = lesson.type === 'Reading' || lesson.type === 'Video & Reading';
  const isQuiz = lesson.type === 'Quiz';
  const isAssignment = lesson.type === 'Assignment';




  const isCurrent = lesson.status === 'current';
  const isLocked = lesson.status === 'locked';

  return (
    <div
      onClick={() => {
        if (isLocked) {
          return;
        }
        navigate(`/learner/lesson?courseId=${courseId}&lessonId=${lesson.id}`);
      }}
      className={`flex items-center gap-3 px-4 py-2.5 border-t border-[#F1F5F9] transition-colors ${
        isCurrent ? 'bg-[#FEF2F2]' : 'hover:bg-[#FAFAFA]'
      } ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <StatusIcon status={lesson.status} />
      <span className="flex items-center gap-2 text-[11px]" style={{ fontWeight: 600, textTransform: 'uppercase' }}>
        {isVideo && (
          <span className="flex items-center gap-1" style={{ color: '#E11D48' }}>
            <Video className="w-3.5 h-3.5" />
            Video
          </span>
        )}
        {isReading && (
          <span className="flex items-center gap-1" style={{ color: '#6366F1' }}>
            <BookOpen className="w-3.5 h-3.5" />
            Reading
          </span>
        )}
        {isQuiz && (
          <span className="flex items-center gap-1" style={{ color: '#F59E0B' }}>
            <ClipboardList className="w-3.5 h-3.5" />
            Quiz
          </span>
        )}
        {isAssignment && (
          <span className="flex items-center gap-1" style={{ color: '#10B981' }}>
            <FileText className="w-3.5 h-3.5" />
            Assignment
          </span>
        )}

      </span>
      <span className={`text-sm flex-1 ${isCurrent ? 'text-[#E11D48]' : 'text-[#111827]'}`} style={{ fontWeight: isCurrent ? 600 : 500 }}>
        {lesson.title}
      </span>
      {lesson.preview && (
        <span className="px-1.5 py-0.5 bg-[#ECFDF5] text-[#047857] rounded text-[10px]" style={{ fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Preview</span>
      )}
      <span className="text-xs text-[#6B7280] flex items-center gap-1 w-16 justify-end">
        <Clock className="w-3 h-3" />
        {lesson.duration}
      </span>
    </div>
  );
}
