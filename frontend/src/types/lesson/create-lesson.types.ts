export type LessonType = 'video' | 'reading' | 'quiz' | 'assignment' | 'practice' | 'external';
export type ModalType = 'resource' | 'quiz' | 'publish' | null;
export type LessonStatus = 'draft' | 'pending' | 'published';

export interface Objective {
    id: string;
    text: string;
}

export interface Resource {
    id: string;
    name: string;
    type: string;
    size: string;
    visibility: 'public' | 'enrolled';
}

export interface QuizQuestion {
    id: string;
    text: string;
    type: string;
    options: string[];
    correct: number;
}

export interface ChecklistItem {
    key: string;
    label: string;
}
