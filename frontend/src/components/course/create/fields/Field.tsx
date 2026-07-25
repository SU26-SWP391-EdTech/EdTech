import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  full?: boolean;
  children: ReactNode;
}

export function Field({ label, hint, error, required, full, children }: FieldProps) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs text-[#374151]" style={{ fontWeight: 500 }}>
          {label}{required && <span className="text-[#E11D48] ml-0.5">*</span>}
        </label>
        {hint && <span className="text-[11px] text-[#9CA3AF]">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-[#B91C1C]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
