export interface AssessmentOption {
    id: string;
    text: string;
}

export interface AssessmentQuestion {
    id: number;
    type: 'single-choice' | 'multiple-choice';
    content: string;
    options: AssessmentOption[];
}

export interface AssessmentAttempt {
    id?: number;
    date: string;
    score: number;
    passed: boolean;
    duration: string;
}

export interface AssessmentMetadata {
    id: number;
    title: string;
    description: string;
    timeLimit: number; // in minutes (0 for unlimited)
    passScore: number; // out of 100
    questionCount: number;
    difficulty: string;
    course: string;
    attempts: number;
    bestScore: number;
    topics: string[];
    xpReward: number;
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
    passScore: number;
    isPassed: boolean;
    totalQuestions: number;
    correctCount: number;
    incorrectCount: number;
    duration: string;
    assessment: string;
    submittedAt: string;
    xpEarned: number;
}
