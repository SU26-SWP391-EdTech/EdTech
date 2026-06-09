import React from 'react';

interface ProfileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    required?: boolean;
    helperText?: string;
}

export function ProfileInput({ label, required, helperText, className = '', ...props }: ProfileInputProps) {
    return (
        <div>
            <label className="block text-xs text-[#374151] mb-1.5 font-medium">
                {label} {required && <span className="text-[#E11D48]">*</span>}
            </label>
            <input
                {...props}
                className={`w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 transition-colors disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF] disabled:cursor-not-allowed ${className}`}
            />
            {helperText && <p className="text-[10px] text-[#9CA3AF] mt-1">{helperText}</p>}
        </div>
    );
}
