import api from '../../lib/axios';

export interface UserResponse {
  userId: number;
  fullName: string;
  email: string;
  avatar: string | null;
  createdAt: string;
  isEmailVerified: boolean;
  role: {
    roleId: number;
    roleName: 'admin' | 'learner' | 'course provider' | 'academic manager';
  };
}

export interface AcademicProfileResponse {
  fullName: string;
  email: string;
  avatarUrl: string | null;
  expertise?: string;
  experienceYears?: number;
  createdAt: string;
}

// Lấy toàn bộ danh sách người dùng (Admin)
export async function getUsers(): Promise<UserResponse[]> {
  const response = await api.get('/user');
  return response.data;
}

// Lấy người dùng theo ID
export async function getUserById(id: number): Promise<UserResponse> {
  const response = await api.get(`/user/${id}`);
  return response.data;
}

// Tạo người dùng mới (Admin)
export async function createUser(data: {
  fullName: string;
  email: string;
  password?: string;
  roleName: string;
  avatar_url?: string;
  isEmailVerified?: boolean;
}) {
  const response = await api.post('/user', data);
  return response.data;
}

// Cập nhật thông tin cơ bản người dùng (Tên, Ảnh đại diện)
export async function updateUser(id: number, data: { fullName?: string; avatar_url?: string; isEmailVerified?: boolean }) {
  const response = await api.patch(`/user/${id}`, data);
  return response.data;
}

// Xóa người dùng (Admin)
export async function deleteUser(id: number) {
  const response = await api.delete(`/user/${id}`);
  return response.data;
}

// Thay đổi mật khẩu của tài khoản hiện tại
export async function changePassword(data: any) {
  const response = await api.patch('/user/change-password', data);
  return response.data;
}

// Lấy hồ sơ học thuật (Academic User Profile)
export async function getAcademicProfile(id: number): Promise<AcademicProfileResponse> {
  const response = await api.get(`/user/academic-user/${id}`);
  return response.data;
}

// Chỉnh sửa hồ sơ học thuật (Hỗ trợ upload ảnh/file dạng FormData)
export async function editAcademicProfile(id: number, formData: FormData) {
  const response = await api.patch(`/user/edit-academic-user-profile/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

// Cập nhật thông tin học thuật cơ bản (dạng JSON)
export async function updateAcademicProfile(id: number, data: { expertise?: string; experienceYears?: number }) {
  const response = await api.patch(`/user/update-academic-user-profile/${id}`, data);
  return response.data;
}

