import React from 'react';

interface InfoRowProps {
  label: string;
  children: React.ReactNode;
  readOnly?: boolean;
}

export function InfoRow({ label, children, readOnly }: InfoRowProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'start', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#6B7280' }}>{label}</span>
        {readOnly && <span style={{ fontSize: 10, color: '#9CA3AF', background: '#F3F4F6', padding: '1px 6px', borderRadius: 4 }}>read-only</span>}
      </div>
      <div>{children}</div>
    </div>
  );
}
