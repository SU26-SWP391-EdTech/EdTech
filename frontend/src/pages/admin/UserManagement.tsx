import { useState, useMemo } from 'react';
import {
  Search, Download, Eye, Edit2, Trash2,
  Plus, X, ChevronDown,
  ArrowUpDown, Mail,
  Shield, GraduationCap, Building2, BookOpen,
  Check, AlertCircle, Clock, Ban
} from 'lucide-react';

/* ─── Types ─── */
type Role = 'Admin' | 'Learner' | 'Academic Manager' | 'Course Provider';
type Status = 'Active' | 'Pending' | 'Suspended' | 'Inactive';

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: Status;
  joined: string;
  avatar: string;
  avatarColor: string;
  lastSeen: string;
  updatedAt?: string;
}

/* ─── Mock data ─── */
const MOCK_USERS: User[] = [
  { id: 1, name: 'Alexandra Moore', email: 'a.moore@company.com', role: 'Admin', status: 'Active', joined: 'Jan 12, 2026', avatar: 'AM', avatarColor: '#E11D48', lastSeen: '2m ago' },
  { id: 2, name: 'James Wilson', email: 'j.wilson@corp.io', role: 'Course Provider', status: 'Active', joined: 'Jan 28, 2026', avatar: 'JW', avatarColor: '#7C3AED', lastSeen: '1h ago' },
  { id: 3, name: 'Nina Patel', email: 'n.patel@edu.org', role: 'Learner', status: 'Active', joined: 'Feb 5, 2026', avatar: 'NP', avatarColor: '#2563EB', lastSeen: '3h ago' },
  { id: 4, name: 'Robert Chen', email: 'r.chen@globalfirm.com', role: 'Academic Manager', status: 'Pending', joined: 'Feb 20, 2026', avatar: 'RC', avatarColor: '#16A34A', lastSeen: '1d ago' },
  { id: 5, name: 'Sophia Turner', email: 's.turner@learnhub.co', role: 'Learner', status: 'Inactive', joined: 'Mar 2, 2026', avatar: 'ST', avatarColor: '#D97706', lastSeen: '12d ago' },
  { id: 6, name: 'Marcus Davis', email: 'm.davis@edtech.io', role: 'Course Provider', status: 'Active', joined: 'Mar 14, 2026', avatar: 'MD', avatarColor: '#0891B2', lastSeen: '5h ago' },
  { id: 7, name: 'Priya Nair', email: 'p.nair@techacademy.org', role: 'Learner', status: 'Pending', joined: 'Apr 1, 2026', avatar: 'PN', avatarColor: '#DB2777', lastSeen: '2d ago' },
  { id: 8, name: 'Carlos Rivera', email: 'c.rivera@institution.co', role: 'Course Provider', status: 'Suspended', joined: 'Apr 9, 2026', avatar: 'CR', avatarColor: '#9333EA', lastSeen: '8d ago' },
  { id: 9, name: 'Lena Park', email: 'l.park@company.com', role: 'Admin', status: 'Active', joined: 'Apr 22, 2026', avatar: 'LP', avatarColor: '#059669', lastSeen: '30m ago' },
  { id: 10, name: 'Derek Foster', email: 'd.foster@learnspace.net', role: 'Learner', status: 'Active', joined: 'May 3, 2026', avatar: 'DF', avatarColor: '#EA580C', lastSeen: '4h ago' },
  { id: 11, name: 'Yasmin Al-Hassan', email: 'y.hassan@pathways.edu', role: 'Academic Manager', status: 'Active', joined: 'May 10, 2026', avatar: 'YH', avatarColor: '#0284C7', lastSeen: '1h ago' },
  { id: 12, name: 'Thomas Klein', email: 't.klein@enterprise.de', role: 'Learner', status: 'Inactive', joined: 'May 18, 2026', avatar: 'TK', avatarColor: '#6B7280', lastSeen: '20d ago' },
];

/* ─── Config maps ─── */
const roleConfig: Record<Role, { label: string; icon: React.ReactNode; cls: string }> = {
  'Admin': { label: 'Admin', icon: <Shield className="w-3 h-3" />, cls: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]' },
  'Learner': { label: 'Learner', icon: <GraduationCap className="w-3 h-3" />, cls: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]' },
  'Academic Manager': { label: 'Academic Manager', icon: <Building2 className="w-3 h-3" />, cls: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]' },
  'Course Provider': { label: 'Course Provider', icon: <BookOpen className="w-3 h-3" />, cls: 'bg-[#F0FDFA] text-[#0891B2] border-[#A5F3FC]' },
};

const statusConfig: Record<Status, { icon: React.ReactNode; cls: string }> = {
  'Active': { icon: <Check className="w-2.5 h-2.5" />, cls: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]' },
  'Pending': { icon: <Clock className="w-2.5 h-2.5" />, cls: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]' },
  'Suspended': { icon: <Ban className="w-2.5 h-2.5" />, cls: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]' },
  'Inactive': { icon: <AlertCircle className="w-2.5 h-2.5" />, cls: 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB]' },
};

const ROLES: ('All Roles' | Role)[] = ['All Roles', 'Admin', 'Learner', 'Academic Manager', 'Course Provider'];
const STATUSES: ('All Status' | Status)[] = ['All Status', 'Active', 'Pending', 'Suspended', 'Inactive'];

/* ─── Sub-components ─── */
function RoleBadge({ role }: { role: Role }) {
  const cfg = roleConfig[role];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border ${cfg.cls}`} style={{ fontWeight: 500 }}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const cfg = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${cfg.cls}`} style={{ fontWeight: 500 }}>
      {cfg.icon}{status}
    </span>
  );
}

function FilterSelect({ value, options, onChange }: {
  value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#374151] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 cursor-pointer hover:border-[#D1D5DB] transition-colors"
        style={{ fontWeight: 400 }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF] pointer-events-none" />
    </div>
  );
}

/* ─── User Modal (Create/Edit) ─── */
interface UserModalProps {
  user?: User;
  onClose: () => void;
  onSave: (userData: { name: string; email: string; role: Role; status: Status; avatar: string; avatarColor: string }) => void;
}

function UserModal({ user, onClose, onSave }: UserModalProps) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [formRole, setFormRole] = useState<Role>(user?.role || 'Learner');
  const [formStatus, setFormStatus] = useState<Status>(user?.status || 'Active');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [avatarColor] = useState(user?.avatarColor || ['#E11D48', '#7C3AED', '#2563EB', '#16A34A', '#D97706', '#0891B2'][Math.floor(Math.random() * 6)]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Full Name is required');
      return;
    }
    if (!email.trim()) {
      alert('Email Address is required');
      return;
    }
    if (!user && !password.trim()) {
      alert('Temporary Password is required');
      return;
    }
    onSave({
      name,
      email,
      role: formRole,
      status: formStatus,
      avatar: avatar || name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      avatarColor,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#111827]/25 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[480px] mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F3F4F6] flex items-start justify-between">
          <div>
            <h2 className="text-[#111827]" style={{ fontSize: '17px', fontWeight: 700 }}>
              {user ? 'Edit User' : 'Create New User'}
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {user ? 'Modify user details and roles.' : 'Add a new user to the platform and assign their role.'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors">
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">

          {/* Avatar Upload */}
          <div className="flex items-center gap-4 py-2 border-b border-[#F3F4F6] mb-1">
            <div className="relative">
              {avatar.startsWith('http') || avatar.startsWith('data:') ? (
                <img src={avatar} alt="Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-[#E11D48]/20" />
              ) : (
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white text-base font-bold"
                  style={{ backgroundColor: avatarColor }}
                >
                  {avatar || (name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?')}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="avatar-upload" className="text-xs text-[#E11D48] hover:text-[#BE123C] cursor-pointer font-semibold transition-colors">
                Upload Photo
              </label>
              <p className="text-[10px] text-[#9CA3AF]">JPG, PNG or GIF. Max size 2MB.</p>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Full Name <span className="text-[#E11D48]">*</span></label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Alexandra Moore"
              className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Email Address <span className="text-[#E11D48]">*</span></label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                disabled={!!user}
                className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm transition-colors ${user
                    ? 'bg-[#F3F4F6] text-[#9CA3AF] border-[#E5E7EB] cursor-not-allowed'
                    : 'bg-white border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15'
                  }`}
              />
            </div>
          </div>

          {/* Role + Status row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Role <span className="text-[#E11D48]">*</span></label>
              <div className="relative">
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value as Role)}
                  disabled={!!user}
                  className={`w-full appearance-none pl-3 pr-8 py-2.5 border rounded-xl text-sm transition-colors ${user
                      ? 'bg-[#F3F4F6] text-[#9CA3AF] border-[#E5E7EB] cursor-not-allowed'
                      : 'bg-white border-[#E5E7EB] text-[#111827] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15'
                    }`}
                >
                  {(['Admin', 'Learner', 'Academic Manager', 'Course Provider'] as Role[]).map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {!user && <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />}
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Status</label>
              <div className="relative">
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as Status)}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15"
                >
                  {(['Active', 'Pending', 'Suspended', 'Inactive'] as Status[]).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Password */}
          {!user && (
            <div>
              <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Temporary Password <span className="text-[#E11D48]">*</span></label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 transition-colors"
              />
              <p className="text-xs text-[#9CA3AF] mt-1">User will be prompted to change on first login.</p>
            </div>
          )}

          {/* Role preview badge */}
          <div className="flex items-center gap-2 px-3 py-2.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl">
            <span className="text-xs text-[#6B7280]">Role preview:</span>
            <RoleBadge role={formRole} />
            <span className="mx-1 text-[#E5E7EB]">·</span>
            <StatusBadge status={formStatus} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F3F4F6] flex items-center justify-between bg-[#FAFAFA]">
          <p className="text-xs text-[#9CA3AF]">Fields marked <span className="text-[#E11D48]">*</span> are required</p>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#374151] rounded-lg text-sm hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors"
              style={{ fontWeight: 500 }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors"
              style={{ fontWeight: 500 }}
            >
              {user ? 'Save Changes' : <><Plus className="w-4 h-4" /> Create User</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─── */
export function UserManagement() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All Roles');
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [sortField, setSortField] = useState<'name' | 'joined'>('joined');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    return users
      .filter(u => {
        const q = search.toLowerCase();
        const matchQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
        const matchRole = roleFilter === 'All Roles' || u.role === roleFilter;
        const matchStatus = statusFilter === 'All Status' || u.status === statusFilter;
        return matchQ && matchRole && matchStatus;
      })
      .sort((a, b) => {
        const dir = sortAsc ? 1 : -1;
        return sortField === 'name'
          ? a.name.localeCompare(b.name) * dir
          : (a.id - b.id) * dir;
      });
  }, [users, search, roleFilter, statusFilter, sortField, sortAsc]);



  const toggleSort = (field: 'name' | 'joined') => {
    if (sortField === field) setSortAsc(a => !a);
    else { setSortField(field); setSortAsc(true); }
  };

  const handleSaveUser = (userData: { name: string; email: string; role: Role; status: Status; avatar: string; avatarColor: string }) => {
    if (selectedUser) {
      setUsers(users.map(u => u.id === selectedUser.id ? { 
        ...u, 
        ...userData, 
        updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      } : u));
    } else {
      // Create mode
      const newUser: User = {
        id: Math.max(0, ...users.map(u => u.id)) + 1,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        avatar: userData.avatar,
        avatarColor: userData.avatarColor,
        joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lastSeen: 'Just now'
      };
      setUsers([...users, newUser]);
    }
    setShowModal(false);
  };

  const handleDeleteUser = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <>
      <div className="bg-[#F8FAFC] min-h-screen">
        <div className="max-w-[1376px] mx-auto px-8 py-8">

          {/* ── Page Header ── */}
          <div className="mb-7">
            {/* Breadcrumb */}
            {/* <div className="flex items-center gap-1.5 mb-3">
              <Home className="w-3.5 h-3.5 text-[#9CA3AF]" />
              {['Platform', 'Admin', 'Users'].map((crumb, i, arr) => (
                <div key={crumb} className="flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-[#D1D5DB]" />
                  <span
                    className={`text-xs ${i === arr.length - 1 ? 'text-[#111827]' : 'text-[#6B7280] hover:text-[#111827] cursor-pointer'}`}
                    style={{ fontWeight: i === arr.length - 1 ? 500 : 400 }}
                  >{crumb}</span>
                </div>
              ))}
            </div> */}
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-[#111827] mb-1" style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1.2 }}>
                  User Management
                </h1>
                <p className="text-[#6B7280] text-sm">
                  Manage platform users, assign roles, and control access permissions across the organization.
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <button className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#374151] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] transition-colors" style={{ fontWeight: 500 }}>
                  <Download className="w-4 h-4" /> Export
                </button>
                <button
                  onClick={() => { setSelectedUser(undefined); setShowModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  <Plus className="w-4 h-4" /> Create User
                </button>
              </div>
            </div>
          </div>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-12 gap-5">

            {/* Left: Table (9 cols) */}
            <div className="col-span-12 flex flex-col gap-4">

              {/* Toolbar */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl px-4 py-3.5 flex items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 transition-colors"
                  />
                </div>

                <div className="h-5 w-px bg-[#E5E7EB]" />

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <FilterSelect value={roleFilter} options={ROLES} onChange={setRoleFilter} />
                  <FilterSelect value={statusFilter} options={STATUSES} onChange={setStatusFilter} />
                </div>

                <div className="h-5 w-px bg-[#E5E7EB]" />

                {/* Sort */}
                <button
                  onClick={() => toggleSort('name')}
                  className="flex items-center gap-1.5 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#6B7280] hover:bg-[#F8FAFC] hover:border-[#D1D5DB] transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" /> Sort by Name
                </button>

                <div className="ml-auto flex items-center gap-2">
                  {/* Results count */}
                  <span className="text-xs text-[#9CA3AF]">
                    {filtered.length} of {users.length} users
                  </span>
                  {(search || roleFilter !== 'All Roles' || statusFilter !== 'All Status') && (
                    <button
                      onClick={() => { setSearch(''); setRoleFilter('All Roles'); setStatusFilter('All Status'); }}
                      className="flex items-center gap-1 text-xs text-[#E11D48] hover:text-[#BE123C]"
                      style={{ fontWeight: 500 }}
                    >
                      <X className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
                {filtered.length === 0 ? (
                  /* Inline empty state when filters yield no results */
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-12 h-12 bg-[#F3F4F6] rounded-2xl flex items-center justify-center mb-3">
                      <Search className="w-6 h-6 text-[#D1D5DB]" />
                    </div>
                    <p className="text-sm text-[#111827]" style={{ fontWeight: 600 }}>No users found</p>
                    <p className="text-xs text-[#6B7280] mt-1 mb-4">Try adjusting your search or filter criteria.</p>
                    <button
                      onClick={() => { setSearch(''); setRoleFilter('All Roles'); setStatusFilter('All Status'); }}
                      className="px-3.5 py-2 bg-[#F8FAFC] border border-[#E5E7EB] text-[#374151] rounded-lg text-xs hover:bg-[#F3F4F6]"
                      style={{ fontWeight: 500 }}
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <>
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
                          <th className="text-left px-5 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '22%' }}>
                            <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-[#111827]">
                              Full Name <ArrowUpDown className="w-3 h-3" />
                            </button>
                          </th>
                          <th className="text-left px-5 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '20%' }}>Email</th>
                          <th className="text-left px-5 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '16%' }}>Role</th>
                          <th className="text-left px-5 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '12%' }}>Status</th>
                          <th className="text-left px-5 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '12%' }}>
                            <button onClick={() => toggleSort('joined')} className="flex items-center gap-1 hover:text-[#111827]">
                              Created <ArrowUpDown className="w-3 h-3" />
                            </button>
                          </th>
                          <th className="text-left px-5 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '12%' }}>Change At</th>
                          <th className="text-left px-5 py-3.5 text-xs text-[#6B7280]" style={{ fontWeight: 500, width: '6%' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((user, i) => (
                          <tr
                            key={user.id}
                            className={`group hover:bg-[#FAFAFA] transition-colors ${i < filtered.length - 1 ? 'border-b border-[#F3F4F6]' : ''} ${i % 2 === 1 ? 'bg-[#FAFAFA]/40' : ''}`}
                          >
                            {/* Full Name */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 overflow-hidden"
                                  style={{ backgroundColor: user.avatarColor, fontSize: '11px', fontWeight: 700 }}
                                >
                                  {user.avatar.startsWith('data:') || user.avatar.startsWith('http') ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                  ) : (
                                    user.avatar
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm text-[#111827] truncate" style={{ fontWeight: 500 }}>{user.name}</p>
                                  <p className="text-[10px] text-[#9CA3AF]">ID: {user.id}</p>
                                </div>
                              </div>
                            </td>

                            {/* Email */}
                            <td className="px-5 py-3.5">
                              <span className="text-sm text-[#6B7280] truncate block">{user.email}</span>
                            </td>

                            {/* Role */}
                            <td className="px-5 py-3.5">
                              <RoleBadge role={user.role} />
                            </td>

                            {/* Status */}
                            <td className="px-5 py-3.5">
                              <StatusBadge status={user.status} />
                            </td>

                            {/* Created Date */}
                            <td className="px-5 py-3.5">
                              <span className="text-sm text-[#6B7280]">{user.joined}</span>
                            </td>

                            {/* Change At */}
                            <td className="px-5 py-3.5">
                              <span className="text-sm text-[#6B7280]">{user.updatedAt || '—'}</span>
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 hover:bg-[#EFF6FF] rounded-lg transition-colors" title="View">
                                  <Eye className="w-3.5 h-3.5 text-[#2563EB]" />
                                </button>
                                <button
                                  onClick={() => { setSelectedUser(user); setShowModal(true); }}
                                  className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-[#6B7280]" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="p-1.5 hover:bg-[#FEF2F2] rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-[#FCA5A5]" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Table footer / pagination */}
                    <div className="px-5 py-3.5 border-t border-[#F3F4F6] flex items-center justify-between bg-[#FAFAFA]">
                      <p className="text-xs text-[#6B7280]">
                        Showing <span style={{ fontWeight: 500 }} className="text-[#111827]">{filtered.length}</span> of <span style={{ fontWeight: 500 }} className="text-[#111827]">{users.length}</span> users
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F8FAFC]" style={{ fontWeight: 500 }}>Previous</button>
                        {[1, 2, 3].map(p => (
                          <button
                            key={p}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${p === 1 ? 'bg-[#E11D48] text-white' : 'border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8FAFC]'}`}
                            style={{ fontWeight: p === 1 ? 600 : 400 }}
                          >{p}</button>
                        ))}
                        <button className="px-3 py-1.5 text-xs border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F8FAFC]" style={{ fontWeight: 500 }}>Next</button>
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>

            {/* Right: Quick Panel (3 cols) */}

            {/* Analytics Panel */}
            {/* <div className="px-5 py-4 border-b border-[#F3F4F6]">
                  <p className="text-sm text-[#111827]" style={{ fontWeight: 600 }}>User Analytics</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">Real-time platform overview</p>
                </div> */}
            <div className="p-5 flex flex-col gap-4">

              {/* Total Users */}
              {/* <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl flex items-center justify-center">
                        <Users className="w-4 h-4 text-[#6B7280]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280]">Total Users</p>
                        <p className="text-[#111827]" style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.1 }}>{stats.total.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#16A34A] bg-[#F0FDF4] px-2 py-0.5 rounded-lg" style={{ fontWeight: 500 }}>All time</span>
                    </div>
                  </div> */}

              <div className="h-px bg-[#F3F4F6]" />

              {/* Active Users */}
              {/* <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl flex items-center justify-center">
                        <UserCheck className="w-4 h-4 text-[#16A34A]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280]">Active Users</p>
                        <p className="text-[#111827]" style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.1 }}>{stats.active}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#16A34A]" style={{ fontWeight: 500 }}>
                        {Math.round((stats.active / stats.total) * 100)}%
                      </p>
                      <p className="text-[10px] text-[#9CA3AF]">of total</p>
                    </div>
                  </div> */}

              <div className="h-px bg-[#F3F4F6]" />

              {/* New Registrations */}
              {/* <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#FFF1F3] border border-[#FECDD3] rounded-xl flex items-center justify-center">
                        <UserPlus className="w-4 h-4 text-[#E11D48]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280]">New This Month</p>
                        <p className="text-[#111827]" style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.1 }}>{stats.newThisMonth}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#E11D48]" style={{ fontWeight: 500 }}>May 2026</p>
                    </div>
                  </div> */}

              <div className="h-px bg-[#F3F4F6]" />

              {/* Growth */}
              {/* <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-[#2563EB]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#6B7280]">Monthly Growth</p>
                        <p className="text-[#111827]" style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.1 }}>+{stats.growth}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#16A34A]" style={{ fontWeight: 500 }}>↑ Trend</p>
                      <p className="text-[10px] text-[#9CA3AF]">vs last mo.</p>
                    </div>
                  </div> */}
            </div>

            {/* Mini role breakdown */}
            {/* <div className="px-5 pb-5">
                  <p className="text-[10px] text-[#9CA3AF] mb-2.5 uppercase tracking-wide" style={{ fontWeight: 600 }}>BREAKDOWN BY ROLE</p>
                  {(Object.entries({
                    Admin: MOCK_USERS.filter(u => u.role === 'Admin').length,
                    Learner: MOCK_USERS.filter(u => u.role === 'Learner').length,
                    'Org Manager': MOCK_USERS.filter(u => u.role === 'Org Manager').length,
                    'Course Provider': MOCK_USERS.filter(u => u.role === 'Course Provider').length,
                  })).map(([role, count]) => (
                    <div key={role} className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-[#6B7280] w-28 shrink-0 truncate">{role}</span>
                      <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(count / MOCK_USERS.length) * 100}%`,
                            backgroundColor: role === 'Admin' ? '#2563EB' : role === 'Learner' ? '#7C3AED' : role === 'Org Manager' ? '#D97706' : '#0891B2',
                          }}
                        />
                      </div>
                      <span className="text-xs text-[#9CA3AF] w-4 text-right shrink-0">{count}</span>
                    </div>
                  ))}
                </div> */}

            {/* Empty State Example */}
            {/* <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                <p className="text-[10px] text-[#9CA3AF] mb-3 uppercase tracking-wide" style={{ fontWeight: 600 }}>EMPTY STATE PREVIEW</p>
                <div className="flex flex-col items-center text-center py-4">
                  <div className="w-12 h-12 bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl flex items-center justify-center mb-3">
                    <Inbox className="w-6 h-6 text-[#D1D5DB]" />
                  </div>
                  <p className="text-sm text-[#111827] mb-1" style={{ fontWeight: 600 }}>No users yet</p>
                  <p className="text-xs text-[#6B7280] mb-4" style={{ lineHeight: 1.5 }}>
                    Get started by inviting your first team member or learner.
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#E11D48] text-white rounded-lg text-xs hover:bg-[#BE123C] transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Invite User
                  </button>
                </div>
              </div> */}

            {/* Quick actions */}
            {/* <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                <p className="text-xs text-[#111827] mb-3" style={{ fontWeight: 600 }}>Quick Actions</p>
                <div className="flex flex-col gap-1.5">
                  {[
                    { label: 'Bulk invite via CSV', icon: <Download className="w-3.5 h-3.5" /> },
                    { label: 'Export user report', icon: <Download className="w-3.5 h-3.5" /> },
                    { label: 'View suspended users', icon: <Ban className="w-3.5 h-3.5" /> },
                    { label: 'Manage roles & permissions', icon: <Shield className="w-3.5 h-3.5" /> },
                  ].map((action) => (
                    <button
                      key={action.label}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-[#374151] hover:bg-[#F8FAFC] hover:text-[#111827] transition-colors text-left"
                      style={{ fontWeight: 500 }}
                    >
                      <span className="text-[#9CA3AF]">{action.icon}</span>
                      {action.label}
                      <ChevronRight className="w-3 h-3 text-[#D1D5DB] ml-auto" />
                    </button>
                  ))}
                </div>
              </div> */}

          </div>
        </div>
      </div>

      {/* ── User Modal (Create/Edit) ── */}
      {showModal && <UserModal user={selectedUser} onClose={() => setShowModal(false)} onSave={handleSaveUser} />}
    </>
  );
}
