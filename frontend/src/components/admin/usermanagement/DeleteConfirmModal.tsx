import { Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  id: number;
  onCancel: () => void;
  onConfirm: (id: number) => void;
}

export function DeleteConfirmModal({ id, onCancel, onConfirm }: DeleteConfirmModalProps) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', width: 400, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ width: 44, height: 44, background: '#FFF5F5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <Trash2 size={18} style={{ color: '#E11D48' }} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Delete user?</h3>
        <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.6, marginBottom: 6 }}>
          Soft-delete — sets <code style={{ background: '#F3F4F6', padding: '1px 5px', borderRadius: 4, fontSize: 12 }}>deletedAt</code>. The user can no longer log in.
        </p>
        <p style={{ fontSize: 12.5, color: '#9CA3AF', marginBottom: 20 }}>Data is preserved in the database.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={onCancel} style={{ flex: 1, padding: '10px', border: '1px solid #E5E7EB', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff' }}>Cancel</button>
          <button type="button" onClick={() => onConfirm(id)} style={{ flex: 1, padding: '10px', background: '#E11D48', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff' }}>Delete User</button>
        </div>
      </div>
    </div>
  );
}
