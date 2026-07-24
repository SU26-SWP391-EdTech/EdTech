import { AlertTriangle, BookOpen, Send } from "lucide-react";
import { Overlay } from "./Overlay";

interface SubmitModalProps {
  courseTitle: string;
  lessonCount: number;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onAddLesson: () => void;
}
export function SubmitModal({
  courseTitle,
  lessonCount,
  isSubmitting,
  onClose,
  onConfirm,
  onAddLesson,
}: SubmitModalProps) {
  const hasLessons = lessonCount > 0;
  return (
    <Overlay onClose={isSubmitting ? () => undefined : onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[480px] overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-6">
          <div
            className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${hasLessons ? "bg-rose-50" : "bg-amber-50"}`}
          >
            {hasLessons ? (
              <Send className="h-5 w-5 text-[#E11D48]" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            )}
          </div>
          <h3 className="mb-1 text-lg font-semibold text-[#111827]">
            {hasLessons
              ? "Submit course for review?"
              : "Add a lesson before submitting"}
          </h3>
          <p className="mb-4 text-sm text-[#6B7280]">
            {hasLessons
              ? "Academic Managers will review your course before it is published. You cannot edit it while the review is pending."
              : "A course needs at least one lesson before it can be sent to Academic Managers."}
          </p>
          <div className="rounded-xl bg-[#F8FAFC] p-4 text-sm">
            <p className="font-medium text-[#111827]">
              {courseTitle || "Untitled course"}
            </p>
            <p className="mt-1 flex items-center gap-2 text-[#6B7280]">
              <BookOpen className="h-4 w-4" />
              {lessonCount} lessons
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-[#E5E7EB] bg-[#FAFAFA] px-6 py-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {hasLessons ? "Cancel" : "Continue Editing"}
          </button>
          {hasLessons ? (
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="rounded-lg bg-[#E11D48] px-4 py-2 text-sm font-semibold text-white hover:bg-[#BE123C] disabled:opacity-50"
            >
              {isSubmitting ? "Submitting…" : "Submit for Review"}
            </button>
          ) : (
            <button
              onClick={onAddLesson}
              className="rounded-lg bg-[#E11D48] px-4 py-2 text-sm font-semibold text-white hover:bg-[#BE123C]"
            >
              Add Lesson
            </button>
          )}
        </div>
      </div>
    </Overlay>
  );
}
