export interface AssessmentOption {
    id: string;
    text: string;
}

export interface AssessmentQuestion {
    id: number;
    type: 'single-choice' | 'multiple-choice';
    content: string;
    options: AssessmentOption[];
    points?: number;
}

export interface AssessmentAttempt {
    id?: number;
    date: string;
    score: number;
    duration: string;
}

export interface AssessmentMetadata {
    id: number;
    title: string;
    description: string;
    timeLimit: number; // in minutes (0 for unlimited)
    questionCount: number;
    course: string;
    attempts: number;
    bestScore: number;
    pointsReward: number;
}

export interface AnswerReviewItem {
    id: number;
    content: string;
    type: 'single-choice' | 'multiple-choice';
    isCorrect: boolean;
    selected: string[];
    correct: string[];
    options: AssessmentOption[];
    explanation?: string;
}

export interface AssessmentResultSummary {
    score: number;
    totalQuestions: number;
    correctCount: number;
    incorrectCount: number;
    duration: string;
    assessment: string;
    submittedAt: string;
    pointsEarned: number;
}
