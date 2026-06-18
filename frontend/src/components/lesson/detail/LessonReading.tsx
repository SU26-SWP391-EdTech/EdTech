import { BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Lesson } from '../../../types/lesson/lesson.types';

interface LessonReadingProps {
  activeLesson: Lesson;
}

export function LessonReading({ activeLesson }: LessonReadingProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
        <div className="flex items-center gap-2 text-indigo-600">
          <BookOpen className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-wider">Assigned Reading</span>
        </div>
      </div>
      <div className="prose prose-slate max-w-none">
        <h2 className="text-lg font-bold text-[#111827]">{activeLesson.title}</h2>
        {activeLesson.content ? (
          <div className="text-sm text-[#374151] leading-relaxed mt-2 whitespace-pre-wrap font-sans">
            {activeLesson.content}
          </div>
        ) : (
          <>
            <p className="text-sm text-[#374151] leading-relaxed mt-2">
              Welcome to the reading resources for this lesson. Below is a comprehensive guide to understanding the underlying concepts of this topic. Make sure to review the core terms and code configurations.
            </p>
            <h3 className="text-sm font-bold text-[#111827] mt-4">Key Takeaways</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-sm text-[#374151]">
              <li>Ensure you understand the architectural role of each component layer.</li>
              <li>Follow code standard design patterns for clean code formatting.</li>
              <li>Always sanitize user-submitted requests to avoid security bypass.</li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
