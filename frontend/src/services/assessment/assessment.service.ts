import api from '../../lib/axios';
import type { 
    AssessmentMetadata, 
    AssessmentQuestion, 
    AssessmentAttempt, 
    AssessmentResultSummary,
    AnswerReviewItem
} from '../../types/assessment/assessment.types';

// Standard Mock Data for Fallbacks & Development Demo
const MOCK_QUESTIONS: AssessmentQuestion[] = [
    { id: 1, type: 'single-choice', content: 'Closure trong JavaScript là gì? Chọn định nghĩa chính xác nhất:', points: 10, options: [{ id: 'a', text: 'Một hàm có thể truy cập các biến từ scope bên ngoài sau khi scope đó đã kết thúc.' }, { id: 'b', text: 'Một cú pháp để đóng gói code.' }, { id: 'c', text: 'Một phương thức đặc biệt của class ES6.' }, { id: 'd', text: 'Biến khai báo bằng const không thể thay đổi.' }] },
    { id: 2, type: 'multiple-choice', content: 'Những phương thức nào thuộc về Array.prototype trong ES6+? (Chọn tất cả đúng)', points: 10, options: [{ id: 'a', text: 'Array.from()' }, { id: 'b', text: 'Array.create()' }, { id: 'c', text: 'Array.of()' }, { id: 'd', text: 'Array.build()' }] },
    { id: 3, type: 'single-choice', content: 'Kết quả của đoạn code: console.log(typeof null)', points: 10, options: [{ id: 'a', text: '"null"' }, { id: 'b', text: '"undefined"' }, { id: 'c', text: '"object"' }, { id: 'd', text: '"number"' }] },
    { id: 4, type: 'single-choice', content: 'Promise.all() sẽ reject khi nào?', points: 10, options: [{ id: 'a', text: 'Khi tất cả promises đều reject.' }, { id: 'b', text: 'Khi ít nhất một promise reject.' }, { id: 'c', text: 'Không bao giờ reject.' }, { id: 'd', text: 'Khi hơn 50% promises reject.' }] },
    { id: 5, type: 'multiple-choice', content: 'Phương thức nào có thể dùng để tránh callback hell? (Chọn tất cả đúng)', points: 10, options: [{ id: 'a', text: 'Promises' }, { id: 'b', text: 'async/await' }, { id: 'c', text: 'Generator functions' }, { id: 'd', text: 'setTimeout()' }] },
    ...Array.from({ length: 20 }, (_, i) => ({
        id: i + 6,
        type: (i % 3 === 0 ? 'multiple-choice' : 'single-choice') as 'single-choice' | 'multiple-choice',
        content: `Câu ${i + 6}: Kiến thức JavaScript nâng cao. Chọn đáp án đúng nhất cho câu hỏi bên dưới.`,
        points: 10,
        options: [{ id: 'a', text: 'Đáp án A — Giải thích A' }, { id: 'b', text: 'Đáp án B — Giải thích B' }, { id: 'c', text: 'Đáp án C — Giải thích C' }, { id: 'd', text: 'Đáp án D — Giải thích D' }],
    })),
];

const MOCK_ATTEMPTS: AssessmentAttempt[] = [
    { id: 2, date: '18/06/2026', score: 72, duration: '38 phút' },
    { id: 1, date: '10/06/2026', score: 65, duration: '42 phút' },
];

const MOCK_METADATA: AssessmentMetadata = {
    id: 1,
    title: 'Kiểm tra cuối khóa: JavaScript Nâng cao',
    description: 'Bài kiểm tra này đánh giá toàn diện kiến thức về JavaScript ES6+, bao gồm closures, promises, async/await, prototype chain và các design patterns phổ biến. Hoàn thành tốt bài thi để chứng minh bạn đã sẵn sàng chuyển sang React.',
    timeLimit: 45,
    questionCount: MOCK_QUESTIONS.length,
    course: 'JavaScript Nâng cao — ES6+ & Design Patterns',
    attempts: 2,
    bestScore: 72,
    pointsReward: MOCK_QUESTIONS.reduce((sum, q) => sum + (q.points || 0), 0),
};

const MOCK_ANSWERS_REVIEW: AnswerReviewItem[] = [
    { id: 1, content: 'Closure trong JavaScript là gì?', type: 'single-choice', isCorrect: true, selected: ['a'], correct: ['a'], options: [{ id: 'a', text: 'Một hàm có thể truy cập các biến từ scope bên ngoài sau khi scope đó đã kết thúc.' }, { id: 'b', text: 'Cú pháp đóng gói code.' }, { id: 'c', text: 'Phương thức đặc biệt của class ES6.' }, { id: 'd', text: 'Biến const không thể thay đổi.' }], explanation: 'Closure là hàm "nhớ" môi trường nơi nó được tạo ra, bao gồm tất cả biến trong scope bao quanh, dù scope đó đã kết thúc.' },
    { id: 2, content: 'Những phương thức nào thuộc Array.prototype trong ES6+?', type: 'multiple-choice', isCorrect: true, selected: ['a', 'c'], correct: ['a', 'c'], options: [{ id: 'a', text: 'Array.from()' }, { id: 'b', text: 'Array.create()' }, { id: 'c', text: 'Array.of()' }, { id: 'd', text: 'Array.build()' }], explanation: 'Array.from() chuyển iterable thành array. Array.of() tạo array từ đối số. Array.create() và Array.build() không tồn tại.' },
    { id: 3, content: 'Kết quả của console.log(typeof null)?', type: 'single-choice', isCorrect: false, selected: ['a'], correct: ['c'], options: [{ id: 'a', text: '"null"' }, { id: 'b', text: '"undefined"' }, { id: 'c', text: '"object"' }, { id: 'd', text: '"number"' }], explanation: 'typeof null === "object" là bug nổi tiếng trong JavaScript tồn tại từ phiên bản đầu tiên.' },
    { id: 4, content: 'Promise.all() reject khi nào?', type: 'single-choice', isCorrect: true, selected: ['b'], correct: ['b'], options: [{ id: 'a', text: 'Khi tất cả promise đều reject.' }, { id: 'b', text: 'Khi ít nhất một promise reject.' }, { id: 'c', text: 'Không bao giờ.' }, { id: 'd', text: 'Khi hơn 50% reject.' }], explanation: 'Promise.all() áp dụng nguyên tắc "fail-fast" — ngay khi một promise reject, toàn bộ Promise.all() reject ngay lập tức.' },
    { id: 5, content: 'Phương thức nào tránh callback hell?', type: 'multiple-choice', isCorrect: false, selected: ['a', 'b'], correct: ['a', 'b', 'c'], options: [{ id: 'a', text: 'Promises' }, { id: 'b', text: 'async/await' }, { id: 'c', text: 'Generator functions' }, { id: 'd', text: 'setTimeout()' }], explanation: 'Promises, async/await và Generator functions đều giải quyết callback hell theo các cách khác nhau.' },
    ...Array.from({ length: 20 }, (_, i) => ({
        id: i + 6, 
        content: `Câu ${i + 6}: Kiến thức JavaScript nâng cao`, 
        type: (i % 3 === 0 ? 'multiple-choice' : 'single-choice') as 'single-choice' | 'multiple-choice',
        isCorrect: i % 5 !== 0, 
        selected: ['a'], 
        correct: ['a'],
        options: [{ id: 'a', text: 'Đáp án A' }, { id: 'b', text: 'Đáp án B' }, { id: 'c', text: 'Đáp án C' }, { id: 'd', text: 'Đáp án D' }],
        explanation: 'Giải thích chi tiết cho câu hỏi này.',
    })),
];

import { getLessonById } from '../lesson/lesson.service';

export class AssessmentService {
    // Helper to get local data from localStorage for persistence in mock state
    private static getLocalAttempts(lessonId: number): AssessmentAttempt[] {
        const key = `assessment_attempts_${lessonId}`;
        const stored = localStorage.getItem(key);
        if (!stored) {
            localStorage.setItem(key, JSON.stringify(MOCK_ATTEMPTS));
            return MOCK_ATTEMPTS;
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
                const response = await api.get(`/assessment/${assessmentId}/session`);
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

        let title = cachedTitle || MOCK_METADATA.title;
        let description = MOCK_METADATA.description;
        let courseTitle = MOCK_METADATA.course;
        let questionCount = MOCK_METADATA.questionCount;

        if (assessmentId) {
            try {
                const targetCourseId = lesson?.courseId || 8;
                const response = await api.get(`/assessment/courses/${targetCourseId}/lesson/${lessonId}/assessment/${assessmentId}`);
                if (response.data) {
                    title = response.data.title || title;
                    if (response.data.questions) {
                        questionCount = response.data.questions.length;
                    }
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
            ...MOCK_METADATA,
            id: assessmentId || MOCK_METADATA.id,
            title: title,
            description: description,
            course: courseTitle,
            attempts: attempts.length,
            bestScore,
            questionCount,
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
                const targetCourseId = lesson?.courseId || 8;
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

        try {
            const response = await api.get(`/assessment/lesson/${lessonId}/questions`);
            return response.data;
        } catch {
            return MOCK_QUESTIONS;
        }
    }

    public static async submitAnswers(
        lessonId: number,
        answers: Record<number, string[]>,
        duration: string
    ): Promise<AssessmentResultSummary> {
        try {
            const response = await api.post(`/assessment/lesson/${lessonId}/submit`, { answers, duration });
            return response.data;
        } catch {
            // Mock grading calculation logic
            let correctPoints = 0;
            let totalPoints = 0;
            let correctCount = 0;

            const questions = await this.getQuestions(lessonId);
            const total = questions.length;
            
            // Map answers to reviews
            const detailedReviews: AnswerReviewItem[] = MOCK_ANSWERS_REVIEW.map(item => {
                const userSelected = answers[item.id] ?? [];
                
                // Compare arrays
                const isCorrect = 
                    userSelected.length === item.correct.length && 
                    userSelected.every(v => item.correct.includes(v));

                const q = questions.find(x => x.id === item.id) || { points: 10 };
                const qPoints = q.points || 10;
                totalPoints += qPoints;

                if (isCorrect) {
                    correctCount++;
                    correctPoints += qPoints;
                }

                return {
                    ...item,
                    selected: userSelected,
                    isCorrect
                };
            });

            const score = totalPoints > 0 ? Math.round((correctPoints / totalPoints) * 100) : 0;
            
            const resultSummary: AssessmentResultSummary = {
                score,
                totalQuestions: total,
                correctCount,
                incorrectCount: total - correctCount,
                duration,
                assessment: MOCK_METADATA.title,
                submittedAt: new Date().toLocaleString('vi-VN'),
                pointsEarned: correctPoints,
            };

            // Save to localStorage history attempts
            this.saveLocalAttempt(lessonId, {
                date: new Date().toLocaleDateString('vi-VN'),
                score,
                duration
            });

            // Cache current test result detail
            localStorage.setItem(`last_result_${lessonId}`, JSON.stringify({
                summary: resultSummary,
                reviews: detailedReviews
            }));

            return resultSummary;
        }
    }

    public static async getAssessmentResult(lessonId: number): Promise<{ summary: AssessmentResultSummary; reviews: AnswerReviewItem[] }> {
        try {
            const response = await api.get(`/assessment/lesson/${lessonId}/result`);
            return response.data;
        } catch {
            const stored = localStorage.getItem(`last_result_${lessonId}`);
            if (stored) {
                return JSON.parse(stored);
            }
            // Fallback default
            const totalPoints = MOCK_QUESTIONS.reduce((sum, q) => sum + (q.points || 0), 0);
            return {
                summary: {
                    score: 84,
                    totalQuestions: 25,
                    correctCount: 21,
                    incorrectCount: 4,
                    duration: '37 phút 14 giây',
                    assessment: MOCK_METADATA.title,
                    submittedAt: '24/06/2026, 14:32',
                    pointsEarned: Math.round(0.84 * totalPoints),
                },
                reviews: MOCK_ANSWERS_REVIEW
            };
        }
    }

    public static async getSession(sessionId: number): Promise<any> {
        const response = await api.get(`/assessment-session/${sessionId}`);
        return response.data;
    }
}
