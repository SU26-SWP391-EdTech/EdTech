import api from '../../lib/axios';
import type { BackendCourse } from '../course/course.service';

export interface Tag {
  tagId: number;
  name: string;
}

export interface BrowseCoursesByTagResponse {
  tag: Tag;
  courses: BackendCourse[];
  total: number;
}

export async function getAllTags(): Promise<Tag[]> {
  const response = await api.get('/tags');
  return response.data;
}

export async function searchTags(keyword: string): Promise<Tag[]> {
  const response = await api.get('/tags/search', {
    params: { keyword },
  });
  return response.data;
}

export async function createTag(name: string): Promise<Tag> {
  const response = await api.post('/tags', { name });
  return response.data;
}

export async function getCoursesByTag(
  tagId: number,
  page = 1,
  limit = 20,
): Promise<BrowseCoursesByTagResponse> {
  const response = await api.get(`/tags/${tagId}/courses`, {
    params: { page, limit },
  });
  return response.data;
}
