import { Zap, Award } from 'lucide-react';

interface QuestionItem {
  question: string;
  options: string[];
  answer: string;
}

interface LessonQuizProps {
  quizQuestionsList: QuestionItem[];
  quizAnswers: Record<number, string>;
  quizSubmitted: boolean;
  quizScore: number;
  onSelectAnswer: (questionIndex: number, option: string) => void;
  onSubmitQuiz: (questions: QuestionItem[]) => void;
  onRetakeQuiz: () => void;
}

export function LessonQuiz({
  quizQuestionsList,
  quizAnswers,
  quizSubmitted,
  quizScore,
  onSelectAnswer,
  onSubmitQuiz,
  onRetakeQuiz
}: LessonQuizProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
        <div className="flex items-center gap-2 text-amber-600">
          <Zap className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-wider">Module Practice Quiz</span>
        </div>
        <span className="text-xs text-[#6B7280] font-medium">
          {quizQuestionsList.length} Questions
        </span>
      </div>

      {!quizSubmitted ? (
        <div className="space-y-6">
          {quizQuestionsList.map((q, idx) => (
            <div key={idx} className="space-y-2.5">
              <p className="text-sm text-[#111827]" style={{ fontWeight: 600 }}>
                {idx + 1}. {q.question}
              </p>
              <div className="grid grid-cols-1 gap-2 pl-2">
                {q.options.map((option) => (
                  <label key={option} className="flex items-center gap-2.5 p-3 rounded-xl border border-[#E5E7EB] hover:bg-[#F8FAFC] cursor-pointer text-sm transition-colors">
                    <input
                      type="radio"
                      name={`q-${idx}`}
                      value={option}
                      checked={quizAnswers[idx] === option}
                      onChange={() => onSelectAnswer(idx, option)}
                      className="text-[#E11D48] focus:ring-[#E11D48]"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={() => onSubmitQuiz(quizQuestionsList)}
            disabled={Object.keys(quizAnswers).length < quizQuestionsList.length}
            className="w-full py-3 bg-[#E11D48] text-white rounded-xl text-sm font-bold hover:bg-[#BE123C] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submit Answers
          </button>
        </div>
      ) : (
        <div className="space-y-6 text-center py-4">
          <div className="w-16 h-16 bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0] rounded-2xl flex items-center justify-center mx-auto mb-2">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#111827]">Quiz Completed!</h3>
            <p className="text-sm text-[#6B7280] mt-1">
              You scored <span className="font-bold text-[#10B981]">{quizScore}</span> out of {quizQuestionsList.length} correct.
            </p>
          </div>

          <div className="space-y-4 text-left mt-6">
            {quizQuestionsList.map((q, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC]">
                <p className="text-xs font-bold text-[#6B7280] uppercase">Question {idx + 1}</p>
                <p className="text-sm font-semibold text-[#111827] mt-1">{q.question}</p>
                <div className="mt-2.5 space-y-1 text-xs">
                  <p className="text-[#6B7280]">
                    Your answer: <span className={quizAnswers[idx] === q.answer ? 'text-[#10B981] font-semibold' : 'text-[#E11D48] font-semibold'}>{quizAnswers[idx]}</span>
                  </p>
                  {quizAnswers[idx] !== q.answer && (
                    <p className="text-[#10B981] font-semibold">
                      Correct answer: {q.answer}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onRetakeQuiz}
            className="w-full py-2.5 bg-white border border-[#E5E7EB] text-[#374151] rounded-xl text-sm hover:bg-[#F8FAFC] transition-colors font-medium"
          >
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
}
