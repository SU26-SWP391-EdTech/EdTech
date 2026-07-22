import api from '../../lib/axios';
import type { 
    AssessmentMetadata, 
    AssessmentQuestion, 
    AssessmentAttempt, 
    AssessmentResultSummary,
    AnswerReviewItem
} from '../../types/assessment/assessment.types';
import { getLessonById } from '../lesson/lesson.service';

export class AssessmentService {
    public static async deleteAssessment(assessmentId: number): Promise<void> {
        try {
            await api.delete(`/assessment/${assessmentId}`);
        } catch (error) {
            console.error('Failed to delete assessment from backend:', error);
            throw error;
        }
    }

    // Helper to get local data from localStorage for persistence in mock state
    private static getLocalAttempts(lessonId: number): AssessmentAttempt[] {
        const key = `assessment_attempts_${lessonId}`;
        const stored = localStorage.getItem(key);
        if (!stored) {
            localStorage.setItem(key, JSON.stringify([]));
            return [];
        }
        return JSON.parse(stored);
    }

    private static saveLocalAttempt(lessonId: number, attempt: AssessmentAttempt) {
        const attempts = this.getLocalAttempts(lessonId);
        const nextId = attempts.length > 0 ? Math.max(...attempts.map(x => x.id ?? 0)) + 1 : 1;
        attempts.unshift({ ...attempt, id: nextId });
        localStorage.setItem(`assessment_attempts_${lessonId}`, JSON.stringify(attempts));
    }

    public static async startSession(lessonId: number): Promise<any | null> {
        try {
            let assessmentId: number | null = null;
            const savedAss = localStorage.getItem(`assessments_lesson_${lessonId}`);
            if (savedAss) {
                const parsed = JSON.parse(savedAss);
                if (parsed && parsed.length > 0) {
                    assessmentId = parsed[0].assessmentId;
                }
            }
            if (!assessmentId) {
                const lesson = await getLessonById(lessonId);
                if (lesson && lesson.assessments && lesson.assessments.length > 0) {
                    assessmentId = lesson.assessments[0].assessmentId;
                }
            }
            if (assessmentId) {
                const response = await api.post(`/assessment/${assessmentId}/session`);
                return response.data;
            }
        } catch (e) {
            console.warn('Failed to start session on backend:', e);
        }
        return null;
    }

    public static async getAssessmentInfo(lessonId: number): Promise<{ metadata: AssessmentMetadata; attempts: AssessmentAttempt[] }> {
        const savedAss = localStorage.getItem(`assessments_lesson_${lessonId}`);
        let assessmentId: number | null = null;
        let cachedTitle = '';
        if (savedAss) {
            try {
                const parsed = JSON.parse(savedAss);
                if (parsed && parsed.length > 0) {
                    assessmentId = parsed[0].assessmentId || null;
                    cachedTitle = parsed[0].title || '';
                }
            } catch (e) {}
        }

        let lesson: any = null;
        try {
            lesson = await getLessonById(lessonId);
            if (lesson && lesson.assessments && lesson.assessments.length > 0) {
                assessmentId = lesson.assessments[0].assessmentId || null;
                cachedTitle = lesson.assessments[0].title || '';
            }
        } catch (e) {
            console.warn('Failed to load lesson details in assessment fallback:', e);
        }

        const attempts = this.getLocalAttempts(lessonId);
        const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0;

        let title = cachedTitle || 'Bài kiểm tra';
        let description = 'Bài kiểm tra đánh giá kiến thức.';
        let courseTitle = 'Khóa học';
        let questionCount = 0;
        let pointsReward = 0;

        try {
            const actualQuestions = await this.getQuestions(lessonId);
            if (actualQuestions && actualQuestions.length > 0) {
                questionCount = actualQuestions.length;
                pointsReward = actualQuestions.reduce((sum, q) => sum + (q.points || 10), 0);
            }
        } catch (err) {
            console.warn('Failed to fetch actual questions for metadata:', err);
        }

        if (assessmentId) {
            try {
                const targetCourseId = lesson?.course?.courseId || lesson?.courseId || 8;
                const response = await api.get(`/assessment/courses/${targetCourseId}/lesson/${lessonId}/assessment/${assessmentId}`);
                if (response.data) {
                    title = response.data.title || title;
                }
            } catch (err) {
                console.warn('Failed to fetch assessment details from backend hierarchical route:', err);
            }
        } else if (lesson) {
            title = lesson.title || title;
            if (lesson.description) {
                description = lesson.description;
            }
        }

        const metadata: AssessmentMetadata = {
            id: assessmentId || 0,
            title: title,
            description: description,
            timeLimit: 0,
            attempts: attempts.length,
            bestScore,
            questionCount,
            pointsReward,
            course: courseTitle,
        };
        return { metadata, attempts };
    }

    public static async getQuestions(lessonId: number): Promise<AssessmentQuestion[]> {
        let assessmentId: number | null = null;
        const savedAss = localStorage.getItem(`assessments_lesson_${lessonId}`);
        if (savedAss) {
            try {
                const parsed = JSON.parse(savedAss);
                if (parsed && parsed.length > 0 && parsed[0].questions && parsed[0].questions.length > 0) {
                    return parsed[0].questions.map((q: any, idx: number) => ({
                        id: idx + 1,
                        type: q.type === 'MULTIPLE_CHOICE_MULTI' ? 'multiple-choice' : 'single-choice',
                        content: q.content,
                        points: q.points ? Number(q.points) : 10,
                        options: (q.options || []).map((opt: any) => ({
                            id: opt.id || String(Math.random()),
                            text: opt.content,
                        }))
                    }));
                }
                if (parsed && parsed.length > 0) {
                    assessmentId = parsed[0].assessmentId;
                }
            } catch (e) {
                console.warn('Failed to parse localStorage assessments:', e);
            }
        }

        let lesson: any = null;
        try {
            lesson = await getLessonById(lessonId);
            if (lesson && lesson.assessments && lesson.assessments.length > 0) {
                assessmentId = lesson.assessments[0].assessmentId;
            }
        } catch (e) {
            console.warn('Failed to fetch lesson details for questions:', e);
        }

        if (assessmentId) {
            try {
                const targetCourseId = lesson?.course?.courseId || lesson?.courseId || 8;
                const response = await api.get(`/assessment/courses/${targetCourseId}/lesson/${lessonId}/assessment/${assessmentId}`);
                if (response.data && response.data.questions && response.data.questions.length > 0) {
                    return response.data.questions.map((q: any, idx: number) => ({
                        id: q.questionId || idx + 1,
                        type: q.type === 'MULTIPLE_CHOICE_MULTI' ? 'multiple-choice' : 'single-choice',
                        content: q.content,
                        points: q.points ? Number(q.points) : 10,
                        options: (q.options || []).map((opt: any) => ({
                            id: opt.optionId || opt.id || String(Math.random()),
                            text: opt.content,
                        }))
                    }));
                }
            } catch (err) {
                console.warn('Failed to fetch assessment questions from backend hierarchical route:', err);
            }
        }

        if (lesson) {
            try {
                const targetCourseId = lesson?.course?.courseId || lesson?.courseId || 8;
                const response = await api.get(`/question/courses/${targetCourseId}/lesson/${lessonId}/questions`);
                if (response.data && response.data.length > 0) {
                    return response.data.map((q: any, idx: number) => ({
                        id: q.questionId || idx + 1,
                        type: q.type === 'MULTIPLE_CHOICE_MULTI' ? 'multiple-choice' : 'single-choice',
                        content: q.content,
                        points: q.points ? Number(q.points) : 10,
                        options: (q.options || []).map((opt: any) => ({
                            id: opt.optionId || opt.id || String(Math.random()),
                            text: opt.content,
                        }))
                    }));
                }
            } catch (err) {
                console.warn('Failed to fetch questions directly via QuestionController:', err);
            }
        }

        try {
            const response = await api.get(`/assessment/lesson/${lessonId}/questions`);
            return response.data;
        } catch {
            return [];
        }
    }

    public static async submitAnswers(
        lessonId: number,
        answers: Record<number, string[]>,
        duration: string
    ): Promise<AssessmentResultSummary> {
        try {
            let assessmentId: number | null = null;
            const savedAss = localStorage.getItem(`assessments_lesson_${lessonId}`);
            if (savedAss) {
                try {
                    const parsed = JSON.parse(savedAss);
                    if (parsed && parsed.length > 0) {
                        assessmentId = parsed[0].assessmentId;
                    }
                } catch {}
            }
            if (!assessmentId) {
                const lesson = await getLessonById(lessonId);
                if (lesson && lesson.assessments && lesson.assessments.length > 0) {
                    assessmentId = lesson.assessments[0].assessmentId;
                }
            }

            if (!assessmentId) {
                throw new Error('Assessment ID not found');
            }

            // Convert frontend answers Record<number, string[]> to backend format: SubmitAssessmentDto
            const formattedAnswers = Object.entries(answers).map(([qId, selectedOptIds]) => ({
                questionId: Number(qId),
                selectedOptionIds: selectedOptIds.map(id => Number(id)).filter(id => !isNaN(id))
            }));

            const response = await api.patch(`/assessment/${assessmentId}/session/submit`, {
                answers: formattedAnswers
            });

            const backendResult = response.data;

            // Get full question details for mapping the review list
            const questions = await this.getQuestions(lessonId);
            const detailedReviews: AnswerReviewItem[] = backendResult.questions.map((qRes: any) => {
                const matchedQ = questions.find(q => q.id === qRes.questionId);
                return {
                    id: qRes.questionId,
                    content: matchedQ ? matchedQ.content : `Câu hỏi ${qRes.questionId}`,
                    type: matchedQ ? matchedQ.type : 'single-choice',
                    isCorrect: qRes.isCorrect,
                    selected: qRes.selectedOptionIds.map(String),
                    correct: qRes.correctOptionIds.map(String),
                    options: matchedQ ? matchedQ.options : [],
                    explanation: matchedQ ? (matchedQ as any).explanation || '' : ''
                };
            });

            const resultSummary: AssessmentResultSummary = {
                score: backendResult.score,
                totalQuestions: backendResult.totalQuestions,
                correctCount: backendResult.correctQuestions,
                incorrectCount: backendResult.totalQuestions - backendResult.correctQuestions,
                duration,
                assessment: 'Bài kiểm tra',
                submittedAt: new Date().toLocaleString('vi-VN'),
                pointsEarned: backendResult.earnedPoints,
            };

            // Save to localStorage history attempts so the statistics display works
            this.saveLocalAttempt(lessonId, {
                date: new Date().toLocaleDateString('vi-VN'),
                score: backendResult.score,
                duration
            });

            // Cache current test result detail so getAssessmentResult hook reads it
            localStorage.setItem(`last_result_${lessonId}`, JSON.stringify({
                summary: resultSummary,
                reviews: detailedReviews
            }));

            return resultSummary;
        } catch (error) {
            console.error('Failed to submit answers to backend:', error);
            throw error;
        }
    }

    public static async getAssessmentResult(lessonId: number): Promise<{ summary: AssessmentResultSummary; reviews: AnswerReviewItem[] }> {
        try {
            const response = await api.get(`/assessment/lesson/${lessonId}/result`);
            const backendData = response.data;

            // Merge with local storage reviews if available to preserve detailed question review
            const stored = localStorage.getItem(`last_result_${lessonId}`);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed && parsed.reviews && parsed.reviews.length > 0) {
                        return {
                            summary: backendData.summary || parsed.summary,
                            reviews: parsed.reviews
                        };
                    }
                } catch (e) {
                    console.warn('Failed to parse cached last_result:', e);
                }
            }
            return backendData;
        } catch {
            const stored = localStorage.getItem(`last_result_${lessonId}`);
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch (e) {
                    console.warn('Failed to parse cached last_result in catch block:', e);
                }
            }
            // Fallback default
            return {
                summary: {
                    score: 0,
                    totalQuestions: 0,
                    correctCount: 0,
                    incorrectCount: 0,
                    duration: '0 phút',
                    assessment: 'Bài kiểm tra',
                    submittedAt: new Date().toLocaleString('vi-VN'),
                    pointsEarned: 0,
                },
                reviews: []
            };
        }
    }

    public static async getSession(sessionId: number): Promise<any> {
        const response = await api.get(`/assessment-session/${sessionId}`);
        return response.data;
    }
}
