import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Play, ChevronRight, Star } from 'lucide-react';
import { HeroDashboardMockup } from './HeroDashboardMockup';

export function HeroSection() {
    const navigate = useNavigate();
    return (
        <section className="relative overflow-hidden">
            {/* Bg accent */}
            <div className="absolute inset-0 opacity-40"
                style={{ background: 'radial-gradient(ellipse at 75% 40%, rgba(225,29,72,0.06) 0%, transparent 60%)' }} />
            <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle, #E5E7EB 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            <div className="relative max-w-[1200px] mx-auto px-8 py-24">
                <div className="grid grid-cols-2 gap-20 items-center">
                    {/* Left */}
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FFF1F4] border border-[#FECDD3] rounded-full mb-6">
                            <Sparkles className="w-3.5 h-3.5 text-[#E11D48]" />
                            <span className="text-[#BE123C]" style={{ fontSize: 12, fontWeight: 600 }}>
                                Personalized learning, reimagined
                            </span>
                        </div>

                        <h1 className="text-[#111827] mb-6" style={{ fontWeight: 800, fontSize: 60, lineHeight: 1.08 }}>
                            Build your own<br />
                            <span style={{ color: '#E11D48' }}>learning journey</span>,<br />
                            one path at a time
                        </h1>

                        <p className="text-[#6B7280] mb-10" style={{ fontSize: 18, lineHeight: 1.65 }}>
                            Discover structured learning paths, track your progress, and grow skills with courses designed for your goals.
                        </p>

                        <div className="flex items-center gap-4 mb-12">
                            <button
                                onClick={() => navigate('/register')}
                                className="flex items-center gap-2.5 px-6 py-3.5 bg-[#E11D48] text-white rounded-xl hover:bg-[#BE123C] transition-all shadow-lg shadow-[#E11D48]/25 cursor-pointer"
                                style={{ fontSize: 15, fontWeight: 600 }}
                            >
                                <Play className="w-4 h-4 fill-white" />
                                Start Learning Free
                            </button>
                            <button
                                onClick={() => navigate('/explore')}
                                className="flex items-center gap-2.5 px-6 py-3.5 bg-white border border-[#E5E7EB] text-[#374151] rounded-xl hover:bg-[#F8FAFC] hover:border-[#D1D5DB] transition-all cursor-pointer"
                                style={{ fontSize: 15, fontWeight: 500 }}
                            >
                                Explore Paths
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Avatars + social proof */}
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                                {['#7C3AED', '#0369A1', '#D97706', '#065F46', '#E11D48'].map((c, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white" style={{ backgroundColor: c, fontSize: 10, fontWeight: 700 }}>
                                        {['MT', 'JO', 'SR', 'AK', 'MP'][i]}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div className="flex items-center gap-1 mb-0.5">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />)}
                                </div>
                                <p className="text-[#6B7280]" style={{ fontSize: 13 }}>
                                    <span style={{ fontWeight: 600, color: '#111827' }}>50,000+</span> learners already enrolled
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right - Mockup */}
                    <div className="flex justify-end">
                        <HeroDashboardMockup />
                    </div>
                </div>
            </div>
        </section>
    );
}
