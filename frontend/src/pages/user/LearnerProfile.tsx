import Enrollments from '../../components/user/profile/learner/Enrollments';
import AboutLearner from '../../components/user/profile/learner/AboutLearner';
import StatsLearner from '../../components/user/profile/learner/StatsLearner';
import ProfileMini from '../../components/user/profile/shared/ProfileMini';
import LearningPaths from '../../components/user/profile/learner/LearningPaths';
import Toast from '../../components/user/profile/shared/Toast';
import { useLearnerProfile } from '../../hooks/user/useLearnerProfile';
import { useAuthStore } from '../../stores/auth/auth.stores';

export function LearnerProfile() {
  const currentUser = useAuthStore((state) => state.user);
  const userId = currentUser?.userId;
  const {
    profile,
    user,
    editing,
    setEditing,
    fullName,
    setFullName,
    bio,
    setBio,
    goal,
    setGoal,
    save,
    isSaving,
    enrollments,
    learningPaths,
    completedCount,
    avgProgress,
    toast,
    setToast,
    cancel,
    avatarFile,
    setAvatarFile,
    canEdit,
  } = useLearnerProfile(userId);

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: '#F8FAFC', minHeight: '100vh', padding: '28px 32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' }}>

        {/* Left card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Profile */}
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
            roleLabel="Learner"
          />

          {/* Stats */}
          <StatsLearner
            enrolledCount={enrollments.length}
            completedCount={completedCount}
            avgProgress={avgProgress}
            currentStreak={profile?.currentStreak}
            longestStreak={profile?.longestStreak}
          />
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* About */}
          <AboutLearner
            profile={profile}
            goal={goal}
            bio={bio}
            setGoal={setGoal}
            setBio={setBio}
            editing={editing}
            canEdit={canEdit}
          />

          {/* Enrollments */}
          <Enrollments
            enrollments={enrollments}
          />

          {/* Learning Paths */}
          <LearningPaths
            learningPaths={learningPaths}
            enrollments={enrollments}
          />
        </div>
      </div>

      {/* Toast Notification */}
      <Toast toast={toast} setToast={setToast} />
    </div>
  );
}
