import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/auth/auth.stores';
import { getAcademicProfile, editAcademicProfile, getUserById, type AcademicProfileResponse, type UserResponse } from '../../services/user/user.service';
import { searchCourses, type BackendCourse } from '../../services/course/course.service';
import toast from 'react-hot-toast';

/**
 * Custom hook quản lý thông tin hồ sơ của Giảng viên / Nhà cung cấp khóa học (Course Provider).
 * Hỗ trợ các chức năng:
 * - Kiểm tra quyền chỉnh sửa (`canEdit`): Chỉ cho phép chỉnh sửa nếu ID người dùng hiện tại khớp với ID nhà cung cấp khóa học.
 * - Tải dữ liệu hồ sơ chuyên sâu (`getAcademicProfile`), thông tin tài khoản cơ bản (`getUserById`), và danh sách các khóa học do giảng viên này xây dựng (`searchCourses`).
 * - Lưu cập nhật thông tin: Đổ dữ liệu qua biểu mẫu dưới dạng Multipart FormData nếu cập nhật ảnh đại diện mới, hoặc JSON thông thường.
 * - Đồng bộ Auth Store cục bộ sau khi lưu thành công để cập nhật hiển thị ngay lập tức.
 * 
 * @param providerId - ID của nhà cung cấp khóa học cần xem/sửa hồ sơ
 */
export function useProviderProfile(providerId?: number) {
    // --- 1. DỮ LIỆU TẢI VỀ TỪ API ---
    const [profile, setProfile] = useState<AcademicProfileResponse | null>(null); // Hồ sơ giảng dạy & chuyên môn
    const [user, setUser] = useState<UserResponse | null>(null);                  // Thông tin người dùng cơ bản
    const [courses, setCourses] = useState<BackendCourse[]>([]);                  // Các khóa học được tạo bởi giảng viên này

    // --- 2. TRẠNG THÁI GIAO DIỆN (UI STATES) ---
    const [loading, setLoading] = useState(true);                                 // Trạng thái đang tải dữ liệu
    const [isSaving, setIsSaving] = useState(false);                             // Trạng thái đang lưu dữ liệu
    const [error, setError] = useState<string | null>(null);                     // Thông báo lỗi nếu có

    // --- 3. BIỂU MẪU CHỈNH SỬA (FORM STATES) ---
    const [editing, setEditing] = useState(false);                               // Trạng thái bật/tắt form chỉnh sửa
    const [fullName, setFullName] = useState('');
    const [expertise, setExpertise] = useState('');
    const [experienceYears, setExperienceYears] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);             // File ảnh đại diện mới được chọn

    const loggedInUser = useAuthStore((state) => state.user);
    // Quyền chỉnh sửa: Chỉ người sở hữu tài khoản mới có quyền sửa đổi thông tin
    const canEdit = !!(loggedInUser && providerId && loggedInUser.userId === providerId);

    /**
     * Tải thông tin hồ sơ của Giảng viên, thông tin tài khoản và danh sách khóa học do giảng viên sở hữu.
     */
    const fetchProfile = async () => {
        if (!providerId) return;
        try {
            setLoading(true);
            const [profRes, userRes, coursesRes] = await Promise.all([
                getAcademicProfile(providerId),
                getUserById(providerId),
                searchCourses({ userId: providerId }) // Tìm các khóa học có người tạo là providerId
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

    /**
     * Gửi yêu cầu lưu thông tin cập nhật hồ sơ giảng viên lên Backend.
     * Sử dụng FormData nếu có thay đổi avatarFile, ngược lại sử dụng JSON.
     * Sau khi lưu thành công, tiến hành đồng bộ Auth Store.
     */
    const save = async () => {
        if (!providerId) return;
        setIsSaving(true);
        try {
            if (avatarFile) {
                const formData = new FormData();
                formData.append('fullName', fullName);
                formData.append('expertise', expertise);
                formData.append('experienceYears', String(parseInt(experienceYears, 10) || 0));
                formData.append('avatar', avatarFile);
                await editAcademicProfile(providerId, formData);
            } else {
                const payload = {
                    fullName,
                    expertise: expertise || '',
                    experienceYears: parseInt(experienceYears, 10) || 0,
                };
                await editAcademicProfile(providerId, payload);
            }

            // Tải lại thông tin mới nhất từ Server để đồng bộ lại giao diện
            await fetchProfile();

            // Đồng bộ Auth Store nếu người dùng đang chỉnh sửa hồ sơ của chính mình
            if (canEdit && loggedInUser) {
                const [profRes, userRes] = await Promise.all([
                    getAcademicProfile(providerId),
                    getUserById(providerId),
                ]);
                useAuthStore.setState({
                    user: {
                        ...loggedInUser,
                        fullName: userRes.fullName,
                        avatarUrl: profRes.avatarUrl || userRes.avatarUrl || userRes.avatar || loggedInUser.avatarUrl,
                    }
                });
            }

            setAvatarFile(null);
            setEditing(false);
            toast.success('Profile saved successfully!');
        } catch (err: any) {
            console.error('Failed to save profile:', err);
            toast.error(err.response?.data?.message || 'Failed to save profile');
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Hủy bỏ quá trình chỉnh sửa hồ sơ, phục hồi các trường thông tin về trạng thái trước đó.
     */
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
        save,
        isSaving,
        cancel,
        avatarFile,
        setAvatarFile,
        canEdit,
        refresh: fetchProfile
    };
}
