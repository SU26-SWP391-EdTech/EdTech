import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/auth.stores';
import { getAcademicProfile, editAcademicProfile, getUserById, type AcademicProfileResponse, type UserResponse } from '../../services/user/user.service';
import { searchCourses, type BackendCourse } from '../../services/course.service';
import toast from 'react-hot-toast';

export function useProviderProfile(providerId?: number) {
    const [profile, setProfile] = useState<AcademicProfileResponse | null>(null);
    const [user, setUser] = useState<UserResponse | null>(null);
    const [courses, setCourses] = useState<BackendCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [editing, setEditing] = useState(false);
    const [fullName, setFullName] = useState('');
    const [expertise, setExpertise] = useState('');
    const [experienceYears, setExperienceYears] = useState('');
    const [toastActive, setToastActive] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const loggedInUser = useAuthStore((state) => state.user);
    const canEdit = !!(loggedInUser && providerId && loggedInUser.userId === providerId);

    const fetchProfile = async () => {
        if (!providerId) return;
        try {
            setLoading(true);
            const [profRes, userRes, coursesRes] = await Promise.all([
                getAcademicProfile(providerId),
                getUserById(providerId),
                searchCourses({ userId: providerId })
            ]);
            setProfile(profRes);
            setUser(userRes);
            setCourses(coursesRes.data?.items || []);
            setFullName(userRes.fullName || '');
            setExpertise(profRes?.expertise || '');
            setExperienceYears(profRes?.experienceYears !== undefined && profRes?.experienceYears !== null ? String(profRes.experienceYears) : '0');
        } catch (err: any) {
            console.error("Failed to load provider profile:", err);
            setError(err.message || "Failed to load provider profile");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [providerId]);

    const save = async () => {
        if (!providerId) return;
        setIsSaving(true);
        try {
            let updatedData;
            if (avatarFile) {
                const formData = new FormData();
                formData.append('fullName', fullName);
                formData.append('expertise', expertise);
                formData.append('experienceYears', String(parseInt(experienceYears, 10) || 0));
                formData.append('avatarUrl', avatarFile);

                updatedData = await editAcademicProfile(providerId, formData);
            } else {
                const payload = {
                    fullName,
                    expertise: expertise || '',
                    experienceYears: parseInt(experienceYears, 10) || 0,
                };
                updatedData = await editAcademicProfile(providerId, payload);
            }

            // Cập nhật local state
            setProfile({
                ...profile,
                fullName: updatedData.fullName,
                expertise: updatedData.userProfile?.expertise,
                experienceYears: updatedData.userProfile?.experienceYears,
                avatarUrl: updatedData.avatar,
            });

            if (user) {
                setUser({
                    ...user,
                    fullName: updatedData.fullName,
                    avatarUrl: updatedData.avatar,
                });
            }

            // Đồng bộ với Auth Store nếu là chính mình
            if (canEdit && loggedInUser) {
                useAuthStore.setState({
                    user: {
                        ...loggedInUser,
                        fullName: updatedData.fullName,
                        avatarUrl: updatedData.avatar,
                    }
                });
            }

            setAvatarFile(null);
            setEditing(false);
            setToastActive(true);
            setTimeout(() => setToastActive(false), 3000);
            toast.success("Profile saved successfully!");
        } catch (err: any) {
            console.error("Failed to save profile:", err);
            toast.error(err.response?.data?.message || "Failed to save profile");
        } finally {
            setIsSaving(false);
        }
    };

    const cancel = () => {
        setFullName(user?.fullName || '');
        setExpertise(profile?.expertise || '');
        setExperienceYears(profile?.experienceYears !== undefined && profile?.experienceYears !== null ? String(profile.experienceYears) : '0');
        setAvatarFile(null);
        setEditing(false);
    };

    return {
        profile,
        user,
        courses,
        loading,
        error,
        editing,
        setEditing,
        fullName,
        setFullName,
        expertise,
        setExpertise,
        experienceYears,
        setExperienceYears,
        toast: toastActive,
        setToast: setToastActive,
        save,
        isSaving,
        cancel,
        avatarFile,
        setAvatarFile,
        canEdit,
        refresh: fetchProfile
    };
}
