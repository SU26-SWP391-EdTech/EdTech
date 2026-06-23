import { useState } from 'react';
import { X } from 'lucide-react';

interface AddTaskModalProps {
    onClose: () => void;
    onAdd: (task: { title: string; priority: 'High' | 'Medium' | 'Low'; due: string }) => void;
}

export function AddTaskModal({ onClose, onAdd }: AddTaskModalProps) {
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
    const [due, setDue] = useState('Today');

    const handleSubmit = () => {
        if (!title.trim()) return;
        onAdd({
            title: title.trim(),
            priority,
            due: due.trim() || 'Today'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl w-full max-w-md shadow-2xl p-6 flex flex-col gap-5 transform scale-100 transition-all duration-300 animate-scale-up">
                <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
                    <h3 className="text-base font-bold text-[#111827]">Tạo công việc mới</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-[#F3F4F6] rounded-lg text-[#9CA3AF] hover:text-[#374151] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    {/* Title */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#374151]">Tiêu đề công việc</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nhập tiêu đề công việc..."
                            autoFocus
                            className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 transition-all placeholder:text-[#9CA3AF]"
                        />
                    </div>

                    {/* Priority */}
                    {/* <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#374151]">Độ ưu tiên</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['High', 'Medium', 'Low'] as const).map((p) => {
                                const styles = {
                                    High: {
                                        active: 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]',
                                        inactive: 'border-[#E5E7EB] text-[#6B7280] hover:bg-[#FEF2F2]/50 hover:text-[#DC2626]'
                                    },
                                    Medium: {
                                        active: 'border-[#D97706] bg-[#FFFBEB] text-[#D97706]',
                                        inactive: 'border-[#E5E7EB] text-[#6B7280] hover:bg-[#FFFBEB]/50 hover:text-[#D97706]'
                                    },
                                    Low: {
                                        active: 'border-[#6B7280] bg-[#F9FAFB] text-[#111827]',
                                        inactive: 'border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'
                                    }
                                };
                                const activeClass = priority === p ? styles[p].active : styles[p].inactive;
                                return (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p)}
                                        className={`py-2 text-xs font-semibold border rounded-xl transition-all ${activeClass}`}
                                    >
                                        {p === 'High' ? 'Cao' : p === 'Medium' ? 'Trung bình' : 'Thấp'}
                                    </button>
                                );
                            })}
                        </div>
                    </div> */}

                    {/* Due Date */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#374151]">Hạn chót</label>
                        <input
                            type="text"
                            value={due}
                            onChange={(e) => setDue(e.target.value)}
                            placeholder="Ví dụ: Today, Tomorrow, May 30..."
                            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 transition-all"
                        />
                        <div className="flex gap-2 mt-1">
                            {['Today', 'Tomorrow', 'Next week'].map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setDue(opt)}
                                    className={`px-2.5 py-1 text-xs border rounded-lg transition-colors ${due === opt ? 'border-[#E11D48] text-[#E11D48] bg-[#FFF1F3]' : 'border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8FAFC]'}`}
                                >
                                    {opt === 'Today' ? 'Hôm nay' : opt === 'Tomorrow' ? 'Ngày mai' : 'Tuần tới'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 border-t border-[#F3F4F6] pt-4 mt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#374151] hover:bg-[#F8FAFC] transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!title.trim()}
                        className="px-4 py-2 bg-[#E11D48] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors font-medium"
                    >
                        Thêm task
                    </button>
                </div>
            </div>
        </div>
    );
}
