import { FileText, Upload, X, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface LessonAssignmentProps {
  assignmentSubmitted: boolean;
  assignmentText: string;
  assignmentFile: File | null;
  onAssignmentTextChange: (text: string) => void;
  onAssignmentFileChange: (file: File | null) => void;
  onSubmitAssignment: () => void;
  onResubmitAssignment: () => void;
}

export function LessonAssignment({
  assignmentSubmitted,
  assignmentText,
  assignmentFile,
  onAssignmentTextChange,
  onAssignmentFileChange,
  onSubmitAssignment,
  onResubmitAssignment
}: LessonAssignmentProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
        <div className="flex items-center gap-2 text-emerald-600">
          <FileText className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-wider">Lesson Assignment</span>
        </div>
        <span className="text-xs text-[#6B7280] font-medium">
          Submit in PDF, ZIP, or Text
        </span>
      </div>

      {!assignmentSubmitted ? (
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-bold text-[#111827]">Assignment Objectives</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed mt-1">
              Implement the code design described in the lesson objectives, test the output result, and copy your code or upload a submission ZIP file below.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block">Submission text (or paste your code)</label>
            <textarea
              value={assignmentText}
              onChange={(e) => onAssignmentTextChange(e.target.value)}
              placeholder="Paste your source code or write assignment summaries here..."
              rows={6}
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl text-sm focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48]"
            />
          </div>

          <label className="block cursor-pointer rounded-xl border-2 border-dashed border-[#E5E7EB] p-6 text-center transition-colors hover:bg-[#F8FAFC]">
            <input
              type="file"
              className="hidden"
              accept=".pdf,.zip,.txt,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                onAssignmentFileChange(file);
                if (file) {
                  toast.success(`Selected ${file.name}`);
                }
              }}
            />
            <Upload className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#374151]">Upload zip, pdf, doc, or txt file</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Maximum size: 25MB</p>
          </label>

          {assignmentFile && (
            <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-[#111827]" style={{ fontWeight: 600 }}>{assignmentFile.name}</p>
                <p className="text-xs text-[#9CA3AF]">{Math.max(1, Math.round(assignmentFile.size / 1024))} KB</p>
              </div>
              <button
                type="button"
                onClick={() => onAssignmentFileChange(null)}
                className="rounded-lg p-1.5 text-[#9CA3AF] transition-colors hover:bg-white hover:text-[#E11D48]"
                aria-label="Remove selected assignment file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <button
            onClick={onSubmitAssignment}
            disabled={!assignmentText.trim() && !assignmentFile}
            className="w-full py-3 bg-[#E11D48] text-white rounded-xl text-sm font-bold hover:bg-[#BE123C] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submit Assignment
          </button>
        </div>
      ) : (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0] rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#111827]">Assignment Submitted!</h3>
            <p className="text-sm text-[#6B7280] mt-1">
              Your submission is pending grading by the instructor. You can retake or update this assignment anytime.
            </p>
          </div>
          <button
            onClick={onResubmitAssignment}
            className="px-6 py-2 bg-white border border-[#E5E7EB] text-[#374151] rounded-lg text-sm hover:bg-[#F8FAFC] transition-colors font-medium"
          >
            Resubmit Assignment
          </button>
        </div>
      )}
    </div>
  );
}
