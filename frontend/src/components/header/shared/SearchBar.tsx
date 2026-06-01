import { useState } from 'react';
import { Search, X, Command } from 'lucide-react';

interface SearchBarProps {
    placeholder: string;
    accentColor: string;
}

export function SearchBar({ placeholder, accentColor }: SearchBarProps) {
    const [focused, setFocused] = useState(false);
    const [val, setVal] = useState('');

    return (
        <div
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border transition-all w-full max-w-[320px] ${focused
                    ? 'bg-white border-current shadow-sm'
                    : 'bg-[#F8FAFC] border-[#E5E7EB] hover:border-[#D1D5DB]'
                }`}
            style={{
                borderColor: focused ? accentColor + '80' : undefined,
                boxShadow: focused ? `0 0 0 3px ${accentColor}15` : undefined,
            }}
        >
            <Search
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{ color: focused ? accentColor : '#9CA3AF' }}
            />

            <input
                value={val}
                onChange={(e) => setVal(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={placeholder}
                className="flex-1 bg-transparent text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none min-w-0"
            />

            {val ? (
                <button onClick={() => setVal('')}>
                    <X className="w-3.5 h-3.5 text-[#9CA3AF]" />
                </button>
            ) : (
                !focused && (
                    <kbd className="hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 bg-[#F3F4F6] border border-[#E5E7EB] rounded text-[10px] text-[#9CA3AF] font-mono">
                        <Command className="w-2.5 h-2.5" />K
                    </kbd>
                )
            )}
        </div>
    );
}