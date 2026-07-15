import { useState, useEffect } from 'react';
import type { LearnerProfile } from '../../services/learner/learner.services';
import { getLearnerProfile, editLearnerProfile } from '../../services/learner/learner.services';
import { getUserById, type UserResponse } from '../../services/user/user.service';
import { getMyEnrollments, type Enrollment } from '../../services/enrollment/enrollment.service';
import { getLearningPaths, type LearningPath, getFollowedLearningPathIds } from '../../services/learning-path/learning-path.service';
import { useAuthStore } from '../../stores/auth/auth.stores';
import toast from 'react-hot-toast';


/**
 * Custom hook quản lý hồ sơ cá nhân của Học viên (Learner Profile).
 * Phục vụ cho giao diện xem hồ sơ cá nhân hoặc xem trang công khai của một học viên khác.
 * 
 * Các chức năng chính:
 * - Kiểm tra quyền chỉnh sửa (`canEdit`): Chỉ cho phép chỉnh sửa nếu ID người dùng đăng nhập trùng với ID hồ sơ đang xem.
 * - Tải dữ liệu tổng hợp: Learner Profile (streak, bio, goals), User thông thường (name, email), danh sách khóa học (enrollments) và lộ trình (learningPaths).
 * - Lưu thay đổi: Hỗ trợ tự động chuyển đổi sang FormData nếu có chọn file ảnh đại diện mới (avatarFile), ngược lại gửi payload JSON thường để tiết kiệm băng thông.
 * - Hủy bỏ chỉnh sửa (`cancel`): Khôi phục lại các giá trị biểu mẫu về dữ liệu cũ.
 * - Đồng bộ Auth Store toàn hệ thống để cập nhật ảnh đại diện/tên ngay lập tức trên thanh công cụ.
 * 
 * @param userId - ID của học viên cần tải hồ sơ
 */
export function useLearnerProfile(userId?: number) {
    // --- 1. DỮ LIỆU TẢI VỀ TỪ API ---
    const [profile, setProfile] = useState<LearnerProfile | null>(null);          // Thông tin hồ sơ học tập chi tiết
    const [user, setUser] = useState<UserResponse | null>(null);                  // Thông tin người dùng cơ bản
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);             // Danh sách khóa học tham gia
    const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);       // Danh sách lộ trình đang theo dõi

    // --- 2. TRẠNG THÁI GIAO DIỆN (UI STATES) ---
    const [loading, setLoading] = useState(true);                                 // Đang tải dữ liệu
    const [isSaving, setIsSaving] = useState(false);                             // Đang lưu dữ liệu
    const [error, setError] = useState<string | null>(null);                     // Lỗi tải/lưu dữ liệu

    // --- 3. BIỂU MẪU CHỈNH SỬA (FORM STATES) ---
    const [editing, setEditing] = useState(false);                               // Trạng thái đang chỉnh sửa
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [goal, setGoal] = useState('');
    const [toastActive, setToastActive] = useState(false);                       // Kiểm soát toast nội bộ
    const [avatarFile, setAvatarFile] = useState<File | null>(null);             // File ảnh đại diện mới tải lên

    const loggedInUser = useAuthStore((state) => state.user);
    // Quyền chỉnh sửa: Người dùng hiện tại phải trùng khớp với userId của trang hồ sơ
    const canEdit = !!(loggedInUser && userId && loggedInUser.userId === userId);

    // Tính toán các chỉ số thống kê của học viên dựa trên enrollments tải về
    const completedCount = enrollments.filter(e => e.completedAt).length;         // Số khóa học đã hoàn thành
    const avgProgress = enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length; // Tiến độ trung bình (%)

    // --- 4. EFFECT: TẢI TOÀN BỘ DỮ LIỆU BAN ĐẦU ---
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError(null);

                // Gọi song song 5 API liên quan đến học viên
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

                // Khởi tạo các giá trị cho biểu mẫu chỉnh sửa
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

    /**
     * Gửi yêu cầu cập nhật hồ sơ lên API.
     * Tự động quyết định định dạng gửi lên máy chủ:
     * - Nếu có file ảnh đại diện (`avatarFile`): Gửi dưới dạng Multipart FormData để tải file ảnh lên.
     * - Nếu không có file ảnh: Gửi dưới dạng JSON payload thông thường để tối ưu hóa.
     */
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

    /**
     * Hủy bỏ quá trình chỉnh sửa, khôi phục lại toàn bộ dữ liệu biểu mẫu về giá trị cũ từ API.
     */
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