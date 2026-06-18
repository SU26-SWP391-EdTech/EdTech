import React from 'react';
import { ArrowRight } from 'lucide-react';
import { FEATURES } from './landingData';

export function FeaturesSection() {
    return (
        <section className="max-w-[1200px] mx-auto px-8 py-24">
            <div className="text-center mb-16">
                <p className="text-[#E11D48] mb-3" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em' }}>DESIGNED FOR GROWTH</p>
                <h2 className="text-[#111827] mb-4" style={{ fontWeight: 800, fontSize: 44, lineHeight: 1.1 }}>
                    Everything you need to<br />master new skills
                </h2>
                <p className="text-[#6B7280] max-w-xl mx-auto" style={{ fontSize: 17, lineHeight: 1.6 }}>
                    We combine structured roadmaps with actionable learning features to help you reach your goals faster.
                </p>
            </div>

            <div className="grid grid-cols-4 gap-6">
                {FEATURES.map(f => (
                    <div key={f.title} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 hover:shadow-xl hover:shadow-[#0F172A]/5 hover:border-[#E5E7EB]/50 transition-all group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: f.bg, color: f.color }}>
                            {f.icon}
                        </div>
                        <h3 className="text-[#111827] mb-3" style={{ fontWeight: 700, fontSize: 18 }}>{f.title}</h3>
                        <p className="text-[#6B7280]" style={{ fontSize: 14, lineHeight: 1.65 }}>{f.desc}</p>
                        <div className="mt-5 flex items-center gap-1.5 text-[#E11D48] group-hover:gap-2.5 transition-all" style={{ fontSize: 13, fontWeight: 600 }}>
                            Learn more <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
