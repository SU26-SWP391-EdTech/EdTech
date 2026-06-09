import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/auth.stores';
import type { ProfileData } from './types';

const mapRoleNameToLabel = (roleName?: string): string => {
  if (!roleName) return 'User';
  switch (roleName.toLowerCase()) {
    case 'admin': return 'Admin';
    case 'learner': return 'Learner';
    case 'course provider': return 'Course Provider';
    case 'academic manager': return 'Academic Manager';
    default: return roleName;
  }
};

export function useLearnerProfile() {
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const loggedInUser = useAuthStore((state) => state.user);

  // Profile state
  const [profile, setProfile] = useState<ProfileData>(() => ({
    name: loggedInUser?.fullName || '',
    email: loggedInUser?.email || '',
    bio: '',
    location: '',
    organization: 'EdTech Platform',
    avatar: loggedInUser?.avatarUrl || '',
    learningGoal: '',
    level: '',
    createdAt: '',
    role: loggedInUser?.roleName ? mapRoleNameToLabel(loggedInUser.roleName) : 'User',
  }));

  const fetchProfileData = async () => {
    if (!loggedInUser) return;
    try {
      setLoading(true);
      const { MOCK_LEARNER_PROFILE_FULL } = await import('../../db/data');
      const stored = sessionStorage.getItem('mock_learner_profile');
      const res = stored ? JSON.parse(stored) : MOCK_LEARNER_PROFILE_FULL;

      setProfile({
        name: res.fullName || loggedInUser.fullName || 'No Name',
        email: res.email || loggedInUser.email,
        bio: res.bio || '',
        location: 'Not set',
        organization: 'EdTech Platform',
        avatar: res.avatarUrl || loggedInUser.avatarUrl || '',
        learningGoal: res.learningGoal || '',
        level: res.level || '',
        createdAt: res.createdAt ? new Date(res.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }) : '—',
        role: loggedInUser.roleName ? mapRoleNameToLabel(loggedInUser.roleName) : 'User',
      });
    } catch (err: any) {
      console.error('Failed to load profile', err);
      setProfile({
        name: loggedInUser.fullName || 'No Name',
        email: loggedInUser.email,
        bio: '',
        location: 'Not set',
        organization: 'EdTech Platform',
        avatar: loggedInUser.avatarUrl || '',
        learningGoal: '',
        level: '',
        createdAt: '—',
        role: mapRoleNameToLabel(loggedInUser.roleName),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [loggedInUser]);

  const handleSaveProfile = async (updated: {
    name: string;
    avatar: string;
    learningGoal: string;
    level: string;
    bio: string;
    avatarFile?: File | null;
  }) => {
    if (!loggedInUser) return;

    const updatedProfile = {
      fullName: updated.name,
      learningGoal: updated.learningGoal,
      level: updated.level,
      bio: updated.bio,
      avatarUrl: updated.avatar,
      createdAt: profile.createdAt,
      email: profile.email
    };
    sessionStorage.setItem('mock_learner_profile', JSON.stringify(updatedProfile));

    useAuthStore.setState({
      user: {
        ...loggedInUser,
        fullName: updated.name,
        avatarUrl: updated.avatar,
      }
    });

    await fetchProfileData();
  };

  return {
    showEdit,
    setShowEdit,
    loading,
    profile,
    handleSaveProfile,
    fetchProfileData
  };
}
