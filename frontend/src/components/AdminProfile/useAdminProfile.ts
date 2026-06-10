import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/auth.stores';
import type { ProfileData } from './EditProfileModal';

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

            const { MOCK_ACADEMIC_PROFILE } = await import('../../db/data');
            const stored = sessionStorage.getItem('mock_admin_profile');
            const res = stored ? JSON.parse(stored) : { ...MOCK_ACADEMIC_PROFILE, fullName: 'Phạm Hồng Admin', email: 'admin@edtech.com', bio: 'dang cap vcl' };

            setProfile({
                name: res.fullName || loggedInUser.fullName || 'No Name',
                email: res.email || loggedInUser.email,
                bio: res.bio || 'dang cap vcl',
                location: 'Not set',
                organization: 'EdTech Platform',
                avatar: res.avatarUrl || loggedInUser.avatarUrl || '',
                expertise: res.expertise || 'Not set',
                experienceYear: res.experienceYears !== undefined && res.experienceYears !== null ? `${res.experienceYears} years` : '10 years',
                createdAt: res.createdAt ? new Date(res.createdAt).toLocaleDateString('en-US', {
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
                bio: 'dang cap vcl',
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

        const yearsMatch = updated.experienceYear.match(/\d+/);
        const years = yearsMatch ? parseInt(yearsMatch[0], 10) : 10;

        const updatedProfile = {
            fullName: updated.name,
            expertise: updated.expertise,
            experienceYears: years,
            avatarUrl: updated.avatar,
            bio: profile.bio,
            email: profile.email,
            createdAt: profile.createdAt
        };
        sessionStorage.setItem('mock_admin_profile', JSON.stringify(updatedProfile));

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
        profile,
        loading,
        showEdit,
        setShowEdit,
        handleSave,
    };
}
