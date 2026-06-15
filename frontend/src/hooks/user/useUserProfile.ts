import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/auth/auth.stores';
import type { ProfileData } from '../../types/user/user-profile.types';
import { getAcademicProfile, editAcademicProfile } from '../../services/user/user.service';
import toast from 'react-hot-toast';

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

      const res = await getAcademicProfile(loggedInUser.userId);

      setProfile({
        name: res?.fullName || loggedInUser.fullName || 'No Name',
        email: res?.email || loggedInUser.email,
        bio: '',
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

    try {
      setLoading(true);
      const yearsMatch = updated.experienceYear.match(/\d+/);
      const years = yearsMatch ? parseInt(yearsMatch[0], 10) : 0;

      const formData = new FormData();
      formData.append('fullName', updated.name);
      formData.append('expertise', updated.expertise);
      formData.append('experienceYears', String(years));
      if (updated.avatarFile) {
        formData.append('avatarUrl', updated.avatarFile);
      } else if (updated.avatar) {
        formData.append('avatarUrl', updated.avatar);
      }

      const res = await editAcademicProfile(loggedInUser.userId, formData);

      useAuthStore.setState({
        user: {
          ...loggedInUser,
          fullName: res.fullName || updated.name,
          avatarUrl: res.avatar || updated.avatar,
        }
      });

      toast.success('Profile updated successfully!');
      await fetchProfileData();
    } catch (err: any) {
      console.error('Failed to save profile', err);
      toast.error(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
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
