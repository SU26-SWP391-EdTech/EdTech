import { Edit3, Mail, Save, X } from 'lucide-react';
import type { ProviderProfileMini } from '../../../types/user/provider-profile.types';

const ProfileMini = ({ profile, fullName, editing, setEditing, setFullName, save, isSaving, cancel, user, avatarFile, setAvatarFile, canEdit }: ProviderProfileMini) => {
    const initials = fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'P';
    const currentAvatarUrl = profile?.avatarUrl || user?.avatarUrl || user?.avatar || '';
    const hasAvatar = !!(currentAvatarUrl && currentAvatarUrl.trim() !== "" && currentAvatarUrl !== "null");
    
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '24px', textAlign: 'center' }}>
            {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                    {avatarFile ? (
                        <img src={URL.createObjectURL(avatarFile)} alt="Preview" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : hasAvatar ? (
                        <img src={currentAvatarUrl} alt={fullName} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#E11D48,#9F1239)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{initials}</span>
                        </div>
                    )}
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#E11D48', cursor: 'pointer', background: '#FFF1F2', padding: '4px 8px', borderRadius: 6, border: '1px dashed #FDA4AF' }}>
                        Change Avatar
                        <input type="file" accept="image/*" onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                                setAvatarFile(e.target.files[0]);
                            }
                        }} style={{ display: 'none' }} />
                    </label>
                </div>
            ) : (
                hasAvatar ? (
                    <img src={currentAvatarUrl} alt={fullName} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 14px', display: 'block' }} />
                ) : (
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#E11D48,#9F1239)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                        <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{initials}</span>
                    </div>
                )
            )}
            {editing ? (
                <input value={fullName} onChange={e => setFullName(e.target.value)} style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '7px 10px', fontSize: 15, fontWeight: 700, color: '#111827', outline: 'none', textAlign: 'center', boxSizing: 'border-box' as const, marginBottom: 8 }} />
            ) : (
                <p style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{fullName}</p>
            )}
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>Course Provider</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginBottom: 12 }}>
                <Mail size={13} style={{ color: '#9CA3AF' }} />
                <span style={{ fontSize: 12.5, color: '#6B7280' }}>{user?.email}</span>
            </div>
            <p style={{ fontSize: 11.5, color: '#9CA3AF', marginBottom: 14 }}>Member since {formatDate(user?.createdAt)}</p>
            
            {canEdit && (
                editing ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={save} disabled={isSaving} style={{ flex: 1,  padding: '8px', background: isSaving ? '#FDA4AF' : '#E11D48', border: 'none', borderRadius: 8, cursor: isSaving ? 'not-allowed' : 'pointer', fontSize: 12.5, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                            {isSaving ? (
                                <>
                                    <span style={{ width: 12, height: 12, border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={13} /> Save
                                </>
                            )}
                        </button>
                        <button onClick={cancel} disabled={isSaving} style={{ flex: 1,  padding: '8px', border: '1px solid #E5E7EB', borderRadius: 8, cursor: isSaving ? 'not-allowed' : 'pointer', fontSize: 12.5, fontWeight: 500, color: '#374151', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                            <X size={13} /> Cancel
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setEditing(true)} style={{ width: '100%', padding: '8px', border: '1px solid #E5E7EB', borderRadius: 8, cursor: 'pointer', fontSize: 12.5, fontWeight: 500, color: '#374151', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}><Edit3 size={13} /> Edit Profile</button>
                )
            )}
        </div>
    );
};

export default ProfileMini;
