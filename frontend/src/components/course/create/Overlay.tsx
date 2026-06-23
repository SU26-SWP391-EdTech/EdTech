import type { ReactNode } from 'react';

interface OverlayProps {
  children: ReactNode;
  onClose: () => void;
}

export function Overlay({ children, onClose }: OverlayProps) {
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 bg-[#111827]/50 backdrop-blur-sm flex items-center justify-center p-6">
      {children}
    </div>
  );
}
