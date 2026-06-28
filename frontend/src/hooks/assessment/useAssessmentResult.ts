import { useState, useEffect } from 'react';
import { AssessmentService } from '../../services/assessment/assessment.service';
import type { AssessmentResultSummary, AnswerReviewItem } from '../../types/assessment/assessment.types';

export function useAssessmentResult(lessonId: number) {
    const [summary, setSummary] = useState<AssessmentResultSummary | null>(null);
    const [reviews, setReviews] = useState<AnswerReviewItem[]>([]);
    const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadResult = async () => {
            setIsLoading(true);
            try {
                const data = await AssessmentService.getAssessmentResult(lessonId);
                setSummary(data.summary);
                setReviews(data.reviews);
                setError(null);
            } catch (err: any) {
                setError(err?.message || 'Failed to load results');
            } finally {
                setIsLoading(false);
            }
        };

        if (lessonId) {
            loadResult();
        }
    }, [lessonId]);

    const filteredReviews = reviews.filter(item => {
        if (filter === 'correct') return item.isCorrect;
        if (filter === 'incorrect') return !item.isCorrect;
        return true;
    });

    return {
        summary,
        reviews,
        filteredReviews,
        filter,
        setFilter,
        isLoading,
        error
    };
}
