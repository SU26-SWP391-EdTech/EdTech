import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  msg: string;
}

export function Toast({ msg }: ToastProps) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#111827', borderRadius: 10, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 400 }}>
      <CheckCircle2 size={16} style={{ color: '#4ADE80' }} />
      <span style={{ fontSize: 13.5, fontWeight: 500, color: '#fff' }}>{msg}</span>
    </div>
  );
}
