import { AlertTriangle } from 'lucide-react';

interface AssessmentExitModalProps {
    onStay: () => void;
    onLeave: () => void;
}

export function AssessmentExitModal({ onStay, onLeave }: AssessmentExitModalProps) {
    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#111827]/50 p-6 backdrop-blur-sm"
            onClick={onStay}
        >
            <div
                className="w-full max-w-[440px] overflow-hidden rounded-2xl bg-white shadow-2xl"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="assessment-exit-title"
                aria-describedby="assessment-exit-description"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFFBEB]">
                        <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
                    </div>
                    <h3
                        id="assessment-exit-title"
                        className="mb-1 text-[18px] text-[#111827]"
                        style={{ fontWeight: 600 }}
                    >
                        Leave assessment?
                    </h3>
                    <p id="assessment-exit-description" className="text-sm text-[#6B7280]">
                        Your current assessment progress will not be saved if you leave this page.
                    </p>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-[#E5E7EB] bg-[#FAFAFA] px-6 py-4">
                    <button
                        onClick={onStay}
                        className="px-4 py-2 text-sm text-[#4B5563] hover:text-[#111827]"
                        style={{ fontWeight: 500 }}
                    >
                        Continue assessment
                    </button>
                    <button
                        onClick={onLeave}
                        className="rounded-lg bg-[#E11D48] px-4 py-2 text-sm text-white hover:bg-[#BE123C]"
                        style={{ fontWeight: 500 }}
                    >
                        Leave
                    </button>
                </div>
            </div>
        </div>
    );
}
