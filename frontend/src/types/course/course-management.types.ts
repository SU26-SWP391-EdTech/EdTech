import type { ReactNode } from 'react';

export type CourseStatus = 'Published' | 'Draft' | 'Pending Review' | 'Rejected';
export type Category = 'Web Development' | 'Data Science' | 'Design' | 'Marketing' | 'Business' | 'DevOps';

export interface Course {
  id: number;
  title: string;
  description: string;
  provider: string;
  providerInitials: string;
  providerColor: string;
  category: Category;
  status: CourseStatus;
  students: number;
  rating: number;
  duration: string;
  lessons: number;
  created: string;
  updated: string;
  thumbBg: string;
  thumbIcon: ReactNode;
  progress: number;
  language: string;
  thumbnailUrl?: string | null;
  projectUrl?: string | null;
  slug?: string;
  level?: string;
}
