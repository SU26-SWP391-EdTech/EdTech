import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/auth/auth.stores';
import type { ProfileData } from '../../components/User/Profile/admin/EditProfileModal';
import { getUserById, updateUser } from '../../services/user/user.service';
import toast from 'react-hot-toast';

/**
 * Chuyển đổi mã tên vai trò thành nhãn hiển thị thân thiện trên giao diện.
 * 
 * @param roleName - Tên vai trò dạng chữ viết thường hoặc camelCase từ database
 * @returns Nhãn hiển thị viết hoa chuẩn hóa (ví dụ: 'Academic Manager')
 */
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

/**
 * Custom hook quản lý thông tin hồ sơ của Quản trị viên (Admin Profile).
 * Hỗ trợ tải thông tin chi tiết qua `getUserById`, 
 * cập nhật thông tin qua `updateUser` bằng cách chuyển đổi file ảnh đại diện sang chuỗi Base64 (FileReader),
 * và đồng bộ hóa thông tin người dùng trong Auth Store cục bộ.
 */
export function useAdminProfile() {
    const [showEdit, setShowEdit] = useState(false); // Trạng thái ẩn/hiện modal chỉnh sửa hồ sơ
    const [loading, setLoading] = useState(false);   // Trạng thái đang giao tiếp API với server

    const loggedInUser = useAuthStore((state) => state.user);

    // Khởi tạo trạng thái profile ban đầu từ thông tin lưu trong Auth Store cục bộ
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

    /**
     * Gọi API lấy thông tin chi tiết của quản trị viên theo userId.
     */
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

    // Sử dụng cleanup function với biến active để tránh cập nhật state khi component đã unmounted
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

    /**
     * Gửi yêu cầu cập nhật hồ sơ quản trị viên lên Backend.
     * Hỗ trợ đọc file ảnh cục bộ (avatarFile) và chuyển đổi thành chuỗi Base64 bằng FileReader trước khi gửi qua API JSON.
     * Cập nhật đồng bộ thông tin trong Auth Store.
     * 
     * @param updated - Thông tin cập nhật bao gồm tên, ảnh đại diện, chuyên môn, số năm kinh nghiệm, avatar file.
     */
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

            // Nếu người dùng tải lên file ảnh đại diện mới, chuyển đổi file sang Base64
            if (updated.avatarFile) {
                avatarUrlToSend = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(updated.avatarFile!);
                });
            }

            // Gọi API cập nhật thông tin User cơ bản
            const res = await updateUser(loggedInUser.userId, {
                fullName: updated.name,
                avatar_url: avatarUrlToSend,
            });

            // Cập nhật Auth Store cục bộ
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
