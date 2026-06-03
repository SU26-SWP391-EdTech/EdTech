import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function PrimaryButton({
  children,
  onClick,
  loading,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full py-3 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-sm transition-all disabled:opacity-55 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
      style={{ fontWeight: 600 }}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
}
