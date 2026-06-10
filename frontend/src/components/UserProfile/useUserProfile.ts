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

export function useUserProfile() {
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
    expertise: '',
    experienceYear: '',
    createdAt: '',
    role: loggedInUser?.roleName ? mapRoleNameToLabel(loggedInUser.roleName) : 'User',
  }));

  const fetchProfileData = async () => {
    if (!loggedInUser) return;
    try {
      setLoading(true);

      const stored = sessionStorage.getItem('mock_academic_profile');
      const res = stored ? JSON.parse(stored) : null;

      setProfile({
        name: res?.fullName || loggedInUser.fullName || 'No Name',
        email: res?.email || loggedInUser.email,
        bio: res?.bio || '',
        location: 'Not set',
        organization: 'EdTech Platform',
        avatar: res?.avatarUrl || loggedInUser.avatarUrl || '',
        expertise: res?.expertise || 'Not set',
        experienceYear: res?.experienceYears !== undefined && res?.experienceYears !== null ? `${res.experienceYears} years` : '0 years',
        createdAt: res?.createdAt ? new Date(res.createdAt).toLocaleDateString('en-US', {
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
        bio: 'User bio description not stored on server.',
        location: 'Not set',
        organization: 'EdTech Platform',
        avatar: loggedInUser.avatarUrl || '',
        expertise: 'Not set',
        experienceYear: '0 years',
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
    expertise: string;
    experienceYear: string;
    avatarFile?: File | null;
  }) => {
    if (!loggedInUser) return;

    const yearsMatch = updated.experienceYear.match(/\d+/);
    const years = yearsMatch ? parseInt(yearsMatch[0], 10) : 8;

    const updatedProfile = {
      fullName: updated.name,
      expertise: updated.expertise,
      experienceYears: years,
      avatarUrl: updated.avatar,
      bio: profile.bio,
      email: profile.email,
      createdAt: profile.createdAt
    };
    sessionStorage.setItem('mock_academic_profile', JSON.stringify(updatedProfile));

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
