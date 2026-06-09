import { useState } from 'react';
import { X, Mail, Plus, ChevronDown } from 'lucide-react';
import { RoleBadge } from './RoleBadge';
import { StatusBadge } from './StatusBadge';
import type { User, Role, Status } from './types';

interface UserModalProps {
  user?: User;
  onClose: () => void;
  onSave: (userData: { name: string; email: string; role: Role; status: Status; avatar: string; avatarColor: string; password?: string }) => void;
}

export function UserModal({ user, onClose, onSave }: UserModalProps) {
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
