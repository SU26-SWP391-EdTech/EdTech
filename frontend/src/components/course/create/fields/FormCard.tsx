import type { ReactNode } from 'react';

interface FormCardProps {
  step: number;
  title: string;
  description: string;
  children: ReactNode;
  action?: ReactNode;
}

export function FormCard({ step, title, description, children, action }: FormCardProps) {
  return (
    <section className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
      <header className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#F1F5F9]">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#FEF2F2] text-[#E11D48] flex items-center justify-center text-xs" style={{ fontWeight: 700 }}>
            {step}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base text-[#111827]" style={{ fontWeight: 600 }}>{title}</h2>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">{description}</p>
          </div>
        </div>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}
