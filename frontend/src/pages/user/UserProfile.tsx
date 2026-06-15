import { useUserProfile } from '../../hooks/user/useUserProfile';
import { EditProfileModal } from '../../components/user/profile/generic/EditProfileModal';
import { ProfileHeader } from '../../components/user/profile/generic/ProfileHeader';
import { ProfileStats } from '../../components/user/profile/generic/ProfileStats';
import { PathsSection } from '../../components/user/profile/generic/PathsSection';
import { HistoryTableSection } from '../../components/user/profile/generic/HistoryTableSection';

export function UserProfile() {
    const {
        showEdit,
        setShowEdit,
        loading,
        profile,
        handleSaveProfile
    } = useUserProfile();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E11D48] mb-3"></div>
                <p className="text-sm text-[#6B7280]">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {showEdit && (
                <EditProfileModal
                    onClose={() => setShowEdit(false)}
                    profile={profile}
                    onSave={handleSaveProfile}
                />
            )}

            <div className="max-w-[1440px] mx-auto px-8 py-8">

                {/* ── PROFILE HEADER ── */}
                <ProfileHeader profile={profile} onEditClick={() => setShowEdit(true)} />

                {/* ── STAT CARDS ── */}
                <ProfileStats profile={profile} />

                {/* ── MAIN 2-COLUMN GRID ── */}
                <div className="flex gap-5 mb-6">
                    {/* LEFT: About */}
                    <div className="w-[268px] flex-shrink-0 space-y-4">
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
                            <p className="text-[#111827] text-sm mb-3" style={{ fontWeight: 600 }}>About Me</p>
                            <p className="text-[#6B7280] text-xs" style={{ lineHeight: 1.7 }}>
                                {profile.role === 'Course Provider'
                                    ? 'Professional educator providing high-quality courses and instructional resources on the EdTech Platform.'
                                    : profile.role === 'Academic Manager'
                                        ? 'Academic program administrator managing curricula, quality assurance, and educational standards on the EdTech Platform.'
                                        : '3rd year CS student at FPT University. I love building full-stack apps and exploring data-driven solutions.'}
                            </p>
                        </div>
                    </div>

                    {/* RIGHT: Completed Learning Paths */}
                    <div className="flex-1 min-w-0 space-y-4">
                        <PathsSection profile={profile} />
                    </div>
                </div>

                {/* ── COURSE HISTORY / PUBLISHED COURSES / CURRICULUM OVERVIEW TABLE ── */}
                <HistoryTableSection profile={profile} />
            </div>
        </div>
    );
}
