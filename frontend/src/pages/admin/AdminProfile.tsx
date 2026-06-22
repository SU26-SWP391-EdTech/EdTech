import { EditProfileModal } from '../../components/user/profile/admin/EditProfileModal';
import { ProfileCard } from '../../components/user/profile/admin/ProfileCard';
import { useAdminProfile } from '../../hooks/user/useAdminProfile';

export function AdminProfile() {
  const { profile, loading, showEdit, setShowEdit, handleSave } = useAdminProfile();

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
          onSave={handleSave}
        />
      )}

      <div className="max-w-[1440px] mx-auto px-8 py-8">
        <ProfileCard profile={profile} onEditClick={() => setShowEdit(true)} />
      </div>
    </div>
  );
}
