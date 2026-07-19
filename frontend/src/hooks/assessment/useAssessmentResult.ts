import { useState, useEffect } from 'react';
import { AssessmentService } from '../../services/assessment/assessment.service';
import type { AssessmentResultSummary, AnswerReviewItem } from '../../types/assessment/assessment.types';


/**
 * Custom hook lấy kết quả bài kiểm tra sau khi learner nộp bài
 * Cung cấp thông tin tổng quan (summary), danh sách câu hỏi để xem lại và lọc các câu hỏi (Đúng/Sai/Tất cả)
 * @param lessonId - Id của bài kiểm tra cần lấy kết quả
 * @returns Các thông tin kết quả và hàm setFilter để lọc câu hỏi
 */
export function useAssessmentResult(lessonId: number) {
    //state
    const [summary, setSummary] = useState<AssessmentResultSummary | null>(null);   //Tóm tắt kết quả(Điểm số, tỉ lệ phần trăm đúng, số câu đúng sai,...)
    const [reviews, setReviews] = useState<AnswerReviewItem[]>([]);                 //Danh sách các câu hỏi và câu trả lời
    const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');   //Bộ lọc câu hỏi (Đúng/Sai/Tất cả)
    const [isLoading, setIsLoading] = useState<boolean>(true);                      //Loading API get AssessmentResult
    const [error, setError] = useState<string | null>(null);                        //Error 

    useEffect(() => {
        const loadResult = async () => {
            setIsLoading(true);
            try {
                const data = await AssessmentService.getAssessmentResult(lessonId);
                //Cập nhật dữ liệu trả về từ API vào state
                setSummary(data.summary);
                setReviews(data.reviews);
                setError(null);
            } catch (err: any) {
                setError(err?.message || 'Failed to load results');
            } finally {
                setIsLoading(false);
            }
        };
        //Gọi API khi lessonId hợp lệ
        if (lessonId) {
            loadResult();
        }
    }, [lessonId]);

    //Lọc danh sách câu hỏi dựa trên bộ lọc (Đúng/Sai/Tất cả)
    const filteredReviews = reviews.filter(item => {
        if (filter === 'correct') return item.isCorrect;
        if (filter === 'incorrect') return !item.isCorrect;
        return true;
    });
    //Trả về các thông tin kết quả và hàm setFilter để lọc câu hỏi
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
