import { ThumbsUp, MessageSquare } from 'lucide-react';
import type { Question } from '../../../types/lesson/lesson.types';

interface DiscussionPanelProps {
  questionText: string;
  onQuestionTextChange: (text: string) => void;
  onPostQuestion: () => void;
  questions: Question[];
}

export function DiscussionPanel({
  questionText,
  onQuestionTextChange,
  onPostQuestion,
  questions
}: DiscussionPanelProps) {
  return (
    <div className="space-y-5">
      {/* Ask question */}
      <div className="space-y-3">
        <textarea
          value={questionText}
          onChange={e => onQuestionTextChange(e.target.value)}
          placeholder="Ask a question about this lesson..."
          rows={2}
          className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48] resize-none"
        />
        <div className="flex justify-end">
          <button 
            className="px-4 py-1.5 bg-[#E11D48] text-white rounded-lg text-xs hover:bg-[#BE123C] transition-colors disabled:opacity-40" 
            disabled={!questionText.trim()} 
            style={{ fontWeight: 500 }} 
            onClick={onPostQuestion}
          >
            Post Question
          </button>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-3">
        <p className="text-xs text-[#9CA3AF]" style={{ fontWeight: 500 }}>RECENT QUESTIONS</p>
        {questions.map(q => (
          <div key={q.id} className="p-4 border border-[#E5E7EB] rounded-xl hover:border-[#E11D48]/30 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E11D48] flex items-center justify-center text-white text-xs flex-shrink-0" style={{ fontWeight: 600 }}>
                {q.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-[#111827]" style={{ fontWeight: 500 }}>{q.author}</span>
                  <span className="text-xs text-[#9CA3AF]">{q.time}</span>
                </div>
                <p className="text-sm text-[#374151]">{q.text}</p>
                <div className="flex items-center gap-4 mt-2">
                  <button className="flex items-center gap-1 text-xs text-[#9CA3AF] hover:text-[#E11D48] transition-colors">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {q.upvotes}
                  </button>
                  <button className="flex items-center gap-1 text-xs text-[#9CA3AF] hover:text-[#374151] transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {q.answers} answers
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
