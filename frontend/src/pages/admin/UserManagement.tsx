import { useState, useEffect } from 'react';
import {
  Search, Plus, Eye, Edit2, Trash2, CheckCircle2, AlertCircle,
  X, ArrowLeft, ExternalLink, Mail, Shield, GraduationCap,
  BookOpen, Building2, EyeOff, Save, ArrowUpDown
} from 'lucide-react';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/user/user.service';

// User entity: { userId, fullName (nullable), email (unique), password (select:false),
//   avatar (nullable), isEmailVerified (default false),
//   createdAt, updatedAt, deletedAt (soft-delete) }
// Role entity: { roleId, roleName } — Admin | Academic Manager | Course Provider | Learner

type RoleName = 'Admin' | 'Academic Manager' | 'Course Provider' | 'Learner';
type View = 'table' | 'detail' | 'edit';

interface UserRow {
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

const ROLE_CFG: Record<RoleName, { bg: string; color: string; icon: React.ReactNode }> = {
  Admin: { bg: '#FFF1F3', color: '#E11D48', icon: <Shield size={13} /> },
  "Academic Manager": { bg: '#F0FDF4', color: '#16A34A', icon: <Building2 size={13} /> },
  'Course Provider': { bg: '#F5F3FF', color: '#7C3AED', icon: <BookOpen size={13} /> },
  Learner: { bg: '#EFF6FF', color: '#2563EB', icon: <GraduationCap size={13} /> },
};

const mapBackendRoleToFrontend = (backendRole: string): RoleName => {
  const lower = backendRole.toLowerCase();
  if (lower === 'admin') return 'Admin';
  if (lower === 'academic manager') return 'Academic Manager';
  if (lower === 'course provider') return 'Course Provider';
  return 'Learner';
};

const mapFrontendRoleToBackend = (frontendRole: RoleName): string => {
  if (frontendRole === 'Admin') return 'admin';
  if (frontendRole === 'Academic Manager') return 'academic manager';
  if (frontendRole === 'Course Provider') return 'course provider';
  return 'learner';
};

const mkInitials = (name: string) => name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);

export function UserManagement() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('table');
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleName | 'ALL'>('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [savedToast, setSavedToast] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Create form
  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPw, setCPw] = useState('');
  const [cRole, setCRole] = useState<RoleName>('Learner');
  const [cVerified, setCVerified] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [cErr, setCErr] = useState<Record<string, string>>({});
  const [cAvatar, setCAvatar] = useState<string>('');
  const [cAvatarPreview, setCAvatarPreview] = useState<string>('');

  // Edit form (synced from selected)
  const [eName, setEName] = useState('');
  const [eRole, setERole] = useState<RoleName>('Learner');
  const [eVerified, setEVerified] = useState(false);
  const [eAvatar, setEAvatar] = useState<string>('');
  const [eAvatarPreview, setEAvatarPreview] = useState<string>('');

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

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      const mapped = data.map((u: any) => ({
        userId: u.userId,
        fullName: u.fullName || '',
        email: u.email,
        initials: mkInitials(u.fullName || 'U'),
        isEmailVerified: u.isEmailVerified,
        createdAt: new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        updatedAt: u.updatedAt ? new Date(u.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
        deletedAt: u.deletedAt ? new Date(u.deletedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null,
        role: mapBackendRoleToFrontend(u.role?.roleName || 'learner'),
        avatar: u.avatar || u.avatarUrl || null,
      }));
      setUsers(mapped);
    } catch (err) {
      console.error('Failed to load users from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const counts = {
    ALL: users.length,
    Admin: users.filter(u => u.role === 'Admin').length,
    "Academic Manager": users.filter(u => u.role === 'Academic Manager').length,
    'Course Provider': users.filter(u => u.role === 'Course Provider').length,
    Learner: users.filter(u => u.role === 'Learner').length,
  };

  const filtered = users.filter(u =>
    (roleFilter === 'ALL' || u.role === roleFilter) &&
    u.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const nameA = (a.fullName || '').trim().toLowerCase();
    const nameB = (b.fullName || '').trim().toLowerCase();
    if (nameA < nameB) return sortOrder === 'asc' ? -1 : 1;
    if (nameA > nameB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const goDetail = (u: UserRow) => { setSelected(u); setView('detail'); };
  const goEdit = (u: UserRow) => {
    setSelected(u);
    setEName(u.fullName); setERole(u.role); setEVerified(u.isEmailVerified);
    setEAvatar(u.avatar || ''); setEAvatarPreview(u.avatar || '');
    setView('edit');
  };
  const goBack = () => { setView('table'); setSelected(null); };

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
      await createUser({
        fullName: cName,
        email: cEmail,
        password: cPw,
        roleName: mapFrontendRoleToBackend(cRole),
        isEmailVerified: cVerified,
        avatar_url: cAvatar || undefined,
      });
      await loadUsers();
      setCName(''); setCEmail(''); setCPw(''); setCRole('Learner'); setCVerified(false); setCErr({});
      setCAvatar(''); setCAvatarPreview('');
      setShowCreate(false);
      setSavedToast(true); setTimeout(() => setSavedToast(false), 2500);
    } catch (e: any) {
      console.error(e);
      setCErr({ api: e.response?.data?.message || 'Failed to create user. Email may already exist.' });
    }
  };

  const handleSaveEdit = async () => {
    if (!selected) return;
    try {
      await updateUser(selected.userId, {
        fullName: eName,
        isEmailVerified: eVerified,
        avatar_url: eAvatar || undefined,
      });
      await loadUsers();
      setSelected(null);
      setSavedToast(true); setTimeout(() => setSavedToast(false), 2500);
      setView('table');
    } catch (e) {
      console.error('Failed to update user:', e);
    }
  };

  const softDelete = async (id: number) => {
    try {
      await deleteUser(id);
      await loadUsers();
      setDeleteId(null);
      if (view !== 'table') goBack();
    } catch (e) {
      console.error('Failed to delete user:', e);
    }
  };

  // ── Shared sub-components ──────────────────────────────────────────────────

  const RoleBadge = ({ role }: { role: RoleName }) => {
    const c = ROLE_CFG[role];
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: c.bg, color: c.color }}>{c.icon} {role}</span>;
  };

  const RoleGrid = ({ value, onChange }: { value: RoleName; onChange: (r: RoleName) => void }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {(['Admin', 'Academic Manager', 'Course Provider', 'Learner'] as RoleName[]).map(r => {
        const c = ROLE_CFG[r];
        return (
          <button key={r} onClick={() => onChange(r)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', border: `1.5px solid ${value === r ? c.color : '#E5E7EB'}`, borderRadius: 9, background: value === r ? c.bg : '#FAFAFA', cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ color: c.color }}>{c.icon}</span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: value === r ? c.color : '#374151' }}>{r}</span>
          </button>
        );
      })}
    </div>
  );

  const Toggle = ({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 13.5, color: '#374151' }}>{label}</span>
      <button onClick={onToggle} style={{ width: 40, height: 22, borderRadius: 11, background: on ? '#16A34A' : '#D1D5DB', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 16, height: 16, background: '#fff', borderRadius: '50%', transition: 'left 0.2s' }} />
      </button>
    </div>
  );

  // Row in the detail/edit info panel
  const InfoRow = ({ label, children, readOnly }: { label: string; children: React.ReactNode; readOnly?: boolean }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'start', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#6B7280' }}>{label}</span>
        {readOnly && <span style={{ fontSize: 10, color: '#9CA3AF', background: '#F3F4F6', padding: '1px 6px', borderRadius: 4 }}>read-only</span>}
      </div>
      <div>{children}</div>
    </div>
  );

  // ── DETAIL / EDIT shared layout ────────────────────────────────────────────
  const isEditing = view === 'edit';

  if ((view === 'detail' || view === 'edit') && selected) {
    const isActive = !selected.deletedAt;
    const displayName = isEditing ? eName : selected.fullName;

    return (
      <div style={{ fontFamily: "'Inter', sans-serif", background: '#F8FAFC', minHeight: '100vh', padding: '28px 32px' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <button onClick={goBack} style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13.5, fontWeight: 500, color: '#6B7280' }}>
            <ArrowLeft size={15} /> Back to User Management
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            {isEditing && (
              <button onClick={handleSaveEdit} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: '#E11D48', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff' }}>
                <Save size={14} /> Save Changes
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20, alignItems: 'start' }}>
          {/* Left — avatar card */}
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '24px', textAlign: 'center' }}>
            {isEditing ? (
              eAvatarPreview ? (
                <img src={eAvatarPreview} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 14px', display: 'block' }} />
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#E11D48,#9F1239)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{mkInitials(displayName || 'U')}</span>
                </div>
              )
            ) : (
              selected.avatar ? (
                <img src={selected.avatar} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 14px', display: 'block' }} />
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#E11D48,#9F1239)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{mkInitials(displayName || 'U')}</span>
                </div>
              )
            )}
            <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{displayName}</p>
            <RoleBadge role={isEditing ? eRole : selected.role} />
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
                <input value={eName} onChange={e => setEName(e.target.value)} style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 7, padding: '7px 10px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' as const }} />
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
              <RoleBadge role={isEditing ? eRole : selected.role} />
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
            {[['Created At', selected.createdAt], ['Updated At', selected.updatedAt], ['Deleted At', selected.deletedAt ?? '—']].map(([l, v]) => (
              <InfoRow key={l} label={l} readOnly>
                <span style={{ fontSize: 13.5, color: '#6B7280' }}>{v}</span>
              </InfoRow>
            ))}
          </div>
        </div>

        {deleteId !== null && <DeleteConfirm id={deleteId} onCancel={() => setDeleteId(null)} onConfirm={softDelete} />}
        {savedToast && <Toast msg="User saved successfully." />}
      </div>
    );
  }

  // ── TABLE VIEW ─────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F8FAFC', minHeight: '100vh', padding: '28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px', marginBottom: 4 }}>User Management</h1>
          <p style={{ fontSize: 13.5, color: '#6B7280' }}>{users.length} total · {users.filter(u => !u.deletedAt).length} active</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#E11D48', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff' }}>
          <Plus size={14} /> Create User
        </button>
      </div>

      {/* Role stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {(['Admin', 'Academic Manager', 'Course Provider', 'Learner'] as RoleName[]).map(role => {
          const c = ROLE_CFG[role];
          return (
            <div key={role} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: c.color, marginBottom: 3 }}>{counts[role]}</p>
              <p style={{ fontSize: 12.5, color: '#6B7280' }}>{role}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#F3F4F6', borderRadius: 8, padding: '7px 12px', gap: 7, flex: '1 1 220px', maxWidth: 320 }}>
          <Search size={13} style={{ color: '#9CA3AF' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name..." style={{ border: 'none', background: 'transparent', fontSize: 13, color: '#374151', outline: 'none', width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['ALL', 'Admin', 'Academic Manager', 'Course Provider', 'Learner'] as const).map(r => (
            <button key={r} onClick={() => setRoleFilter(r)} style={{ padding: '6px 12px', borderRadius: 7, border: `1px solid ${roleFilter === r ? '#E11D48' : '#E5E7EB'}`, background: roleFilter === r ? '#FFF1F3' : '#fff', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, color: roleFilter === r ? '#E11D48' : '#6B7280', whiteSpace: 'nowrap' }}>
              {r === 'ALL' ? `All (${counts.ALL})` : r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  User
                  <ArrowUpDown size={12} style={{ color: '#E11D48' }} />
                </div>
              </th>
              <th style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>Role</th>
              <th style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>Email Verified</th>
              <th style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>Created At</th>
              <th style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>Status</th>
              <th style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11.5, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px', textAlign: 'center', fontSize: 13.5, color: '#9CA3AF' }}>
                  Loading users...
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', fontSize: 13.5, color: '#9CA3AF' }}>No users found.</td></tr>
            ) : sorted.map((u, i) => {
              const isActive = !u.deletedAt;
              return (
                <tr key={u.userId} style={{ borderBottom: i < sorted.length - 1 ? '1px solid #F3F4F6' : 'none', opacity: isActive ? 1 : 0.5 }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFA')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {u.avatar ? (
                        <img src={u.avatar} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#E11D48,#9F1239)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{u.initials}</span>
                        </div>
                      )}
                      <div>
                        <p style={{ fontSize: 13.5, fontWeight: 500, color: '#111827' }}>{u.fullName}</p>
                        <p style={{ fontSize: 12, color: '#9CA3AF' }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: ROLE_CFG[u.role].bg, color: ROLE_CFG[u.role].color }}>
                      {ROLE_CFG[u.role].icon} {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      {u.isEmailVerified ? <><CheckCircle2 size={13} style={{ color: '#16A34A' }} /><span style={{ fontSize: 12.5, color: '#16A34A' }}>Verified</span></> : <><AlertCircle size={13} style={{ color: '#D97706' }} /><span style={{ fontSize: 12.5, color: '#D97706' }}>Unverified</span></>}
                    </div>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 12.5, color: '#9CA3AF' }}>{u.createdAt}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 9px', borderRadius: 20, background: isActive ? '#DCFCE7' : '#F3F4F6', color: isActive ? '#16A34A' : '#9CA3AF', border: `1px solid ${isActive ? '#86EFAC' : '#E5E7EB'}` }}>
                      {isActive ? 'Active' : 'Deactive'}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => goDetail(u)} style={{ width: 28, height: 28, border: '1px solid #E5E7EB', borderRadius: 6, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Eye size={13} style={{ color: '#6B7280' }} />
                      </button>
                      {isActive && <>
                        <button onClick={() => goEdit(u)} style={{ width: 28, height: 28, border: '1px solid #E5E7EB', borderRadius: 6, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <Edit2 size={13} style={{ color: '#6B7280' }} />
                        </button>
                        <button onClick={() => setDeleteId(u.userId)} style={{ width: 28, height: 28, border: '1px solid #E5E7EB', borderRadius: 6, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <Trash2 size={13} style={{ color: '#9CA3AF' }} />
                        </button>
                      </>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', width: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 3 }}>Create New User</h3>
                <p style={{ fontSize: 12.5, color: '#9CA3AF' }}>Admin creates the account with a set password.</p>
              </div>
              <button onClick={() => setShowCreate(false)} style={{ border: 'none', background: '#F3F4F6', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} /></button>
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
                <input value={cName} onChange={e => setCName(e.target.value)} placeholder="e.g. Nguyen Van An" style={{ width: '100%', border: `1px solid ${cErr.name ? '#FCA5A5' : '#E5E7EB'}`, borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' as const }} />
                {cErr.name && <p style={{ fontSize: 11.5, color: '#E11D48', marginTop: 4 }}>{cErr.name}</p>}
              </div>
              {/* Avatar Image */}
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Avatar Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {cAvatarPreview ? (
                    <img src={cAvatarPreview} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
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
                  <input value={cEmail} onChange={e => setCEmail(e.target.value)} type="email" placeholder="user@example.com" style={{ width: '100%', paddingLeft: 30, border: `1px solid ${cErr.email ? '#FCA5A5' : '#E5E7EB'}`, borderRadius: 8, padding: '9px 12px 9px 30px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' as const }} />
                </div>
                {cErr.email ? <p style={{ fontSize: 11.5, color: '#E11D48', marginTop: 4 }}>{cErr.email}</p> : <p style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 4 }}>Unique — cannot be changed after creation.</p>}
              </div>
              {/* Password */}
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Password <span style={{ color: '#E11D48' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} value={cPw} onChange={e => setCPw(e.target.value)} placeholder="Min. 8 characters" style={{ width: '100%', border: `1px solid ${cErr.pw ? '#FCA5A5' : '#E5E7EB'}`, borderRadius: 8, padding: '9px 36px 9px 12px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' as const }} />
                  <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                    {showPw ? <EyeOff size={14} style={{ color: '#9CA3AF' }} /> : <Eye size={14} style={{ color: '#9CA3AF' }} />}
                  </button>
                </div>
                {cErr.pw && <p style={{ fontSize: 11.5, color: '#E11D48', marginTop: 4 }}>{cErr.pw}</p>}
              </div>
              {/* Role */}
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Role <span style={{ color: '#E11D48' }}>*</span></label>
                <RoleGrid value={cRole} onChange={setCRole} />
              </div>
              {/* isEmailVerified */}
              <div style={{ background: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: 9, padding: '10px 14px' }}>
                <Toggle on={cVerified} onToggle={() => setCVerified(!cVerified)} label="Mark email as verified" />
                <p style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 6 }}>Default: false. Admin can override here.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: '10px', border: '1px solid #E5E7EB', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff' }}>Cancel</button>
              <button onClick={handleCreate} style={{ flex: 1, padding: '10px', background: '#E11D48', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff' }}>Create User</button>
            </div>
          </div>
        </div>
      )}

      {deleteId !== null && <DeleteConfirm id={deleteId} onCancel={() => setDeleteId(null)} onConfirm={softDelete} />}
      {savedToast && <Toast msg="User saved successfully." />}
    </div>
  );
}

function DeleteConfirm({ id, onCancel, onConfirm }: { id: number; onCancel: () => void; onConfirm: (id: number) => void }) {
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
          <button onClick={onCancel} style={{ flex: 1, padding: '10px', border: '1px solid #E5E7EB', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff' }}>Cancel</button>
          <button onClick={() => onConfirm(id)} style={{ flex: 1, padding: '10px', background: '#E11D48', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff' }}>Delete User</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ msg }: { msg: string }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#111827', borderRadius: 10, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 400 }}>
      <CheckCircle2 size={16} style={{ color: '#4ADE80' }} />
      <span style={{ fontSize: 13.5, fontWeight: 500, color: '#fff' }}>{msg}</span>
    </div>
  );
}
