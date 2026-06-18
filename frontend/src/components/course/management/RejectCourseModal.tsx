import React from 'react';
import toast from 'react-hot-toast';

interface RejectCourseModalProps {
    rejectReason: string;
    setRejectReason: (val: string) => void;
    selectedRejectCourseId: number | null;
    setSelectedRejectCourseId: (id: number | null) => void;
    setShowRejectModal: (val: boolean) => void;
    handleRejectCourse: (id: number, reason: string) => void;
}

export function RejectCourseModal({
    rejectReason,
    setRejectReason,
    selectedRejectCourseId,
    setSelectedRejectCourseId,
    setShowRejectModal,
    handleRejectCourse,
}: RejectCourseModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => {
            setShowRejectModal(false);
            setRejectReason('');
            setSelectedRejectCourseId(null);
        }}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg text-[#111827] mb-2" style={{ fontWeight: 600 }}>Reject Course</h3>
                <p className="text-sm text-[#6B7280] mb-4">Please provide a reason for rejecting this course. This feedback will be sent to the provider.</p>
                <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    rows={4}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 transition-all mb-4"
                    placeholder="Enter rejection reason here..."
                />
                <div className="flex items-center justify-end gap-2.5">
                    <button
                        onClick={() => {
                            setShowRejectModal(false);
                            setRejectReason('');
                            setSelectedRejectCourseId(null);
                        }}
                        className="px-4 py-2 border border-[#E5E7EB] text-[#374151] rounded-lg text-sm hover:bg-[#F8FAFC]"
                        style={{ fontWeight: 500 }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (!rejectReason.trim()) {
                                toast.error('Rejection reason is required.');
                                return;
                            }
                            if (selectedRejectCourseId !== null) {
                                handleRejectCourse(selectedRejectCourseId, rejectReason.trim());
                            }
                            setShowRejectModal(false);
                            setRejectReason('');
                            setSelectedRejectCourseId(null);
                        }}
                        className="px-4 py-2 bg-[#EF4444] text-white rounded-lg text-sm hover:bg-[#DC2626]"
                        style={{ fontWeight: 500 }}
                    >
                        Reject Course
                    </button>
                </div>
            </div>
        </div>
    );
}
