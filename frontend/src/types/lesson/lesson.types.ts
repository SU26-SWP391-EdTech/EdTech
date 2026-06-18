export interface Lesson {
  id: string | number;
  title: string;
  duration: string;
  type?: string;
  preview?: boolean;
  videoUrl?: string;
  content?: string;
  hasVideo?: boolean;
  hasReading?: boolean;
  status: 'completed' | 'current' | 'upcoming' | 'locked';
}

export interface Module {
  id: string | number;
  title: string;
  lessons: Lesson[];
  progress: number;
  description?: string;
}

export interface Note {
  id: number;
  timestamp: string;
  content: string;
  color: string;
}

export interface Question {
  id: number;
  author: string;
  avatar: string;
  text: string;
  answers: number;
  upvotes: number;
  time: string;
}

export interface MockEnrollment {
  enrollmentId: number;
  enrolledAt: string;
  status: string;
  progress: number;
  lastAccessedAt: string | null;
  completedAt: string | null;
  expiresAt: string | null;
  course: any;
  completedLessonIds?: string[];
}
