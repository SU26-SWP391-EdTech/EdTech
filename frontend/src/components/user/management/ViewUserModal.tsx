import { X } from 'lucide-react';
import { RoleBadge } from './RoleBadge';
import { StatusBadge } from './StatusBadge';
import type { User } from '../../../types/user/user-management.types';

interface ViewUserModalProps {
  user: User;
  onClose: () => void;
}

export function ViewUserModal({ user, onClose }: ViewUserModalProps) {
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
