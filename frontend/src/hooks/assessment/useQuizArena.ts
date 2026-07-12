import { useState, useEffect, useCallback, useRef } from 'react';
import { AssessmentService } from '../../services/assessment/assessment.service';
import type { AssessmentQuestion } from '../../types/assessment/assessment.types';

export function useQuizArena(
    lessonId: number,
    timeLimitMinutes: number,
    onSubmitSuccess: () => void
) {
    const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
    const [currentQ, setCurrentQ] = useState<number>(0);
    const [answers, setAnswers] = useState<Record<number, string[]>>({});
    const [timeLeft, setTimeLeft] = useState<number>(timeLimitMinutes * 60);
    const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Keep track of total time
    const totalTimeSeconds = timeLimitMinutes * 60;
    
    // Auto-submit flag ref to avoid double submits
    const didAutoSubmit = useRef(false);

    // Fetch questions & start session
    useEffect(() => {
        const initArena = async () => {
            setIsLoading(true);
            try {
                await AssessmentService.startSession(lessonId);
                const data = await AssessmentService.getQuestions(lessonId);
                setQuestions(data);
                setError(null);
            } catch (err: any) {
                setError(err?.message || 'Failed to load quiz questions');
            } finally {
                setIsLoading(false);
            }
        };

        if (lessonId) {
            initArena();
        }
    }, [lessonId]);

    // Timer Countdown
    useEffect(() => {
        if (isLoading || questions.length === 0 || timeLimitMinutes === 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    if (!didAutoSubmit.current) {
                        didAutoSubmit.current = true;
                        submitExam();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isLoading, questions]);

    // Toggle option choice
    const toggleOption = useCallback((optId: string) => {
        if (questions.length === 0) return;
        const activeQ = questions[currentQ];

        setAnswers(prev => {
            const currentSelections = prev[activeQ.id] ?? [];
            if (activeQ.type === 'single-choice') {
                return { ...prev, [activeQ.id]: [optId] };
            }
            // Multi-choice
            const updated = currentSelections.includes(optId)
                ? currentSelections.filter(x => x !== optId)
                : [...currentSelections, optId];
            return { ...prev, [activeQ.id]: updated };
        });
    }, [questions, currentQ]);

    // Submit Exam function
    const submitExam = async () => {
        setIsSubmitting(true);
        setShowSubmitModal(false);
        try {
            const timeUsedSeconds = totalTimeSeconds - timeLeft;
            const minsUsed = Math.floor(timeUsedSeconds / 60);
            const secsUsed = timeUsedSeconds % 60;
            const durationStr = `${minsUsed} phút ${secsUsed} giây`;

            await AssessmentService.submitAnswers(lessonId, answers, durationStr);
            onSubmitSuccess();
        } catch (err: any) {
            console.error('Submit failed:', err);
            alert('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại!');
        } finally {
            setIsSubmitting(false);
        }
    };

    const answeredCount = Object.keys(answers).filter(k => answers[Number(k)]?.length > 0).length;

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
