import { useState } from 'react';
import { Bell } from 'lucide-react';

interface NotifBellProps {
    count: number;
    accentColor: string;
}

export function NotifBell({ count, accentColor }: NotifBellProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-xl hover:bg-[#F8FAFC] transition-colors"
            >
                <Bell
                    style={{
                        width: 18,
                        height: 18,
                        color: open ? accentColor : '#6B7280',
                    }}
                />

                {count > 0 && (
                    <span
                        className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-white text-[9px]"
                        style={{ backgroundColor: accentColor, fontWeight: 700 }}
                    >
                        {count}
                    </span>
                )}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

                    <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl z-50 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[#F3F4F6]">
                            <span
                                className="text-sm text-[#111827]"
                                style={{ fontWeight: 600 }}
                            >
                                Notifications
                            </span>

                            <span
                                className="px-2 py-0.5 rounded-full text-[10px] text-white"
                                style={{ backgroundColor: accentColor, fontWeight: 700 }}
                            >
                                {count}
                            </span>
                        </div>

                        {[
                            { text: 'New course submitted for review', t: '5m ago' },
                            { text: 'Learning path updated', t: '1h ago' },
                            { text: 'System notification available', t: '3h ago' },
                        ].map((n, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-3 px-4 py-3 hover:bg-[#FAFAFA] border-b border-[#F9FAFB] cursor-pointer"
                            >
                                <div
                                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                                    style={{ backgroundColor: accentColor }}
                                />

                                <div className="flex-1">
                                    <p
                                        className="text-xs text-[#374151]"
                                        style={{ fontWeight: 500 }}
                                    >
                                        {n.text}
                                    </p>

                                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">
                                        {n.t}
                                    </p>
                                </div>
                            </div>
                        ))}

                        <button
                            className="w-full py-3 text-xs text-center hover:bg-[#F8FAFC] transition-colors"
                            style={{ color: accentColor, fontWeight: 500 }}
                        >
                            View all notifications →
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}