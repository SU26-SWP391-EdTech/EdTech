import api from '../../lib/axios';

export type CourseStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'

export interface Course {
  courseId: number;
  userId: number;

  title: string;
  description: string;

  status: CourseStatus;

  thumbnailUrl: string | null;
  projectUrl: string | null;

  language: string;
  duration: number;

  totalLessons: number;
  enrollmentCount: number;

  reviewedBy: number | null;

  createdAt: string;
  updatedAt: string;
};

export async function getCourses() {
  const response = await api.get<Course[]>('/courses');
  return response.data;
}