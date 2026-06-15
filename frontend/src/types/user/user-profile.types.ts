export interface ProfileData {
  name: string;
  email: string;
  bio: string;
  location: string;
  organization: string;
  avatar: string;
  expertise: string;
  experienceYear: string;
  createdAt: string;
  role: string;
}

export type CourseStatus = 'Completed' | 'In Progress' | 'Not Started';

export interface CourseHistoryItem {
  name: string;
  provider: string;
  status: CourseStatus;
  pct: number;
  date: string;
}
