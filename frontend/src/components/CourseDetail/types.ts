export type LessonStatus = 'completed' | 'current' | 'locked' | 'not-started';
export type LessonType = 'Video' | 'Reading' | 'Quiz' | 'Assignment';

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  duration: string;
  status: LessonStatus;
  preview?: boolean;
  videoUrl?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  progress: number;
}
