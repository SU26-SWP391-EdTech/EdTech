import { useState, useEffect } from 'react';
import { AssessmentService } from '../../services/assessment/assessment.service';
import type { AssessmentMetadata, AssessmentAttempt } from '../../types/assessment/assessment.types';

export function useAssessmentDetail(lessonId: number) {
    const [metadata, setMetadata] = useState<AssessmentMetadata | null>(null);
    const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await AssessmentService.getAssessmentInfo(lessonId);
            setMetadata(data.metadata);
            setAttempts(data.attempts);
        } catch (err: any) {
            setError(err?.message || 'Failed to load assessment details');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (lessonId) {
            loadData();
        }
    }, [lessonId]);

    return {
        metadata,
        attempts,
        isLoading,
        error,
        refetch: loadData
    };
}
