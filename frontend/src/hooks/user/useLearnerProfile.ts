import { useState, useEffect } from 'react';
import type { LearnerProfile } from '../../services/learner/learner.services';
import { getLearnerProfile, editLearnerProfile } from '../../services/learner/learner.services';
import { getUserById, type UserResponse } from '../../services/user/user.service';
import { getMyEnrollments, type Enrollment } from '../../services/enrollment/enrollment.service';
import { getLearningPaths, type LearningPath, getFollowedLearningPathIds } from '../../services/learning-path/learning-path.service';
import { useAuthStore } from '../../stores/auth/auth.stores';
import toast from 'react-hot-toast';


export function useLearnerProfile(userId?: number) {

    const [profile, setProfile] = useState<LearnerProfile | null>(null);
    const [user, setUser] = useState<UserResponse | null>(null);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [editing, setEditing] = useState(false);
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [goal, setGoal] = useState('');
    const [toastActive, setToastActive] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const loggedInUser = useAuthStore((state) => state.user);
    const canEdit = !!(loggedInUser && userId && loggedInUser.userId === userId);

    const completedCount = enrollments.filter(e => e.completedAt).length;
    const avgProgress = enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError(null);

                const [learnerData, userResponse, enrollmentsResponse, pathsResponse, followedIds] = await Promise.all([
                    getLearnerProfile(userId),
                    getUserById(userId),
                    getMyEnrollments(),
                    getLearningPaths(),
                    getFollowedLearningPathIds(),
                ])
                setProfile({
                    ...learnerData,
                    currentStreak: (learnerData as any).currentStreak ?? 3,
                    longestStreak: (learnerData as any).longestStreak ?? 12,
                });
                setUser(userResponse);
                setEnrollments(enrollmentsResponse);

                // Lọc những learning path mà user đã follow
                const followedPaths = pathsResponse.filter(path => 
                    followedIds.includes(path.learningPathId)
                );
                setLearningPaths(followedPaths);

                setFullName(userResponse.fullName || '');
                setBio(learnerData.bio || '');
                setGoal(learnerData.learningGoal || '');
            } catch (err: any) {
                setError(err.message || "Failed to fetch profile");
            } finally {
                setLoading(false);
            }
        };
        if (userId) {
            fetchProfile();
        }
    }, [userId])

    const save = async () => {
        setIsSaving(true);
        try {
            let updatedData;
            if (avatarFile) {
                const formData = new FormData();
                formData.append('fullName', fullName);
                formData.append('bio', bio);
                formData.append('learningGoal', goal);
                formData.append('avatarUrl', avatarFile);

                updatedData = await editLearnerProfile(userId, formData);
            } else {
                const payload = {
                    fullName,
                    bio: bio || '',
                    learningGoal: goal || '',
                };
                console.log("[DEBUG JSON Payload]", payload);
                updatedData = await editLearnerProfile(userId, payload);
            }

            // Cập nhật local state để UI hiển thị mới ngay lập tức
            if (user) {
                setUser({ ...user, fullName: updatedData.fullName, avatarUrl: updatedData.avatarUrl });
            }
            if (profile) {
                setProfile({
                    ...profile,
                    bio: updatedData.bio,
                    learningGoal: updatedData.learningGoal,
                    avatarUrl: updatedData.avatarUrl
                });
            }

            // Cập nhật useAuthStore để đồng bộ trên toàn ứng dụng (ví dụ: header, sidebar)
            const currentAuthUser = useAuthStore.getState().user;
            if (currentAuthUser) {
                useAuthStore.setState({
                    user: {
                        ...currentAuthUser,
                        fullName: updatedData.fullName,
                        avatarUrl: updatedData.avatarUrl,
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
            if (err.response && err.response.data) {
                console.error("Validation error details:", JSON.stringify(err.response.data));
            }
            setError(err.message || "Failed to save profile");
            toast.error(err.response?.data?.message || "Failed to save profile");
        } finally {
            setIsSaving(false);
        }
    }

    const cancel = () => {
        setFullName(user?.fullName || '');
        setBio(profile?.bio || '');
        setGoal(profile?.learningGoal || '');
        setAvatarFile(null);
        setEditing(false);
    }

    return {
        profile,
        user,
        enrollments,
        learningPaths,
        loading,
        error,
        editing,
        setEditing,
        fullName,
        setFullName,
        bio,
        setBio,
        goal,
        setGoal,
        toast: toastActive,
        setToast: setToastActive,
        save,
        isSaving,
        cancel,
        avatarFile,
        setAvatarFile,
        completedCount,
        avgProgress,
        canEdit,
    }
}