import { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { ProfileData } from './types';

interface EditProfileModalProps {
    onClose: () => void;
    profile: ProfileData;
    onSave: (updated: {
        name: string;
        avatar: string;
        expertise: string;
        experienceYear: string;
        avatarFile?: File | null;
    }) => Promise<void>;
}

export function EditProfileModal({ onClose, profile, onSave }: EditProfileModalProps) {
    const [name, setName] = useState(profile.name);
    const [avatar, setAvatar] = useState(profile.avatar);
    const [expertise, setExpertise] = useState(profile.expertise);
    const [experienceYear, setExperienceYear] = useState(profile.experienceYear);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    async function handleSave() {
        setSaving(true);
        try {
            await onSave({
                name,
                avatar,
                expertise,
                experienceYear,
                avatarFile: avatarFile,
            });
            setSaved(true);
            setTimeout(onClose, 800);
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    }

    const isImg = avatar && (avatar.startsWith('http') || avatar.startsWith('data:'));
    const isAcademic = profile.role === 'Course Provider' || profile.role === 'Academic Manager';

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
                            Edit Profile
                        </h2>
                        <p className="text-xs text-[#6B7280] mt-0.5">
                            Update your public profile details.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors">
                        <X className="w-4 h-4 text-[#6B7280]" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 flex flex-col gap-4">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-4 py-2 border-b border-[#F3F4F6] mb-1">
                        <div className="relative">
                            {isImg ? (
                                <img src={avatar} alt="Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-[#E11D48]/20" />
                            ) : (
                                <div
                                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-base font-bold bg-[#E11D48]"
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
                                onChange={handleFileChange}
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

                    {/* Email (Read-only) */}
                    <div>
                        <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Email</label>
                        <input
                            type="text"
                            value={profile.email}
                            disabled
                            className="w-full px-3 py-2.5 bg-[#F3F4F6] border border-[#E5E7EB] text-[#9CA3AF] rounded-xl text-sm cursor-not-allowed focus:outline-none"
                        />
                        <p className="text-[10px] text-[#9CA3AF] mt-1">Email cannot be modified.</p>
                    </div>

                    {/* Expertise */}
                    {isAcademic && (
                        <div>
                            <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Expertise</label>
                            <input
                                type="text"
                                value={expertise}
                                onChange={e => setExpertise(e.target.value)}
                                placeholder="e.g. Backend Engineering & Cloud"
                                className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 transition-colors"
                            />
                        </div>
                    )}

                    {/* Experience Year */}
                    {isAcademic && (
                        <div>
                            <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Experience Year</label>
                            <input
                                type="text"
                                value={experienceYear}
                                onChange={e => setExperienceYear(e.target.value)}
                                placeholder="e.g. 5 years"
                                className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/15 transition-colors"
                            />
                        </div>
                    )}

                    {/* Created At (Read-only) */}
                    <div>
                        <label className="block text-xs text-[#374151] mb-1.5" style={{ fontWeight: 500 }}>Created At</label>
                        <input
                            type="text"
                            value={profile.createdAt}
                            disabled
                            className="w-full px-3 py-2.5 bg-[#F3F4F6] border border-[#E5E7EB] text-[#9CA3AF] rounded-xl text-sm cursor-not-allowed focus:outline-none"
                        />
                        <p className="text-[10px] text-[#9CA3AF] mt-1">Creation date cannot be modified.</p>
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
                            disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm hover:bg-[#BE123C] transition-colors disabled:opacity-60"
                            style={{ fontWeight: 500 }}
                        >
                            {saving ? (
                                <>
                                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Saving…
                                </>
                            ) : saved ? (
                                <>
                                    <Check className="w-4 h-4" /> Saved!
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
