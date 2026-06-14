import React from 'react';
import { ProfileCover } from './ProfileCover';
import { ProfileAvatar } from './ProfileAvatar';
import { ProfileInfo } from './ProfileInfo';
import type { ProfileData } from './EditProfileModal';

interface ProfileCardProps {
    profile: ProfileData;
    onEditClick: () => void;
}

export function ProfileCard({ profile, onEditClick }: ProfileCardProps) {
    return (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden mb-6 shadow-sm">
            {/* Cover banner */}
            <ProfileCover />

            <div className="px-8 pb-6">
                <div className="flex items-end justify-between" style={{ marginTop: '-48px' }}>
                    {/* Avatar */}
                    <ProfileAvatar avatar={profile.avatar} name={profile.name} size="lg" />
                </div>

                {/* Detailed Profile Info */}
                <ProfileInfo profile={profile} onEditClick={onEditClick} />
            </div>
        </div>
    );
}
