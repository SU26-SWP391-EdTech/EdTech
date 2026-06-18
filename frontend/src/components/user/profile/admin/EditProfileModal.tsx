import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { ProfileAvatar } from './ProfileAvatar';
import { ProfileInput } from './ProfileInput';

export interface ProfileData {
    name: string;
    email: string;
    bio: string;
    location: string;
    organization: string;
    avatar: string;
    expertise: string;
    experienceYear: string;
    createdAt: string;
    role: string;
}

export interface EditProfileModalProps {
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
                        <ProfileAvatar avatar={avatar} name={name} size="sm" />
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
                    <ProfileInput
                        label="Full Name"
                        required
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Alexandra Moore"
                    />

                    {/* Expertise */}
                    {isAcademic && (
                        <ProfileInput
                            label="Expertise"
                            type="text"
                            value={expertise}
                            onChange={e => setExpertise(e.target.value)}
                            placeholder="e.g. Backend Engineering & Cloud"
                        />
                    )}

                    {/* Experience Year */}
                    {isAcademic && (
                        <ProfileInput
                            label="Experience Year"
                            type="text"
                            value={experienceYear}
                            onChange={e => setExperienceYear(e.target.value)}
                            placeholder="e.g. 5 years"
                        />
                    )}

                    {/* Created At (Read-only) */}
                    <ProfileInput
                        label="Created At"
                        type="text"
                        value={profile.createdAt}
                        disabled
                        helperText="Creation date cannot be modified."
                    />
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
