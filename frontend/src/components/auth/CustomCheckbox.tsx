import { Check } from 'lucide-react';

export function CustomCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-all mt-0.5 ${checked ? 'bg-[#E11D48] border-[#E11D48]' : 'border-[#D1D5DB] hover:border-[#E11D48]/50'}`}
    >
      {checked && <Check className="w-3 h-3 text-white" />}
    </div>
  );
}
