import React from 'react';
import { Mail, MapPin, Briefcase, Calendar, Clock, Edit3 } from 'lucide-react';
import { ProfileContactItem } from './ProfileContactItem';
import { ProfileMetadataBadge } from './ProfileMetadataBadge';
import type { ProfileData } from './EditProfileModal';

interface ProfileInfoProps {
    profile: ProfileData;
    onEditClick: () => void;
}

export function ProfileInfo({ profile, onEditClick }: ProfileInfoProps) {
    const isAcademic = profile.role === 'Course Provider' || profile.role === 'Academic Manager';

    return (
        <div className="w-full">
            {/* Action Edit Button (Hiển thị góc phải) */}
            <div className="flex justify-end mb-4" style={{ marginTop: '-44px' }}>
                <button
                    onClick={onEditClick}
                    className="flex items-center gap-2 px-4 py-2 bg-[#E11D48] text-white rounded-xl text-sm hover:bg-[#BE123C] transition-colors font-medium shadow-sm">
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                </button>
            </div>

            {/* Info details */}
            <div className="mt-4">
                {/* Name & Role */}
                <div className="flex items-center gap-3 mb-2.5">
                    <h1 className="text-[#0F172A] font-extrabold text-2xl lg:text-3xl leading-none">{profile.name}</h1>
                    <span className="px-3 py-1 bg-[#E11D48] text-white text-[10px] rounded-lg uppercase tracking-wider font-bold shadow-sm">{profile.role}</span>
                </div>

                {/* Email and Location */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#1E293B] font-medium mb-4">
                    <ProfileContactItem icon={<Mail className="w-4 h-4 text-[#475569]" />} value={profile.email} />
                    <ProfileContactItem icon={<MapPin className="w-4 h-4 text-[#475569]" />} value={profile.location} />
                </div>

                {/* Badges / Metadata */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {isAcademic && (
                        <>
                            <ProfileMetadataBadge
                                icon={<Briefcase className="w-3.5 h-3.5 text-[#0369A1]" />}
                                label="Expertise"
                                value={profile.expertise}
                                variant="sky"
                            />
                            <ProfileMetadataBadge
                                icon={<Calendar className="w-3.5 h-3.5 text-[#047857]" />}
                                label="Experience"
                                value={profile.experienceYear}
                                variant="emerald"
                            />
                        </>
                    )}
                    <ProfileMetadataBadge
                        icon={<Clock className="w-3.5 h-3.5 text-[#475569]" />}
                        label="Joined"
                        value={profile.createdAt}
                        variant="gray"
                    />
                </div>

                {/* Bio text */}
                <p className="text-[#374151] text-xs max-w-xl mt-3 leading-relaxed">
                    {profile.bio}
                </p>
            </div>
        </div>
    );
}
