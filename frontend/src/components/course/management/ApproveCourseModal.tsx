import { AlertTriangle, BookOpen, CheckCircle2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  courseTitle: string;
  providerName: string;
  lessonCount: number;
  isApproving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
export function ApproveCourseModal({
  isOpen,
  courseTitle,
  providerName,
  lessonCount,
  isApproving,
  onClose,
  onConfirm,
}: Props) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => !isApproving && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        </div>
        <h2 className="mb-1 text-lg font-semibold text-[#111827]">
          Approve this course?
        </h2>
        <p className="mb-4 text-sm text-[#6B7280]">
          The course will be published and available to learners immediately.
        </p>
        <div className="mb-4 space-y-2 rounded-xl bg-[#F8FAFC] p-4 text-sm">
          <p className="font-medium text-[#111827]">{courseTitle}</p>
          <p className="text-[#6B7280]">Provider: {providerName}</p>
          <p className="flex items-center gap-2 text-[#374151]">
            <BookOpen className="h-4 w-4" />
            {lessonCount} lessons
          </p>
        </div>
        <div className="mb-5 flex gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Approval publishes the current course content.
        </div>
        <div className="flex justify-end gap-2">
          <button
            disabled={isApproving}
            onClick={onClose}
            className="rounded-lg border border-[#D1D5DB] px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            disabled={isApproving}
            onClick={onConfirm}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {isApproving ? "Approving…" : "Approve Course"}
          </button>
        </div>
      </div>
    </div>
  );
}
