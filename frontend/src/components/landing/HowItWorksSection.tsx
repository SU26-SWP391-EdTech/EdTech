import React from 'react';
import { STEPS } from './landingData';

export function HowItWorksSection() {
    return (
        <section className="max-w-[1200px] mx-auto px-8 py-24">
            <div className="text-center mb-16">
                <p className="text-[#E11D48] mb-3" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em' }}>HOW IT WORKS</p>
                <h2 className="text-[#111827] mb-4" style={{ fontWeight: 800, fontSize: 44, lineHeight: 1.1 }}>
                    Three steps to reach<br />your learning goals
                </h2>
                <p className="text-[#6B7280] max-w-xl mx-auto" style={{ fontSize: 17, lineHeight: 1.6 }}>
                    Our platform is built to make self-learning structured, predictable, and highly rewarding.
                </p>
            </div>

            <div className="grid grid-cols-3 gap-10">
                {STEPS.map((s, idx) => (
                    <div key={s.title} className="relative">
                        {idx < 2 && (
                            <div className="absolute top-8 left-[calc(100%-40px)] w-24 h-px border-t border-dashed border-[#D1D5DB] z-0 hidden lg:block" />
                        )}
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 relative z-10" style={{ backgroundColor: s.bg, color: s.color }}>
                            {s.icon}
                        </div>
                        <h3 className="text-[#111827] mb-3 flex items-center gap-2.5" style={{ fontWeight: 700, fontSize: 18 }}>
                            <span style={{ color: s.color, fontSize: 14, fontWeight: 800 }}>{s.num}</span>
                            {s.title}
                        </h3>
                        <p className="text-[#6B7280]" style={{ fontSize: 14, lineHeight: 1.65 }}>{s.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
