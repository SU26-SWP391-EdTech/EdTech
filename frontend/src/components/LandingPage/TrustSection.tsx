import React from 'react';
import { ORGS } from './landingData';

export function TrustSection() {
    return (
        <section className="border-y border-[#E5E7EB] bg-[#F8FAFC]/50 py-10">
            <div className="max-w-[1200px] mx-auto px-8">
                <p className="text-center text-[#9CA3AF] mb-6" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em' }}>
                    TRUSTED BY LEARNERS FROM WORLD-CLASS ORGANIZATIONS
                </p>
                <div className="flex items-center justify-between opacity-50 grayscale hover:grayscale-0 transition-all">
                    {ORGS.map(o => (
                        <span key={o} className="text-[#4B5563]" style={{ fontWeight: 700, fontSize: 15 }}>
                            {o}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
