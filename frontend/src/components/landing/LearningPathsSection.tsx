import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, BookOpen, Clock, Users } from 'lucide-react';
import { PATHS } from './landingData';

export function LearningPathsSection() {
    const navigate = useNavigate();
    return (
        <section className="bg-[#F8FAFC] py-24">
            <div className="max-w-[1200px] mx-auto px-8">
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <p className="text-[#E11D48] mb-3" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em' }}>FEATURED PATHS</p>
                        <h2 className="text-[#111827]" style={{ fontWeight: 800, fontSize: 42, lineHeight: 1.1 }}>
                            Start a curated<br />learning path
                        </h2>
                    </div>
                    <button
                        onClick={() => navigate('/explore')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E5E7EB] text-[#374151] rounded-xl hover:bg-[#F3F4F6] transition-all cursor-pointer"
                        style={{ fontSize: 14, fontWeight: 500 }}
                    >
                        View all paths <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {PATHS.map(path => (
                        <div
                            key={path.id}
                            onClick={() => navigate(`/learning-path/${path.id}`)}
                            className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:border-[#E11D48]/30 hover:shadow-xl hover:shadow-[#0F172A]/6 transition-all group cursor-pointer"
                        >
                            {/* Banner */}
                            <div className="h-36 relative flex items-end p-5" style={{ background: path.gradient }}>
                                <div className="absolute inset-0 opacity-10"
                                    style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                                <div className="relative z-10">
                                    <span className="inline-block px-2.5 py-1 bg-white/20 text-white rounded-lg mb-2" style={{ fontSize: 11, fontWeight: 600 }}>
                                        {path.difficulty}
                                    </span>
                                    <h3 className="text-white" style={{ fontWeight: 800, fontSize: 20 }}>{path.title} Path</h3>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-6">
                                <p className="text-[#6B7280] mb-5" style={{ fontSize: 14, lineHeight: 1.55 }}>{path.desc}</p>

                                <div className="flex items-center gap-5 mb-5 text-[#9CA3AF]" style={{ fontSize: 13 }}>
                                    <div className="flex items-center gap-1.5">
                                        <BookOpen className="w-4 h-4" />
                                        <span>{path.courses} courses</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        <span>{path.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-4 h-4" />
                                        <span>{(path.enrolled / 1000).toFixed(1)}k enrolled</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5 mb-5">
                                    {path.tags.map(tag => (
                                        <span key={tag} className="px-2.5 py-1 bg-[#F8FAFC] border border-[#E5E7EB] text-[#6B7280] rounded-lg" style={{ fontSize: 12, fontWeight: 500 }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/learning-path/${path.id}`);
                                    }}
                                    className="w-full py-2.5 rounded-xl text-sm transition-all group-hover:bg-[#E11D48] group-hover:text-white border border-[#E5E7EB] bg-[#F8FAFC] text-[#374151] cursor-pointer"
                                    style={{ fontWeight: 600 }}
                                >
                                    Start Path →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
