import { type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface FormInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  icon?: ReactNode;
  error?: string;
  hint?: string;
  rightEl?: ReactNode;
  disabled?: boolean;
}

export function FormInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  error,
  hint,
  rightEl,
  disabled,
}: FormInputProps) {
  return (
    <div>
      <label className="block text-sm text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]">{icon}</div>
        )}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full py-3 border rounded-xl text-sm text-[#111827] placeholder:text-[#C4C9D4] focus:outline-none transition-all disabled:bg-[#F9FAFB] disabled:cursor-not-allowed ${
            icon ? 'pl-10' : 'pl-4'
          } ${rightEl ? 'pr-11' : 'pr-4'} ${
            error
              ? 'border-[#E11D48] bg-[#FFF8F9] focus:ring-2 focus:ring-[#E11D48]/15'
              : 'border-[#E5E7EB] bg-white focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/12'
          }`}
        />
        {rightEl && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightEl}</div>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-[#E11D48] flex-shrink-0" />
          <p className="text-xs text-[#E11D48]" style={{ fontWeight: 500 }}>{error}</p>
        </div>
      )}
      {hint && !error && (
        <p className="text-xs text-[#9CA3AF] mt-1.5">{hint}</p>
      )}
    </div>
  );
}
