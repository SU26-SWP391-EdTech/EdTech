import React from 'react';
import { Star } from 'lucide-react';
import { TESTIMONIALS } from './landingData';

export function TestimonialsSection() {
    return (
        <section className="bg-[#F8FAFC]/50 py-24 border-y border-[#E5E7EB]">
            <div className="max-w-[1200px] mx-auto px-8">
                <div className="text-center mb-16">
                    <p className="text-[#E11D48] mb-3" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em' }}>TESTIMONIALS</p>
                    <h2 className="text-[#111827] mb-4" style={{ fontWeight: 800, fontSize: 44, lineHeight: 1.1 }}>
                        Loved by builders<br />and lifelong learners
                    </h2>
                    <p className="text-[#6B7280] max-w-xl mx-auto" style={{ fontSize: 17, lineHeight: 1.6 }}>
                        See how developers, designers, and analyst professionals are using our platform to scale their careers.
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {TESTIMONIALS.map(t => (
                        <div key={t.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-7 hover:shadow-lg hover:shadow-[#0F172A]/5 transition-all">
                            <div className="flex items-center gap-0.5 mb-5">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                                ))}
                            </div>
                            <p className="text-[#374151] mb-7" style={{ fontSize: 15, lineHeight: 1.7 }}>"{t.quote}"</p>
                            <div className="flex items-center gap-3 pt-5 border-t border-[#F3F4F6]">
                                {t.av.startsWith('http') || t.av.startsWith('/') ? (
                                    <img src={t.av} alt={t.name} className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: t.color, fontSize: 12, fontWeight: 700 }}>
                                        {t.av}
                                    </div>
                                )}
                                <div>
                                    <p className="text-[#111827]" style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</p>
                                    <p className="text-[#9CA3AF]" style={{ fontSize: 13 }}>{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
