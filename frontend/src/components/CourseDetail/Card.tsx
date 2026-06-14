import React from 'react';

interface CardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function Card({ title, subtitle, action, children }: CardProps) {
  return (
    <section className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
      <header className="flex items-center justify-between px-5 py-4 border-b border-[#F1F5F9]">
        <div>
          <h2 className="text-base text-[#111827]" style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</h2>
          {subtitle && <p className="text-xs text-[#6B7280] mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}
