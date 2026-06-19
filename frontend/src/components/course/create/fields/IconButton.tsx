import type { ReactNode } from 'react';

interface IconButtonProps {
  children: ReactNode;
  onClick?: () => void;
  title?: string;
  danger?: boolean;
}

export function IconButton({ children, onClick, title, danger }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${danger ? 'text-[#6B7280] hover:text-[#E11D48] hover:bg-[#FEF2F2]' : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAFC]'}`}
    >
      {children}
    </button>
  );
}
