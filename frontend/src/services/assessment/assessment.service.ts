import api from '../../lib/axios';
import { useAuthStore } from '../../stores/auth/auth.stores';
import type { 
    AssessmentMetadata, 
    AssessmentQuestion, 
    AssessmentAttempt, 
    AssessmentResultSummary,
    AnswerReviewItem
} from '../../types/assessment/assessment.types';
import { getLessonById } from '../lesson/lesson.service';
import { ASSESSMENT_TIME_LIMIT_MINUTES } from '../../utils/assessment/assessmentUtils';

export class AssessmentService {
    private static sessionStartRequests = new Map<number, Promise<any | null>>();
    public static async deleteAssessment(assessmentId: number): Promise<void> {
        try {
            await api.delete(`/assessment/${assessmentId}`);
        } catch (error) {
            console.error('Failed to delete assessment from backend:', error);
            throw error;
        }
    }

    // Helper lấy userId hiện tại từ auth store để scope localStorage key
    private static getCurrentUserId(): number {
        return useAuthStore.getState().user?.userId ?? 0;
    }

    // Helper to get local data from localStorage for persistence in mock state
    private static getLocalAttempts(lessonId: number): AssessmentAttempt[] {
        const userId = this.getCurrentUserId();
        const key = `assessment_attempts_${userId}_${lessonId}`;
        const stored = localStorage.getItem(key);
        if (!stored) {
            localStorage.setItem(key, JSON.stringify([]));
            return [];
        }
        return JSON.parse(stored);
    }

    private static saveLocalAttempt(lessonId: number, attempt: AssessmentAttempt) {
        const userId = this.getCurrentUserId();
        const attempts = this.getLocalAttempts(lessonId);
        const nextId = attempts.length > 0 ? Math.max(...attempts.map(x => x.id ?? 0)) + 1 : 1;
        attempts.unshift({ ...attempt, id: nextId });
        localStorage.setItem(`assessment_attempts_${userId}_${lessonId}`, JSON.stringify(attempts));
    }

    public static async startSession(lessonId: number): Promise<any | null> {
        const pendingRequest = this.sessionStartRequests.get(lessonId);
        if (pendingRequest) return pendingRequest;

        const request = this.startSessionRequest(lessonId);
        this.sessionStartRequests.set(lessonId, request);
        try {
            return await request;
        } finally {
            this.sessionStartRequests.delete(lessonId);
        }
    }

    private static async startSessionRequest(lessonId: number): Promise<any | null> {
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
            // Silently ignore 403 (unenrolled learner) or 404
        }

        const attempts = this.getLocalAttempts(lessonId);
        const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0;

        let title = cachedTitle || 'Assessment';
        let description = 'Knowledge assessment.';
        let courseTitle = 'Course';
        let questionCount = 0;
        let pointsReward = 0;

        try {
            const actualQuestions = await this.getQuestions(lessonId, false);
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
            timeLimit: ASSESSMENT_TIME_LIMIT_MINUTES,
            attempts: attempts.length,
            bestScore,
            questionCount,
            pointsReward,
            course: courseTitle,
        };
        return { metadata, attempts };
    }

    public static async getQuestions(
        lessonId: number,
        requireOptions = true
    ): Promise<AssessmentQuestion[]> {
        const normalizeQuestion = (q: any, idx: number): AssessmentQuestion => {
            const qId = q.id || q.questionId || (idx + 1);
            const isMulti = q.type === 'MULTIPLE_CHOICE_MULTI' || q.type === 'multiple-choice';
            return {
                id: qId,
                type: isMulti ? 'multiple-choice' : 'single-choice',
                content: q.content || q.title || `Question ${idx + 1}`,
                points: q.points ? Number(q.points) : 10,
                options: (q.options || []).map((opt: any, oIdx: number) => ({
                    id: String(opt.id || opt.optionId || `opt-${qId}-${oIdx + 1}`),
                    text: opt.text || opt.content || `Option ${oIdx + 1}`,
                })),
            };
        };

        const normalizeQuestions = (questions: any[]): AssessmentQuestion[] =>
            questions.map((question, index) => normalizeQuestion(question, index));

        const hasCompleteOptions = (questions: AssessmentQuestion[]): boolean =>
            questions.length > 0 && questions.every(question => question.options.length > 0);

        let incompleteQuestions: AssessmentQuestion[] = [];

        let assessmentId: number | null = null;
        const savedAss = localStorage.getItem(`assessments_lesson_${lessonId}`);
        if (savedAss) {
            try {
                const parsed = JSON.parse(savedAss);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const rawQuestions: any[] = [];
                    for (const ast of parsed) {
                        if (ast.questions && Array.isArray(ast.questions) && ast.questions.length > 0) {
                            rawQuestions.push(...ast.questions);
                        }
                    }
                    if (rawQuestions.length > 0) {
                        const cachedQuestions = normalizeQuestions(rawQuestions);
                        if (hasCompleteOptions(cachedQuestions)) {
                            return cachedQuestions;
                        }
                        incompleteQuestions = cachedQuestions;
                    }
                    if (parsed[0].assessmentId) {
                        assessmentId = parsed[0].assessmentId;
                    }
                }
            } catch (e) {
                console.warn('Failed to parse localStorage assessments:', e);
            }
        }

        let lesson: any = null;
        try {
            lesson = await getLessonById(lessonId);
            if (lesson && lesson.assessments && lesson.assessments.length > 0) {
                assessmentId = lesson.assessments[0].assessmentId || assessmentId;

                const embeddedQuestions: any[] = [];
                for (const ast of lesson.assessments) {
                    if (ast.questions && Array.isArray(ast.questions) && ast.questions.length > 0) {
                        embeddedQuestions.push(...ast.questions);
                    }
                }
                if (embeddedQuestions.length > 0) {
                    const lessonQuestions = normalizeQuestions(embeddedQuestions);
                    if (hasCompleteOptions(lessonQuestions)) {
                        return lessonQuestions;
                    }
                    incompleteQuestions = lessonQuestions;
                }
            }
        } catch (e) {
            // Silently ignore 403 (unenrolled learner) or 404
        }

        if (assessmentId) {
            // This endpoint loads both questions and their options. Question-only
            // endpoints use a DTO that intentionally omits the options relation.
            try {
                const response = await api.get(`/assessment/${assessmentId}`);
                if (Array.isArray(response.data?.questions)) {
                    const assessmentQuestions = normalizeQuestions(response.data.questions);
                    if (hasCompleteOptions(assessmentQuestions)) {
                        return assessmentQuestions;
                    }
                    if (assessmentQuestions.length > 0) {
                        incompleteQuestions = assessmentQuestions;
                    }
                }
            } catch (err) {
                // Fall back to the hierarchical assessment route below.
            }

            try {
                const targetCourseId = lesson?.course?.courseId || lesson?.courseId || 8;
                const response = await api.get(`/assessment/courses/${targetCourseId}/lesson/${lessonId}/assessment/${assessmentId}`);
                if (response.data && response.data.questions && response.data.questions.length > 0) {
                    const assessmentQuestions = normalizeQuestions(response.data.questions);
                    if (hasCompleteOptions(assessmentQuestions)) {
                        return assessmentQuestions;
                    }
                    incompleteQuestions = assessmentQuestions;
                }
            } catch (err) {
                // Silently fallback if route fails
            }
        }

        if (!requireOptions) {
            return incompleteQuestions;
        }

        if (incompleteQuestions.length > 0) {
            return incompleteQuestions;
        }

        return [];
    }

    public static async submitAnswers(
        lessonId: number,
        sessionId: number,
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
                sessionId,
                answers: formattedAnswers
            });

            const backendResult = response.data;

            // Get full question details for mapping the review list
            const questions = await this.getQuestions(lessonId);
            const detailedReviews: AnswerReviewItem[] = backendResult.questions.map((qRes: any) => {
                const matchedQ = questions.find(q => Number(q.id) === Number(qRes.questionId));
                return {
                    id: qRes.questionId,
                    content: matchedQ ? matchedQ.content : `Question ${qRes.questionId}`,
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
                duration: backendResult.duration || duration,
                durationSeconds: typeof backendResult.durationSeconds === 'number' ? backendResult.durationSeconds : undefined,
                assessment: 'Assessment',
                submittedAt: new Date().toLocaleString('en-US'),
                pointsEarned: backendResult.earnedPoints,
            };

            // Save to localStorage history attempts so the statistics display works
            this.saveLocalAttempt(lessonId, {
                date: new Date().toLocaleDateString('en-US'),
                score: backendResult.score,
                duration: resultSummary.duration,
                durationSeconds: resultSummary.durationSeconds,
            });

            // Cache current test result detail so getAssessmentResult hook reads it
            const userId = this.getCurrentUserId();
            localStorage.setItem(`last_result_${userId}_${lessonId}`, JSON.stringify({
                summary: resultSummary,
                reviews: detailedReviews
            }));

            // Notify header & dashboard to update streak
            window.dispatchEvent(new CustomEvent('streak-updated'));

            return resultSummary;
        } catch (error) {
            console.error('Failed to submit answers to backend:', error);
            throw error;
        }
    }

    public static async getAssessmentResult(lessonId: number): Promise<{ summary: AssessmentResultSummary; reviews: AnswerReviewItem[] }> {
        const userId = this.getCurrentUserId();
        try {
            const response = await api.get(`/assessment/lesson/${lessonId}/result`);
            const backendData = response.data;

            // Merge with local storage reviews if available to preserve detailed question review
            const stored = localStorage.getItem(`last_result_${userId}_${lessonId}`);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed && parsed.reviews && parsed.reviews.length > 0) {
                        const backendSummary = backendData.summary;
                        const hasBackendDuration = typeof backendSummary?.durationSeconds === 'number';
                        return {
                            summary: {
                                ...parsed.summary,
                                ...backendSummary,
                                duration: hasBackendDuration ? backendSummary.duration : parsed.summary.duration,
                                durationSeconds: hasBackendDuration
                                    ? backendSummary.durationSeconds
                                    : parsed.summary.durationSeconds,
                            },
                            reviews: parsed.reviews,
                        };
                    }
                } catch (e) {
                    console.warn('Failed to parse cached last_result:', e);
                }
            }
            return backendData;
        } catch {
            const stored = localStorage.getItem(`last_result_${userId}_${lessonId}`);
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
                    duration: '0 min',
                    assessment: 'Assessment',
                    submittedAt: new Date().toLocaleString('en-US'),
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

    // Academic Manager: Lấy thông tin chi tiết bài kiểm tra + danh sách câu hỏi của lesson để duyệt
    public static async getAssessmentForManager(lessonId: number): Promise<any> {
        try {
            const response = await api.get(`/assessment/manager-review/lesson/${lessonId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch assessment for manager review:', error);
            throw error;
        }
    }
}
