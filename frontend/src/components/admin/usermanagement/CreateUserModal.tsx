import React, { useState } from 'react';
import { X, AlertCircle, Mail, EyeOff, Eye } from 'lucide-react';
import { type RoleName } from './UserRoleBadge';
import { UserRoleGrid } from './UserRoleGrid';
import { Toggle } from './Toggle';

interface CreateUserModalProps {
  onClose: () => void;
  onSave: (data: {
    fullName: string;
    email: string;
    password?: string;
    roleName: string;
    isEmailVerified: boolean;
    avatar_url?: string;
  }) => Promise<void>;
}

export function CreateUserModal({ onClose, onSave }: CreateUserModalProps) {
  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPw, setCPw] = useState('');
  const [cRole, setCRole] = useState<RoleName>('Learner');
  const [cVerified, setCVerified] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [cErr, setCErr] = useState<Record<string, string>>({});
  const [cAvatar, setCAvatar] = useState<string>('');
  const [cAvatarPreview, setCAvatarPreview] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCAvatar(base64String);
        setCAvatarPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const mapFrontendRoleToBackend = (frontendRole: RoleName): string => {
    if (frontendRole === 'Admin') return 'admin';
    if (frontendRole === 'Academic Manager') return 'academic manager';
    if (frontendRole === 'Course Provider') return 'course provider';
    return 'learner';
  };

  const handleCreate = async () => {
    const err: Record<string, string> = {};
    if (!cName.trim()) err.name = 'Required.';
    if (!cEmail.trim()) err.email = 'Required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cEmail)) err.email = 'Invalid email.';

    if (!cPw) err.pw = 'Required.';
    else if (cPw.length < 8) err.pw = 'At least 8 characters.';

    setCErr(err);
    if (Object.keys(err).length > 0) return;

    try {
      setIsSaving(true);
      await onSave({
        fullName: cName,
        email: cEmail,
        password: cPw,
        roleName: mapFrontendRoleToBackend(cRole),
        isEmailVerified: cVerified,
        avatar_url: cAvatar || undefined,
      });
    } catch (e: any) {
      console.error(e);
      setCErr({ api: e.response?.data?.message || 'Failed to create user. Email may already exist.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', width: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 3 }}>Create New User</h3>
            <p style={{ fontSize: 12.5, color: '#9CA3AF' }}>Admin creates the account with a set password.</p>
          </div>
          <button type="button" onClick={onClose} style={{ border: 'none', background: '#F3F4F6', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={13} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {cErr.api && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '10px 14px', borderRadius: 8, fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              <span>{cErr.api}</span>
            </div>
          )}
          {/* Full Name */}
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Full Name <span style={{ color: '#E11D48' }}>*</span></label>
            <input value={cName} onChange={e => setCName(e.target.value)} placeholder="e.g. Nguyen Van An" style={{ width: '100%', border: `1px solid ${cErr.name ? '#FCA5A5' : '#E5E7EB'}`, borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' }} />
            {cErr.name && <p style={{ fontSize: 11.5, color: '#E11D48', marginTop: 4 }}>{cErr.name}</p>}
          </div>
          {/* Avatar Image */}
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Avatar Image</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {cAvatarPreview ? (
                <img src={cAvatarPreview} alt="Preview" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 12 }}>No Pic</div>
              )}
              <input type="file" accept="image/*" onChange={handleCreateAvatarChange} style={{ fontSize: 12, color: '#4B5563' }} />
            </div>
          </div>
          {/* Email */}
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Email <span style={{ color: '#E11D48' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <Mail size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input value={cEmail} onChange={e => setCEmail(e.target.value)} type="email" placeholder="user@example.com" style={{ width: '100%', paddingLeft: 30, border: `1px solid ${cErr.email ? '#FCA5A5' : '#E5E7EB'}`, borderRadius: 8, padding: '9px 12px 9px 30px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' }} />
            </div>
            {cErr.email ? <p style={{ fontSize: 11.5, color: '#E11D48', marginTop: 4 }}>{cErr.email}</p> : <p style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 4 }}>Unique — cannot be changed after creation.</p>}
          </div>
          {/* Password */}
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Password <span style={{ color: '#E11D48' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} value={cPw} onChange={e => setCPw(e.target.value)} placeholder="Min. 8 characters" style={{ width: '100%', border: `1px solid ${cErr.pw ? '#FCA5A5' : '#E5E7EB'}`, borderRadius: 8, padding: '9px 36px 9px 12px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                {showPw ? <EyeOff size={14} style={{ color: '#9CA3AF' }} /> : <Eye size={14} style={{ color: '#9CA3AF' }} />}
              </button>
            </div>
            {cErr.pw && <p style={{ fontSize: 11.5, color: '#E11D48', marginTop: 4 }}>{cErr.pw}</p>}
          </div>
          {/* Role */}
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Role <span style={{ color: '#E11D48' }}>*</span></label>
            <UserRoleGrid value={cRole} onChange={setCRole} />
          </div>
          {/* isEmailVerified */}
          <div style={{ background: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: 9, padding: '10px 14px' }}>
            <Toggle on={cVerified} onToggle={() => setCVerified(!cVerified)} label="Mark email as verified" />
            <p style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 6 }}>Default: false. Admin can override here.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button type="button" onClick={onClose} disabled={isSaving} style={{ flex: 1, padding: '10px', border: '1px solid #E5E7EB', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff' }}>Cancel</button>
          <button type="button" onClick={handleCreate} disabled={isSaving} style={{ flex: 1, padding: '10px', background: '#E11D48', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff', opacity: isSaving ? 0.7 : 1 }}>
            {isSaving ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  );
}
