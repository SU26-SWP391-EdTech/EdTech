import React from 'react';
import { Trophy, Flame, Play, Check } from 'lucide-react';

export function HeroDashboardMockup() {
    return (
        <div className="relative">
            {/* Floating achievement badge */}
            <div className="absolute -top-5 -right-6 z-20 bg-white border border-[#E5E7EB] rounded-2xl px-3.5 py-2.5 shadow-lg shadow-[#0F172A]/10 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#EF4444] flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-4 h-4 text-white" />
                </div>
                <div>
                    <p className="text-[#111827]" style={{ fontWeight: 700, fontSize: 12 }}>Badge Unlocked!</p>
                    <p className="text-[#9CA3AF]" style={{ fontSize: 11 }}>Quiz Master 🎉</p>
                </div>
            </div>

            {/* Floating streak pill */}
            <div className="absolute -bottom-4 -left-6 z-20 bg-white border border-[#E5E7EB] rounded-2xl px-3.5 py-2.5 shadow-lg shadow-[#0F172A]/10 flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-[#111827]" style={{ fontWeight: 700, fontSize: 12 }}>12-day streak!</span>
                <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] ml-1" />
            </div>

            {/* Floating progress pill */}
            <div className="absolute top-1/2 -left-8 z-20 -translate-y-1/2 bg-white border border-[#E5E7EB] rounded-2xl px-3.5 py-3 shadow-lg shadow-[#0F172A]/10">
                <p className="text-[#9CA3AF] mb-1" style={{ fontSize: 10, fontWeight: 600 }}>WEEKLY GOAL</p>
                <p className="text-[#111827]" style={{ fontWeight: 800, fontSize: 18 }}>74%</p>
                <div className="h-1.5 w-24 bg-[#F3F4F6] rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-[#E11D48] rounded-full" style={{ width: '74%' }} />
                </div>
            </div>

            {/* Main card */}
            <div className="bg-white rounded-3xl shadow-2xl shadow-[#0F172A]/12 border border-[#E5E7EB] overflow-hidden ml-6">
                {/* Browser bar */}
                <div className="bg-[#F8FAFC] border-b border-[#E5E7EB] px-5 py-3 flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FCA5A5]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FCD34D]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#6EE7B7]" />
                    </div>
                    <div className="flex-1 ml-2">
                        <div className="bg-white border border-[#E5E7EB] rounded-md px-3 py-1 text-[#9CA3AF] flex items-center gap-1" style={{ fontSize: 11, width: 200 }}>
                            <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                            learningpath.app/dashboard
                        </div>
                    </div>
                </div>

                {/* Dashboard content */}
                <div className="p-5 bg-[#F8FAFC]" style={{ minWidth: 420 }}>
                    {/* Greeting */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-[#111827]" style={{ fontWeight: 700, fontSize: 15 }}>Welcome back, Alex 👋</p>
                            <p className="text-[#9CA3AF]" style={{ fontSize: 12 }}>Continue where you left off</p>
                        </div>
                        <button className="px-3 py-1.5 bg-[#E11D48] text-white rounded-lg flex items-center gap-1.5" style={{ fontSize: 12, fontWeight: 600 }}>
                            <Play className="w-3 h-3 fill-white" /> Continue
                        </button>
                    </div>

                    {/* Stat cards */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                            { val: '12d', label: 'Streak', color: '#F59E0B', bg: '#FFFBEB' },
                            { val: '52%', label: 'Progress', color: '#E11D48', bg: '#FFF1F4' },
                            { val: '1,025', label: 'XP', color: '#10B981', bg: '#F0FDF4' },
                        ].map(s => (
                            <div key={s.label} className="bg-white rounded-xl p-3 border border-[#E5E7EB]">
                                <p style={{ color: s.color, fontWeight: 700, fontSize: 19, lineHeight: 1 }}>{s.val}</p>
                                <p className="text-[#9CA3AF] mt-1" style={{ fontSize: 11 }}>{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Course progress */}
                    <div className="space-y-2.5 mb-4">
                        {[
                            { title: 'Advanced React Dev', pct: 52, color: '#E11D48', g: 'from-blue-800 to-violet-600' },
                            { title: 'UI/UX Fundamentals', pct: 78, color: '#10B981', g: 'from-rose-700 to-amber-500' },
                        ].map(c => (
                            <div key={c.title} className="bg-white rounded-xl p-3 border border-[#E5E7EB] flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.g} flex-shrink-0`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[#111827] truncate" style={{ fontWeight: 600, fontSize: 12 }}>{c.title}</p>
                                    <div className="h-1.5 bg-[#F3F4F6] rounded-full mt-1.5 overflow-hidden">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                                    </div>
                                </div>
                                <span style={{ fontSize: 11, color: c.color, fontWeight: 700 }}>{c.pct}%</span>
                            </div>
                        ))}
                    </div>

                    {/* Mini roadmap */}
                    <div className="bg-white rounded-xl p-3.5 border border-[#E5E7EB]">
                        <p className="text-[#6B7280] mb-2.5" style={{ fontSize: 11, fontWeight: 600 }}>FRONTEND MASTERY PATH</p>
                        <div className="flex items-center gap-1.5">
                            {['HTML', 'JS', 'React', 'TS', 'Next'].map((n, i) => (
                                <div key={n} className="flex items-center gap-1.5">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${i < 2 ? 'bg-[#10B981] border-[#10B981]' :
                                        i === 2 ? 'bg-[#E11D48] border-[#E11D48]' :
                                            'bg-white border-[#E5E7EB]'
                                        }`}>
                                        {i < 2 ? <Check className="w-3 h-3 text-white" /> :
                                            i === 2 ? <div className="w-2 h-2 rounded-full bg-white" /> :
                                                <div className="w-2 h-2 rounded-full bg-[#D1D5DB]" />}
                                    </div>
                                    {i < 4 && <div className="w-5 h-0.5 bg-[#E5E7EB]" />}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                            {['HTML', 'JS', 'React', 'TS', 'Next'].map((n, i) => (
                                <div key={n} className="flex items-center gap-1.5">
                                    <span style={{ fontSize: 9, color: i < 2 ? '#10B981' : i === 2 ? '#E11D48' : '#9CA3AF', fontWeight: i === 2 ? 700 : 400, width: 28, textAlign: 'center' }}>{n}</span>
                                    {i < 4 && <div style={{ width: 20 }} />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
