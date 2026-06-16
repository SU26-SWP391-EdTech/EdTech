import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth/auth.stores';
import { useProviderProfile } from '../../hooks/user/useProviderProfile';
import ProfileMini from '../../components/user/profile/shared/ProfileMini';
import AboutProvider from '../../components/user/profile/provider/AboutProvider';
import StatsProvider from '../../components/user/profile/provider/StatsProvider';
import PublishedCourses from '../../components/user/profile/provider/PublishedCourses';

export function ProviderProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const loggedInUser = useAuthStore((state) => state.user);
    const providerId = id ? Number(id) : loggedInUser?.userId;
    const role = loggedInUser?.roleName?.toLowerCase() || 'guest';

    const {
        profile,
        user,
        courses,
        loading,
        editing,
        setEditing,
        fullName,
        setFullName,
        expertise,
        setExpertise,
        experienceYears,
        setExperienceYears,
        save,
        isSaving,
        cancel,
        avatarFile,
        setAvatarFile,
        canEdit,
    } = useProviderProfile(providerId);

    const getExplorePath = () => {
        if (role === 'learner') return '/learner/explore';
        if (role === 'course provider') return '/provider/explore';
        return '/explore';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E11D48] mb-3"></div>
                <p className="text-sm text-[#6B7280]">Loading provider profile...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] px-8 py-16">
                <div className="max-w-3xl mx-auto bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center">
                    <h1 className="text-xl font-bold text-[#111827] mb-2">Provider not found</h1>
                    <p className="text-sm text-[#6B7280] mb-5">This course provider profile does not exist.</p>
                    <button
                        onClick={() => navigate(getExplorePath())}
                        className="px-4 py-2 bg-[#E11D48] text-white rounded-lg text-sm font-medium hover:bg-[#BE123C] transition-colors"
                    >
                        Browse courses
                    </button>
                </div>
            </div>
        );
    }

    const approvedCount = courses.filter(c => c.status === 'approved').length;
    const totalEnrollments = courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0);

    return (
        <div style={{ fontFamily: "'Inter','SF Pro Display',sans-serif", background: '#F8FAFC', minHeight: '100vh', padding: '28px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>
                
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <ProfileMini
                        profile={profile}
                        user={user}
                        fullName={fullName}
                        editing={editing}
                        setEditing={setEditing}
                        setFullName={setFullName}
                        save={save}
                        isSaving={isSaving}
                        cancel={cancel}
                        avatarFile={avatarFile}
                        setAvatarFile={setAvatarFile}
                        canEdit={canEdit}
                        roleLabel="Course Provider"
                    />
                    
                    <AboutProvider
                        editing={editing}
                        expertise={expertise}
                        setExpertise={setExpertise}
                        experienceYears={experienceYears}
                        setExperienceYears={setExperienceYears}
                        canEdit={canEdit}
                    />

                    <StatsProvider
                        coursesCount={courses.length}
                        approvedCount={approvedCount}
                        totalEnrollments={totalEnrollments}
                    />
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <PublishedCourses courses={courses} />
                </div>

            </div>
        </div>
    );
}
