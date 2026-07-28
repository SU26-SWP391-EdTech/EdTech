import { useState, useEffect, useCallback, useRef } from 'react';
import { AssessmentService } from '../../services/assessment/assessment.service';
import type { AssessmentQuestion } from '../../types/assessment/assessment.types';

/**
 * Custom hook quản lý state và logic của quiz
 * Hỗ trợ: Đếm thời gian, tự động nộp bài khi hết giờ, chọn các loại đáp án
 * Quản lý câu hỏi, đáp án, chuyển đổi giữa các câu hỏi
 * @param lessonId ID của bài học
 * @param timeLimitMinutes Thời gian giới hạn của quiz (phút)
 * @param onSubmitSuccess Hàm callback được gọi khi nộp bài thành công
 * @returns 
 */
export function useQuizArena(
    lessonId: number,
    timeLimitMinutes: number,
    onSubmitSuccess: () => void
) {
    const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);             //Danh sách câu hỏi
    const [currentQ, setCurrentQ] = useState<number>(0);                              //Câu hỏi hiện tại
    const [answers, setAnswers] = useState<Record<number, string[]>>({});             //Đáp án đã chọn
    const [timeLeft, setTimeLeft] = useState<number>(timeLimitMinutes * 60);          //Thời gian còn lại
    const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);           //Hiển thị modal nộp bài
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);                 //Trạng thái nộp bài
    const [isLoading, setIsLoading] = useState<boolean>(true);                        //Trạng thái loading
    const [error, setError] = useState<string | null>(null);                          //Error

    //Tổng thời gian làm bài (giây)
    const totalTimeSeconds = timeLimitMinutes * 60;
    
    // Flag tự động nộp bài
    const didAutoSubmit = useRef(false);
    const activeSessionId = useRef<number | null>(null);

    // Fetch questions & start session
    useEffect(() => {
        const initArena = async () => {
            setIsLoading(true);
            try {
                //Bắt đầu 1 phiên làm bài mới ở backend
                const session = await AssessmentService.startSession(lessonId);
                activeSessionId.current = session?.sessionId ?? null;
                //Lấy thông tin chi tiết phiên làm bài
                if (session && session.sessionId) {
                    try {
                        const sessionDetail = await AssessmentService.getSession(session.sessionId);
                        console.log('Active Assessment Session:', sessionDetail);
                    } catch (sessionErr) {
                        console.warn('Failed to retrieve session detail from backend:', sessionErr);
                    }
                }
                //Lấy danh sách câu hỏi của assessment
                const data = await AssessmentService.getQuestions(lessonId);
                setQuestions(data);
                setError(null);
            } catch (err: any) {
                setError(err?.message || 'Failed to load quiz questions');
            } finally {
                setIsLoading(false);
            }
        };
        //Chỉ khởi tạo bài thi khi lessionId hợp lệ
        if (lessonId) {
            initArena();
        }
    }, [lessonId]); 

    /**
     * Đếm ngược thời gian làm bài
     * 
     * Timmer bắt đầu khi:
     * - Đã tải xong dữ liệu
     * - Ít nhất có một câu hỏi
     */
    useEffect(() => {
        if (isLoading || questions.length === 0 || timeLimitMinutes === 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                // Khi thời gian còn 1 giây hoặc ít hơn thì tự động nộp bài
                if (prev <= 1) { 
                    clearInterval(timer);
                    // Ngăn việc tự động nộp bài nhiều lần
                    if (!didAutoSubmit.current) {
                        didAutoSubmit.current = true;
                        submitExam();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        // Xóa timer khi component unmount hoặc effect chạy lại
        return () => clearInterval(timer);
    }, [isLoading, questions]);

     /**
     * Chọn hoặc bỏ chọn một phương án của câu hỏi hiện tại.
     *
     * - single-choice: chỉ được giữ một phương án.
     * - multi-choice: có thể chọn hoặc bỏ chọn nhiều phương án.
     */
    const toggleOption = useCallback((optId: string) => {
        // Không xử lý khi danh sách câu hỏi chưa được tải
        if (questions.length === 0) return;
        const activeQ = questions[currentQ];

        setAnswers(prev => {
            // Lấy các phương án đã chọn của câu hỏi hiện tại
            const currentSelections = prev[activeQ.id] ?? [];
            // Câu hỏi một lựa chọn: thay thế bằng phương án mới
            if (activeQ.type === 'single-choice') {
                return { ...prev, [activeQ.id]: [optId] };
            }
            // Multi-choice: chọn hoặc bỏ chọn phương án
            const updated = currentSelections.includes(optId)
                ? currentSelections.filter(x => x !== optId)
                : [...currentSelections, optId];
            return { ...prev, [activeQ.id]: updated };
        });
    }, [questions, currentQ]);

     /**
     * Gửi đáp án và thời gian làm bài lên backend.
     * Được sử dụng cho cả nộp bài thủ công và tự động nộp khi hết giờ.
     */
    const submitExam = async () => {
        setIsSubmitting(true);     // Ngăn người dùng thực hiện thêm thao tác nộp bài
        setShowSubmitModal(false); // Đóng modal xác nhận nộp bài
        try {
            // Tính thời gian người dùng đã sử dụng
            const timeUsedSeconds = totalTimeSeconds - timeLeft;  
            const minsUsed = Math.floor(timeUsedSeconds / 60);
            const secsUsed = timeUsedSeconds % 60;
            const durationStr = `${minsUsed} min ${secsUsed} sec`;

            if (!activeSessionId.current) {
                throw new Error('No active assessment session was found');
            }
            await AssessmentService.submitAnswers(lessonId, activeSessionId.current, answers, durationStr); // Gửi toàn bộ đáp án và thời gian làm bài lên backend
            onSubmitSuccess(); // Thông báo cho component rằng bài đã được nộp thành công
        } catch (err: any) {
            console.error('Submit failed:', err);
            alert('The assessment could not be submitted. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    /**
     * Đếm số câu hỏi đã có ít nhất một phương án được chọn.
     *
     * Object.keys(answers) trả về question ID dưới dạng chuỗi,
     * nên cần Number(questionId) để truy cập lại answers.
     */
    const answeredCount = questions.filter(q => {
        const userAns = answers[q.id as any];
        return Array.isArray(userAns) && userAns.length > 0;
    }).length;

    return {
        questions,
        currentQ,
        setCurrentQ,
        answers,
        timeLeft,
        totalTimeSeconds,
        showSubmitModal,
        setShowSubmitModal,
        isSubmitting,
        isLoading,
        error,
        toggleOption,
        submitExam,
        answeredCount,
    };
}
