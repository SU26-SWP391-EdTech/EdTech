import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { type RoleName, UserRoleBadge } from './UserRoleBadge';
import { Toggle } from './Toggle';
import { InfoRow } from './InfoRow';

export interface UserRow {
  userId: number;
  fullName: string;
  email: string;
  initials: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  role: RoleName;
  avatar: string | null;
}

interface UserDetailViewProps {
  selected: UserRow;
  isEditing: boolean;
  onBack: () => void;
  onSave: (updatedFields: { fullName: string; isEmailVerified: boolean; avatar_url?: string }) => Promise<void>;
}

const mkInitials = (name: string) => name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);

export function UserDetailView({ selected, isEditing, onBack, onSave }: UserDetailViewProps) {
  const [eName, setEName] = useState(selected.fullName);
  const [eVerified, setEVerified] = useState(selected.isEmailVerified);
  const [eAvatar, setEAvatar] = useState(selected.avatar || '');
  const [eAvatarPreview, setEAvatarPreview] = useState(selected.avatar || '');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if selected user changes
  useEffect(() => {
    setEName(selected.fullName);
    setEVerified(selected.isEmailVerified);
    setEAvatar(selected.avatar || '');
    setEAvatarPreview(selected.avatar || '');
  }, [selected]);

  const handleEditAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setEAvatar(base64String);
        setEAvatarPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave({
        fullName: eName,
        isEmailVerified: eVerified,
        avatar_url: eAvatar || undefined,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const isActive = !selected.deletedAt;
  const displayName = isEditing ? eName : selected.fullName;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F8FAFC', minHeight: '100vh', padding: '28px 32px' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13.5, fontWeight: 500, color: '#6B7280' }}>
          <ArrowLeft size={15} /> Back to User Management
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          {isEditing && (
            <button onClick={handleSave} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: '#E11D48', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff', opacity: isSaving ? 0.7 : 1 }}>
              <Save size={14} /> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Left — avatar card */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '24px', textAlign: 'center' }}>
          {isEditing ? (
            eAvatarPreview ? (
              <img src={eAvatarPreview} alt="Preview" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 14px', display: 'block' }} />
            ) : (
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#E11D48,#9F1239)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{mkInitials(displayName || 'U')}</span>
              </div>
            )
          ) : (
            selected.avatar ? (
              <img src={selected.avatar} alt="Avatar" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 14px', display: 'block' }} />
            ) : (
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#E11D48,#9F1239)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{mkInitials(displayName || 'U')}</span>
              </div>
            )
          )}
          <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{displayName}</p>
          <UserRoleBadge role={selected.role} />
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}>
            {(isEditing ? eVerified : selected.isEmailVerified)
              ? <><CheckCircle2 size={13} style={{ color: '#16A34A' }} /><span style={{ fontSize: 12.5, color: '#16A34A' }}>Verified</span></>
              : <><AlertCircle size={13} style={{ color: '#D97706' }} /><span style={{ fontSize: 12.5, color: '#D97706' }}>Unverified</span></>}
          </div>
          <div style={{ marginTop: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: isActive ? '#DCFCE7' : '#F3F4F6', color: isActive ? '#16A34A' : '#9CA3AF', border: `1px solid ${isActive ? '#86EFAC' : '#E5E7EB'}` }}>
              {isActive ? 'Active' : `Deactive · ${selected.deletedAt}`}
            </span>
          </div>
          {isEditing && (
            <div style={{ marginTop: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer', padding: '6px 12px', border: '1px solid #E5E7EB', borderRadius: 6, display: 'inline-block', background: '#FAFAFA' }}>
                Change Avatar
                <input type="file" accept="image/*" onChange={handleEditAvatarChange} style={{ display: 'none' }} />
              </label>
            </div>
          )}
        </div>

        {/* Right — info rows */}
        <div style={{ background: '#fff', border: `1px solid ${isEditing ? '#FECDD3' : '#E5E7EB'}`, borderRadius: 14, padding: '22px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>
              {isEditing ? 'Edit User' : 'User Information'}
            </h2>
            {isEditing && <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 10px', background: '#FFF1F3', color: '#E11D48', borderRadius: 20, border: '1px solid #FECDD3' }}>Editing</span>}
          </div>

          {/* userId */}
          <InfoRow label="User ID" readOnly>
            <span style={{ fontSize: 13, color: '#6D28D9', fontFamily: 'ui-monospace, monospace' }}>#{selected.userId}</span>
          </InfoRow>

          {/* fullName */}
          <InfoRow label="Full Name">
            {isEditing ? (
              <input value={eName} onChange={e => setEName(e.target.value)} style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 7, padding: '7px 10px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' }} />
            ) : (
              <span style={{ fontSize: 13.5, color: '#111827' }}>{selected.fullName}</span>
            )}
          </InfoRow>

          {/* email — always read-only */}
          <InfoRow label="Email" readOnly>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Mail size={13} style={{ color: '#9CA3AF' }} />
              <span style={{ fontSize: 13.5, color: isEditing ? '#9CA3AF' : '#111827' }}>{selected.email}</span>
            </div>
            {isEditing && <p style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 3 }}>Cannot be changed — unique key in the database.</p>}
          </InfoRow>

          {/* role */}
          <InfoRow label="Role" readOnly={isEditing}>
            <UserRoleBadge role={selected.role} />
          </InfoRow>

          {/* isEmailVerified */}
          <InfoRow label="Email Verified">
            {isEditing ? (
              <Toggle on={eVerified} onToggle={() => setEVerified(!eVerified)} label="" />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {selected.isEmailVerified ? <CheckCircle2 size={13} style={{ color: '#16A34A' }} /> : <AlertCircle size={13} style={{ color: '#D97706' }} />}
                <span style={{ fontSize: 13.5, color: selected.isEmailVerified ? '#16A34A' : '#D97706' }}>{selected.isEmailVerified ? 'Yes' : 'No'}</span>
              </div>
            )}
          </InfoRow>

          {/* system fields — always read-only */}
          <InfoRow label="Created At" readOnly>
            <span style={{ fontSize: 13.5, color: '#6B7280' }}>{selected.createdAt}</span>
          </InfoRow>
          <InfoRow label="Updated At" readOnly>
            <span style={{ fontSize: 13.5, color: '#6B7280' }}>{selected.updatedAt || '—'}</span>
          </InfoRow>
          <InfoRow label="Deleted At" readOnly>
            <span style={{ fontSize: 13.5, color: '#6B7280' }}>{selected.deletedAt || '—'}</span>
          </InfoRow>
        </div>
      </div>
    </div>
  );
}
