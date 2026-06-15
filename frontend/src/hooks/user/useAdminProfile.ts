import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/auth/auth.stores';
import type { ProfileData } from '../../components/user/profile/admin/EditProfileModal';
import { getUserById, updateUser } from '../../services/user/user.service';
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

export function useAdminProfile() {
    const [showEdit, setShowEdit] = useState(false);
    const [loading, setLoading] = useState(false);

    const loggedInUser = useAuthStore((state) => state.user);

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

    const fetchProfileData = useCallback(async () => {
        if (!loggedInUser) return;
        try {
            setLoading(true);

            const res = await getUserById(loggedInUser.userId);

            setProfile({
                name: res?.fullName || loggedInUser.fullName || 'No Name',
                email: res?.email || loggedInUser.email,
                bio: 'Platform Administrator',
                location: 'Not set',
                organization: 'EdTech Platform',
                avatar: res?.avatar || loggedInUser.avatarUrl || '',
                expertise: 'Not set',
                experienceYear: 'N/A',
                createdAt: res?.createdAt ? new Date(res.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }) : '—',
                role: loggedInUser.roleName ? mapRoleNameToLabel(loggedInUser.roleName) : 'User',
            });
        } catch (err) {
            console.error('Failed to load profile', err);
            setProfile({
                name: loggedInUser.fullName || 'No Name',
                email: loggedInUser.email,
                bio: 'Platform Administrator',
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
    }, [loggedInUser]);

    useEffect(() => {
        let active = true;
        const load = async () => {
            await Promise.resolve();
            if (active) {
                fetchProfileData();
            }
        };
        load();
        return () => {
            active = false;
        };
    }, [fetchProfileData]);

    const handleSave = async (updated: {
        name: string;
        avatar: string;
        expertise: string;
        experienceYear: string;
        avatarFile?: File | null;
    }) => {
        if (!loggedInUser) return;

        try {
            setLoading(true);
            let avatarUrlToSend = updated.avatar;

            if (updated.avatarFile) {
                avatarUrlToSend = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(updated.avatarFile!);
                });
            }

            const res = await updateUser(loggedInUser.userId, {
                fullName: updated.name,
                avatar_url: avatarUrlToSend,
            });

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
        profile,
        loading,
        showEdit,
        setShowEdit,
        handleSave,
    };
}
