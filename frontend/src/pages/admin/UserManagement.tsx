import { useState, useMemo, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/user/user.service';
import {
  Search, Download, Eye, Edit2, Trash2,
  Plus, X, ChevronDown,
  ArrowUpDown, Mail,
  Shield, GraduationCap, Building2, BookOpen,
  Check, AlertCircle
} from 'lucide-react';

/* ─── Types ─── */
type Role = 'Admin' | 'Learner' | 'Academic Manager' | 'Course Provider';
type Status = 'Active' | 'Inactive';

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



/* ─── Config maps ─── */
const roleConfig: Record<Role, { label: string; icon: React.ReactNode; cls: string }> = {
  'Admin': { label: 'Admin', icon: <Shield className="w-3 h-3" />, cls: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]' },
  'Learner': { label: 'Learner', icon: <GraduationCap className="w-3 h-3" />, cls: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]' },
  'Academic Manager': { label: 'Academic Manager', icon: <Building2 className="w-3 h-3" />, cls: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]' },
  'Course Provider': { label: 'Course Provider', icon: <BookOpen className="w-3 h-3" />, cls: 'bg-[#F0FDFA] text-[#0891B2] border-[#A5F3FC]' },
};

const statusConfig: Record<Status, { icon: React.ReactNode; cls: string }> = {
  'Active': { icon: <Check className="w-2.5 h-2.5" />, cls: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]' },
  'Inactive': { icon: <AlertCircle className="w-2.5 h-2.5" />, cls: 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB]' },
};

const ROLES: ('All Roles' | Role)[] = ['All Roles', 'Admin', 'Learner', 'Academic Manager', 'Course Provider'];
const STATUSES: ('All Status' | Status)[] = ['All Status', 'Active', 'Inactive'];

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
  onSave: (userData: { name: string; email: string; role: Role; status: Status; avatar: string; avatarColor: string; password?: string }) => void;
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
      password: user ? undefined : password,
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
                  {(['Active', 'Inactive'] as Status[]).map(s => (
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

interface ViewUserModalProps {
  user: User;
  onClose: () => void;
}

function ViewUserModal({ user, onClose }: ViewUserModalProps) {
  const isImg = user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:'));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#111827]/25 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[440px] mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F3F4F6] flex items-start justify-between">
          <div>
            <h2 className="text-[#111827]" style={{ fontSize: '17px', fontWeight: 700 }}>
              User Details
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Detailed profile information.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors">
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Avatar Section */}
          <div className="flex items-center gap-4 py-2 border-b border-[#F3F4F6]">
            {isImg ? (
              <img src={user.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-[#E11D48]/20" />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold"
                style={{ backgroundColor: user.avatarColor }}
              >
                {user.avatar}
              </div>
            )}
            <div>
              <h3 className="text-base text-[#111827] font-semibold">{user.name}</h3>
              <p className="text-xs text-[#6B7280]">User ID: {user.id}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="flex flex-col gap-3.5 text-sm">
            {/* Email */}
            <div className="flex justify-between items-center py-1 border-b border-[#F9FAFB]">
              <span className="text-[#6B7280]" style={{ fontWeight: 500 }}>Email Address</span>
              <span className="text-[#111827]">{user.email}</span>
            </div>

            {/* Role */}
            <div className="flex justify-between items-center py-1 border-b border-[#F9FAFB]">
              <span className="text-[#6B7280]" style={{ fontWeight: 500 }}>Role</span>
              <RoleBadge role={user.role} />
            </div>

            {/* Status */}
            <div className="flex justify-between items-center py-1 border-b border-[#F9FAFB]">
              <span className="text-[#6B7280]" style={{ fontWeight: 500 }}>Status</span>
              <StatusBadge status={user.status} />
            </div>

            {/* Joined */}
            <div className="flex justify-between items-center py-1 border-b border-[#F9FAFB]">
              <span className="text-[#6B7280]" style={{ fontWeight: 500 }}>Joined Date</span>
              <span className="text-[#111827]">{user.joined}</span>
            </div>

            {/* Last Updated */}
            <div className="flex justify-between items-center py-1 border-b border-[#F9FAFB]">
              <span className="text-[#6B7280]" style={{ fontWeight: 500 }}>Last Updated</span>
              <span className="text-[#111827]">{user.updatedAt || '—'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F3F4F6] flex justify-end bg-[#FAFAFA]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors"
            style={{ fontWeight: 500 }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Delete Confirmation Modal ─── */
interface DeleteConfirmationModalProps {
  user: User;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteConfirmationModal({ user, onClose, onConfirm }: DeleteConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#111827]/25 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[400px] mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-[#FFF1F2] border border-[#FECDD3] rounded-full flex items-center justify-center mb-3">
            <Trash2 className="w-6 h-6 text-[#E11D48]" />
          </div>
          <h2 className="text-[#111827] text-base" style={{ fontWeight: 700 }}>
            Confirm Deactivation
          </h2>
          <p className="text-sm text-[#6B7280] mt-2">
            Are you sure you want to delete user <span className="font-semibold text-[#111827]">{user.name}</span>?
          </p>
          <p className="text-xs text-[#9CA3AF] mt-1.5 leading-relaxed">
            This action will change the user's status from <span className="text-[#16A34A] font-semibold">Active</span> to <span className="text-[#6B7280] font-semibold">Inactive</span> instead of permanently removing them from the list.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F3F4F6] flex items-center justify-end gap-2.5 bg-[#FAFAFA]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#374151] rounded-lg text-sm hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors"
            style={{ fontWeight: 500 }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors"
            style={{ fontWeight: 500 }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─── */
export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All Roles');
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [userToDelete, setUserToDelete] = useState<User | undefined>(undefined);
  const [sortField, setSortField] = useState<'name' | 'joined'>('joined');
  const [sortAsc, setSortAsc] = useState(false);

  const mapBackendUserToFrontend = (u: any): User => {
    let role: Role = 'Learner';
    if (u.role?.roleName === 'admin') role = 'Admin';
    else if (u.role?.roleName === 'course provider') role = 'Course Provider';
    else if (u.role?.roleName === 'academic manager') role = 'Academic Manager';

    const status: Status = u.isEmailVerified ? 'Active' : 'Inactive';

    const joinedDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : '—';

    const colors = ['#E11D48', '#7C3AED', '#2563EB', '#16A34A', '#D97706', '#0891B2'];
    const avatarColor = colors[u.userId % colors.length];

    const updatedAtDate = u.updatedAt ? new Date(u.updatedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' ' + new Date(u.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : undefined;

    return {
      id: u.userId,
      name: u.fullName || 'No Name',
      email: u.email,
      role,
      status,
      joined: joinedDate,
      avatar: u.avatar || (u.fullName ? u.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'),
      avatarColor,
      lastSeen: '—',
      updatedAt: updatedAtDate,
    };
  };

  const mapFrontendRoleToBackend = (role: Role): string => {
    switch (role) {
      case 'Admin': return 'admin';
      case 'Learner': return 'learner';
      case 'Academic Manager': return 'academic manager';
      case 'Course Provider': return 'course provider';
      default: return 'learner';
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ── MOCK DATA FETCHING (TRÁNH LỖI 429 VÀ ĐỘC LẬP BACKEND) ────────────────────────
      // Thay vì gửi request GET tới server, hệ thống sẽ lấy dữ liệu từ sessionStorage.
      // Nếu là lần chạy đầu tiên, dữ liệu mặc định MOCK_USERS_BACKEND từ data.ts sẽ được nạp.
      /* Comment API thực tế để tránh 429
      const data = await getUsers();
      */

      const { MOCK_USERS_BACKEND } = await import('../../db/data');
      const stored = sessionStorage.getItem('mock_users');
      const data = stored ? JSON.parse(stored) : MOCK_USERS_BACKEND;
      
      // Khởi tạo lưu trữ trong sessionStorage để duy trì trạng thái thay đổi ở các lần thao tác sau
      if (!stored) {
        sessionStorage.setItem('mock_users', JSON.stringify(MOCK_USERS_BACKEND));
      }

      setUsers(data.map(mapBackendUserToFrontend));
    } catch (err: any) {
      console.error('Failed to fetch users', err);
      setError('Failed to load users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const handleSaveUser = async (userData: {
    name: string;
    email: string;
    role: Role;
    status: Status;
    avatar: string;
    avatarColor: string;
    password?: string;
  }) => {
    try {
      const { MOCK_USERS_BACKEND } = await import('../../db/data');
      const stored = sessionStorage.getItem('mock_users');
      let currentList = stored ? JSON.parse(stored) : [...MOCK_USERS_BACKEND];

      if (selectedUser) {
        // ── MOCK UPDATE USER (CHỈNH SỬA NGƯỜI DÙNG) ──────────────────────────────────
        // Tìm và cập nhật thông tin của người dùng được chọn trong danh sách local
        /* Comment API thực tế
        await updateUser(selectedUser.id, {
          fullName: userData.name,
          avatar_url: userData.avatar,
          isEmailVerified: userData.status === 'Active',
        });
        */
        currentList = currentList.map((u: any) => {
          if (u.userId === selectedUser.id) {
            return {
              ...u,
              fullName: userData.name,
              avatar: userData.avatar || u.avatar,
              isEmailVerified: userData.status === 'Active',
              updatedAt: new Date().toISOString()
            };
          }
          return u;
        });
      } else {
        // ── MOCK CREATE USER (TẠO NGƯỜI DÙNG MỚI) ──────────────────────────────────────
        // Sinh ID tự động (max + 1) và đẩy đối tượng người dùng mới vào danh sách local
        /* Comment API thực tế
        await createUser({
          fullName: userData.name,
          email: userData.email,
          password: userData.password,
          roleName: mapFrontendRoleToBackend(userData.role),
          avatar_url: userData.avatar,
          isEmailVerified: userData.status === 'Active',
        });
        */
        const newId = currentList.length ? Math.max(...currentList.map((u: any) => u.userId)) + 1 : 1;
        const newUser = {
          userId: newId,
          fullName: userData.name,
          email: userData.email,
          role: { roleName: mapFrontendRoleToBackend(userData.role) },
          isEmailVerified: userData.status === 'Active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          avatar: userData.avatar || null
        };
        currentList.push(newUser);
      }
      
      // Đồng bộ danh sách mới đã sửa/thêm vào sessionStorage
      sessionStorage.setItem('mock_users', JSON.stringify(currentList));
      setShowModal(false);
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save user. Please try again.');
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      // ── MOCK INACTIVATE USER (VÔ HIỆU HÓA NGƯỜI DÙNG) ──────────────────────────────────
      // Thay vì xóa khỏi danh sách, cập nhật trạng thái hoạt động thành Inactive (isEmailVerified = false)
      /* Comment API thực tế
      await deleteUser(id);
      */
      const { MOCK_USERS_BACKEND } = await import('../../db/data');
      const stored = sessionStorage.getItem('mock_users');
      let currentList = stored ? JSON.parse(stored) : [...MOCK_USERS_BACKEND];
      
      currentList = currentList.map((u: any) => {
        if (u.userId === id) {
          return {
            ...u,
            isEmailVerified: false,
            updatedAt: new Date().toISOString()
          };
        }
        return u;
      });
      sessionStorage.setItem('mock_users', JSON.stringify(currentList));

      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to deactivate user.');
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
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E11D48] mb-3"></div>
                    <p className="text-sm text-[#6B7280]">Loading users...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <AlertCircle className="w-8 h-8 text-[#DC2626] mb-3" />
                    <p className="text-sm text-[#111827]" style={{ fontWeight: 600 }}>{error}</p>
                    <button
                      onClick={fetchUsers}
                      className="mt-3 px-3.5 py-2 bg-[#F8FAFC] border border-[#E5E7EB] text-[#374151] rounded-lg text-xs hover:bg-[#F3F4F6]"
                      style={{ fontWeight: 500 }}
                    >
                      Retry
                    </button>
                  </div>
                ) : filtered.length === 0 ? (
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
                                <button
                                  onClick={() => { setSelectedUser(user); setShowViewModal(true); }}
                                  className="p-1.5 hover:bg-[#EFF6FF] rounded-lg transition-colors"
                                  title="View"
                                >
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
                                  onClick={() => { setUserToDelete(user); setShowDeleteModal(true); }}
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

      {/* ── View User Modal ── */}
      {showViewModal && selectedUser && <ViewUserModal user={selectedUser} onClose={() => setShowViewModal(false)} />}

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && userToDelete && (
        <DeleteConfirmationModal
          user={userToDelete}
          onClose={() => { setShowDeleteModal(false); setUserToDelete(undefined); }}
          onConfirm={async () => {
            await handleDeleteUser(userToDelete.id);
            setShowDeleteModal(false);
            setUserToDelete(undefined);
          }}
        />
      )}
    </>
  );
}
