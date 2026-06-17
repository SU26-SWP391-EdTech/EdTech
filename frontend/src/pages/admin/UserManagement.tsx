import { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, ArrowUpDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/user/user.service';
import { type RoleName, ROLE_CFG } from '../../components/admin/usermanagement/UserRoleBadge';
import { DeleteConfirmModal } from '../../components/admin/usermanagement/DeleteConfirmModal';
import { Toast } from '../../components/admin/usermanagement/Toast';
import { CreateUserModal } from '../../components/admin/usermanagement/CreateUserModal';
import { UserDetailView, type UserRow } from '../../components/admin/usermanagement/UserDetailView';

type View = 'table' | 'detail' | 'edit';

const mkInitials = (name: string) => name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);

const mapBackendRoleToFrontend = (backendRole: string): RoleName => {
  const lower = backendRole.toLowerCase();
  if (lower === 'admin') return 'Admin';
  if (lower === 'academic manager') return 'Academic Manager';
  if (lower === 'course provider') return 'Course Provider';
  return 'Learner';
};

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
  const goEdit = (u: UserRow) => { setSelected(u); setView('edit'); };
  const goBack = () => { setView('table'); setSelected(null); };

  const handleCreate = async (data: any) => {
    await createUser(data);
    await loadUsers();
    setShowCreate(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleSaveEdit = async (data: any) => {
    if (!selected) return;
    await updateUser(selected.userId, data);
    await loadUsers();
    setSelected(null);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
    setView('table');
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

  if ((view === 'detail' || view === 'edit') && selected) {
    return (
      <UserDetailView
        selected={selected}
        isEditing={view === 'edit'}
        onBack={goBack}
        onSave={handleSaveEdit}
      />
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
                      {u.isEmailVerified ? (
                        <>
                          <CheckCircle2 size={13} style={{ color: '#16A34A' }} />
                          <span style={{ fontSize: 12.5, color: '#16A34A' }}>Verified</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={13} style={{ color: '#D97706' }} />
                          <span style={{ fontSize: 12.5, color: '#D97706' }}>Unverified</span>
                        </>
                      )}
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
                      {isActive && (
                        <>
                          <button onClick={() => goEdit(u)} style={{ width: 28, height: 28, border: '1px solid #E5E7EB', borderRadius: 6, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Edit2 size={13} style={{ color: '#6B7280' }} />
                          </button>
                          <button onClick={() => setDeleteId(u.userId)} style={{ width: 28, height: 28, border: '1px solid #E5E7EB', borderRadius: 6, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Trash2 size={13} style={{ color: '#9CA3AF' }} />
                          </button>
                        </>
                      )}
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
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onSave={handleCreate}
        />
      )}

      {deleteId !== null && (
        <DeleteConfirmModal
          id={deleteId}
          onCancel={() => setDeleteId(null)}
          onConfirm={softDelete}
        />
      )}
      {savedToast && <Toast msg="User saved successfully." />}
    </div>
  );
}
