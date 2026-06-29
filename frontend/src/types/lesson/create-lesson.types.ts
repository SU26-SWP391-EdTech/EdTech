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

export type AssessmentType = 'LESSON_QUIZ' | 'PRACTICE' | 'PVP';
export type QuestionType = 'MULTIPLE_CHOICE_SINGLE' | 'MULTIPLE_CHOICE_MULTI' | 'TRUE_FALSE';

export interface QuestionOption {
    id: string;
    content: string;
    isCorrect: boolean;
}

export interface AssessmentQuestion {
    id: string;
    content: string;
    type: QuestionType;
    points: number;
    options: QuestionOption[];
}

export interface Assessment {
    id: string;
    assessmentId?: number;
    title: string;
    type: AssessmentType;
    questions: AssessmentQuestion[];
}

