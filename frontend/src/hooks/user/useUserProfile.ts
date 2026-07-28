import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/auth/auth.stores';
import type { ProfileData } from '../../types/user/user-profile.types';
import { getAcademicProfile, editAcademicProfile } from '../../services/user/user.service';
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
 * Custom hook quản lý hồ sơ cá nhân người dùng nói chung (User Profile).
 * Hỗ trợ tải hồ sơ chi tiết của giảng viên / quản lý đào tạo (`academicProfile`),
 * cập nhật thông tin hồ sơ thông qua `FormData` kèm tải lên file ảnh đại diện (avatar),
 * và cập nhật lại thông tin đồng bộ trong kho lưu trữ Auth Store cục bộ.
 */
export function useUserProfile() {
  const [showEdit, setShowEdit] = useState(false); // Trạng thái ẩn/hiện form chỉnh sửa
  const [loading, setLoading] = useState(false);   // Trạng thái đang giao tiếp API

  const loggedInUser = useAuthStore((state) => state.user);

  // Khởi tạo trạng thái profile ban đầu từ thông tin đăng nhập trong Auth Store
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
    roleName: loggedInUser?.roleName || '',
  }));

  /**
   * Gọi API tải hồ sơ chuyên sâu của người dùng từ Backend.
   * Nếu thành công, map các thuộc tính chuyên môn (expertise), kinh nghiệm (experienceYears)...
   * Nếu lỗi, fallback về thông tin cơ bản của User đã đăng nhập.
   */
  const fetchProfileData = useCallback(async () => {
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
        experienceYear: res?.experienceYears !== undefined && res?.experienceYears !== null
          ? `${res.experienceYears} years`
          : '0 years',
        createdAt: res?.createdAt
          ? new Date(res.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : '—',
        role: loggedInUser.roleName ? mapRoleNameToLabel(loggedInUser.roleName) : 'User',
        roleName: loggedInUser.roleName || '',
      });
    } catch (err) {
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
        roleName: loggedInUser.roleName || '',
      });
    } finally {
      setLoading(false);
    }
  }, [loggedInUser]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  /**
   * Lưu thông tin hồ sơ thay đổi lên Backend thông qua FormData.
   * Cập nhật đồng bộ các trường fullName và avatarUrl trong Auth Store để thay đổi có hiệu lực ngay trên header/thanh điều hướng.
   * 
   * @param updated - Các trường thông tin cập nhật bao gồm tên, chuyên môn, số năm kinh nghiệm, avatar link hoặc file upload.
   */
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
      // Tách lấy phần số của số năm kinh nghiệm từ chuỗi (Ví dụ: "5 years" -> 5)
      const yearsMatch = updated.experienceYear.match(/\d+/);
      const years = yearsMatch ? parseInt(yearsMatch[0], 10) : 0;

      const formData = new FormData();
      formData.append('fullName', updated.name);
      formData.append('expertise', updated.expertise);
      formData.append('experienceYears', String(years));
      if (updated.avatarFile) {
        formData.append('avatar', updated.avatarFile); // Đính kèm file ảnh upload thực tế
      } else if (updated.avatar) {
        formData.append('avatarUrl', updated.avatar);
      }

      // Backend trả về thực thể User thô sau khi chỉnh sửa
      const res = await editAcademicProfile(loggedInUser.userId, formData);
      const newAvatarUrl = res.avatar || res.avatarUrl || updated.avatar;

      // Cập nhật Auth Store cục bộ
      useAuthStore.setState({
        user: {
          ...loggedInUser,
          fullName: res.fullName || updated.name,
          avatarUrl: newAvatarUrl,
        }
      });

      toast.success('Profile updated successfully!');
      // Gọi lại API để đồng bộ dữ liệu chuẩn hóa từ server
      await fetchProfileData();
    } catch (err) {
      console.error('Failed to save profile', err);
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to save profile. Please try again.');
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
