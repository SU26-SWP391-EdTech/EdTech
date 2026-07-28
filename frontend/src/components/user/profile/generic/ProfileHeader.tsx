import { Mail, MapPin, Briefcase, Calendar, Clock, Edit3 } from 'lucide-react';
import type { ProfileData } from '../../../types/user/user-profile.types';

interface ProfileHeaderProps {
    profile: ProfileData;
    onEditClick: () => void;
}

export function ProfileHeader({ profile, onEditClick }: ProfileHeaderProps) {
    const isImg = profile.avatar && (profile.avatar.startsWith('http') || profile.avatar.startsWith('data:'));
    const isAcademic = profile.role === 'Course Provider' || profile.role === 'Academic Manager';

    return (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden mb-6 shadow-sm">
            {/* Cover */}
            <div className="h-36 relative" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 45%, #312E81 75%, #4C1D95 100%)' }}>
                {/* Dot grid overlay */}
                <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                {/* Glows */}
                <div className="absolute top-4 right-16 w-32 h-32 rounded-full opacity-20" style={{ background: '#E11D48', filter: 'blur(40px)' }} />
                <div className="absolute bottom-0 left-1/3 w-24 h-24 rounded-full opacity-15" style={{ background: '#6366F1', filter: 'blur(35px)' }} />
            </div>

            <div className="px-8 pb-6">
                <div className="flex items-end justify-between" style={{ marginTop: '-48px' }}>
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#E11D48] flex items-center justify-center border-4 border-white shadow-lg shrink-0">
                            {isImg ? (
                                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                                <span style={{ fontWeight: 800, fontSize: '32px', color: 'white' }}>
                                    {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                                </span>
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#10B981] border-2 border-white" title="Online" />
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-3 pb-1">
                        <button
                            onClick={onEditClick}
                            className="flex items-center gap-2 px-4 py-2 bg-[#E11D48] text-white rounded-xl text-sm hover:bg-[#BE123C] transition-colors"
                            style={{ fontWeight: 500 }}>
                            <Edit3 className="w-4 h-4" />
                            Edit Profile
                        </button>
                    </div>
                </div>

                <div className="mt-4 flex items-start gap-8">
                    <div className="flex-1 min-w-0">
                        {/* Name & Role */}
                        <div className="flex items-center gap-3 mb-2.5">
                            <h1 className="text-[#0F172A]" style={{ fontWeight: 800, fontSize: '26px', lineHeight: 1.2 }}>{profile.name}</h1>
                            <span className="px-3 py-1 bg-[#E11D48] text-white text-[10px] rounded-lg uppercase tracking-wider font-bold shadow-sm">{profile.role}</span>
                        </div>

                        {/* Email and Location (Contact Details) */}
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#1E293B] font-medium mb-4">
                            <span className="flex items-center gap-1.5 hover:text-[#0F172A] transition-colors">
                                <Mail className="w-4 h-4 text-[#475569]" />
                                {profile.email}
                            </span>
                            <span className="flex items-center gap-1.5 hover:text-[#0F172A] transition-colors">
                                <MapPin className="w-4 h-4 text-[#475569]" />
                                {profile.location}
                            </span>
                        </div>

                        {/* Professional Badges / Metadata */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {isAcademic && (
                                <>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] text-xs font-semibold">
                                        <Briefcase className="w-3.5 h-3.5 text-[#0369A1]" />
                                        Expertise: {profile.expertise}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D1FAE5] border border-[#A7F3D0] text-[#047857] text-xs font-semibold">
                                        <Calendar className="w-3.5 h-3.5 text-[#047857]" />
                                        Experience: {profile.experienceYear}
                                    </span>
                                </>
                            )}
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F1F5F9] border border-[#CBD5E1] text-[#1E293B] text-xs font-semibold">
                                <Clock className="w-3.5 h-3.5 text-[#475569]" />
                                Joined: {profile.createdAt}
                            </span>
                        </div>

                        {/* Bio text */}
                        <p className="text-[#374151] text-xs max-w-xl mt-3" style={{ lineHeight: 1.7 }}>
                            {profile.bio}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
