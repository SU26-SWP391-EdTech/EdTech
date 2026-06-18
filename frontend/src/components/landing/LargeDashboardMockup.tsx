import React from 'react';
import { BookOpen, Flame, Play, Check } from 'lucide-react';

export function LargeDashboardMockup() {
    return (
        <div className="bg-white rounded-3xl shadow-2xl shadow-[#0F172A]/10 border border-[#E5E7EB] overflow-hidden">
            {/* Browser */}
            <div className="bg-[#F8FAFC] border-b border-[#E5E7EB] px-5 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FCA5A5]" />
                    <div className="w-3 h-3 rounded-full bg-[#FCD34D]" />
                    <div className="w-3 h-3 rounded-full bg-[#6EE7B7]" />
                </div>
                <div className="flex-1 flex justify-center">
                    <div className="bg-white border border-[#E5E7EB] rounded-md px-4 py-1.5 flex items-center gap-2" style={{ fontSize: 12, color: '#9CA3AF', width: 260 }}>
                        <div className="w-2 h-2 rounded-full bg-[#10B981] flex-shrink-0" />
                        learningpath.app/dashboard
                    </div>
                </div>
            </div>

            <div className="flex" style={{ height: 360 }}>
                {/* Sidebar */}
                <div className="w-44 flex-shrink-0 border-r border-[#F3F4F6] bg-white p-4">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-6 h-6 rounded-md bg-[#E11D48] flex items-center justify-center">
                            <BookOpen className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-[#111827]" style={{ fontWeight: 700, fontSize: 12 }}>LearningPath</span>
                    </div>
                    {[
                        { label: 'Dashboard', active: true },
                        { label: 'My Courses', active: false },
                        { label: 'Learning Paths', active: false },
                        { label: 'Community', active: false },
                        { label: 'Analytics', active: false },
                        { label: 'Profile', active: false },
                    ].map(item => (
                        <div key={item.label} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg mb-0.5 ${item.active ? 'bg-[#FFF1F4] text-[#E11D48]' : 'text-[#6B7280]'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.active ? 'bg-[#E11D48]' : 'bg-transparent'}`} />
                            <span style={{ fontSize: 12, fontWeight: item.active ? 600 : 400 }}>{item.label}</span>
                        </div>
                    ))}

                    <div className="mt-4 pt-4 border-t border-[#F3F4F6]">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#E11D48] flex items-center justify-center text-white" style={{ fontSize: 10, fontWeight: 700 }}>A</div>
                            <div>
                                <p className="text-[#111827]" style={{ fontSize: 11, fontWeight: 600 }}>Alex Morgan</p>
                                <p className="text-[#9CA3AF]" style={{ fontSize: 10 }}>Learner</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main */}
                <div className="flex-1 bg-[#F8FAFC] p-5 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-[#111827]" style={{ fontWeight: 700, fontSize: 15 }}>Welcome back, Alex 👋</p>
                            <p className="text-[#9CA3AF]" style={{ fontSize: 12 }}>You're on a 12-day streak — keep it up!</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="px-2.5 py-1 bg-[#FFFBEB] border border-[#FDE68A] rounded-full flex items-center gap-1">
                                <Flame className="w-3 h-3 text-[#F59E0B]" />
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#B45309' }}>12-day streak</span>
                            </div>
                            <button className="px-3 py-1.5 bg-[#E11D48] text-white rounded-lg flex items-center gap-1" style={{ fontSize: 11, fontWeight: 600 }}>
                                <Play className="w-3 h-3 fill-white" /> Continue
                            </button>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                        {[
                            { val: '12', label: 'Day Streak', color: '#F59E0B' },
                            { val: '8', label: 'Completed', color: '#10B981' },
                            { val: '124h', label: 'Learned', color: '#3B82F6' },
                            { val: '74%', label: 'Weekly Goal', color: '#E11D48' },
                        ].map(s => (
                            <div key={s.label} className="bg-white rounded-xl p-3 border border-[#E5E7EB]">
                                <p style={{ color: s.color, fontWeight: 700, fontSize: 20, lineHeight: 1 }}>{s.val}</p>
                                <p className="text-[#9CA3AF] mt-1" style={{ fontSize: 11 }}>{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Bottom grid */}
                    <div className="grid grid-cols-3 gap-3">
                        {/* Courses */}
                        <div className="col-span-2 bg-white rounded-xl p-4 border border-[#E5E7EB]">
                            <p className="text-[#111827] mb-3" style={{ fontWeight: 600, fontSize: 13 }}>Continue Learning</p>
                            {[
                                { title: 'Advanced React Dev', pct: 52, g: 'from-blue-700 to-violet-600', color: '#E11D48', lesson: 'useCallback & useMemo' },
                                { title: 'Node.js & REST APIs', pct: 31, g: 'from-emerald-700 to-teal-500', color: '#3B82F6', lesson: 'Middleware & Routing' },
                            ].map(c => (
                                <div key={c.title} className="flex items-center gap-3 mb-2.5 last:mb-0">
                                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.g} flex-shrink-0`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[#111827] truncate" style={{ fontWeight: 600, fontSize: 12 }}>{c.title}</p>
                                        <p className="text-[#9CA3AF] truncate" style={{ fontSize: 11 }}>{c.lesson}</p>
                                        <div className="h-1 bg-[#F3F4F6] rounded-full mt-1.5 overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                                        </div>
                                    </div>
                                    <span style={{ fontSize: 11, color: c.color, fontWeight: 700 }}>{c.pct}%</span>
                                </div>
                            ))}
                        </div>

                        {/* Roadmap */}
                        <div className="bg-white rounded-xl p-4 border border-[#E5E7EB]">
                            <p className="text-[#111827] mb-3" style={{ fontWeight: 600, fontSize: 13 }}>Frontend Path</p>
                            <div className="space-y-2">
                                {[
                                    { label: 'HTML & CSS', state: 'done' },
                                    { label: 'JavaScript', state: 'done' },
                                    { label: 'React', state: 'active' },
                                    { label: 'TypeScript', state: 'next' },
                                    { label: 'Next.js', state: 'locked' },
                                ].map((node) => (
                                    <div key={node.label} className="flex items-center gap-2">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${node.state === 'done' ? 'bg-[#10B981]' :
                                            node.state === 'active' ? 'bg-[#E11D48]' :
                                                'bg-[#F3F4F6] border border-[#E5E7EB]'
                                            }`}>
                                            {node.state === 'done' && <Check className="w-3 h-3 text-white" />}
                                            {node.state === 'active' && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                        <span className={`text-xs ${node.state === 'done' ? 'text-[#374151]' : node.state === 'active' ? 'text-[#E11D48]' : 'text-[#9CA3AF]'}`}
                                            style={{ fontWeight: node.state === 'active' ? 600 : 400 }}>
                                            {node.label}
                                        </span>
                                        {node.state === 'active' && (
                                            <span className="text-[9px] bg-[#E11D48] text-white px-1.5 py-0.5 rounded" style={{ fontWeight: 700 }}>NOW</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
