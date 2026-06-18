import api from '../../lib/axios';

export interface CourseUser {
  userId: number;
  fullName: string;
  avatar: string | null;
  avatarUrl?: string | null;
}

export interface BackendCourse {
  courseId: number;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  projectUrl: string | null;
  language: string | null;
  duration: number | null;
  totalLessons: number;
  createdAt: string;
  updatedAt: string | null;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  user: CourseUser;
  enrollmentCount?: number;
}

export type Course = BackendCourse;

export interface SearchCoursesResponse {
  statusCode: number;
  message: string;
  data: {
    items: BackendCourse[];
    meta: {
      total: number;
      count: number;
    };
  };
}

export async function getCourseById(id: number): Promise<BackendCourse> {
  const response = await api.get(`/courses/${id}`);
  return response.data;
}

// Tạo khóa học mới (FormData để upload file thumbnail)
export async function createCourse(formData: FormData): Promise<BackendCourse> {
  const response = await api.post('/courses', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function submitNewCourseToReview(formData: FormData): Promise<BackendCourse> {
  const response = await api.post('/courses/submit-to-review', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function submitCourseToReview(id: number): Promise<BackendCourse> {
  const response = await api.post(`/courses/${id}/submit-review`);
  return response.data;
}

export async function searchCourses(params?: {
  search?: string;
  status?: string;
  language?: string;
  minDuration?: number;
  maxDuration?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  userId?: number;
}): Promise<SearchCoursesResponse> {
  const response = await api.get('/courses/search', { params });
  return response.data;
}

// Lấy danh sách khóa học của giảng viên hiện tại
export async function getMyCourses(userId: number): Promise<BackendCourse[]> {
  const response = await searchCourses({ userId });
  return response.data?.items || [];
}

// Cập nhật thông tin khóa học (chấp nhận cả FormData nếu upload file)
export async function updateCourse(id: number, data: FormData | any): Promise<BackendCourse> {
  const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
  const response = await api.patch(`/courses/${id}`, data, { headers });
  return response.data;
}

// Xóa khóa học
export async function deleteCourse(id: number): Promise<{ message: string }> {
  const response = await api.delete(`/courses/${id}`);
  return response.data;
}

// Phê duyệt khóa học
export async function approveCourse(id: number): Promise<BackendCourse> {
  const response = await api.patch(`/courses/${id}/approve`);
  return response.data;
}

// Từ chối khóa học
export async function rejectCourse(id: number): Promise<BackendCourse> {
  const response = await api.patch(`/courses/${id}/reject`);
  return response.data;
}
