import { useState, useEffect } from 'react';
import { AssessmentService } from '../../services/assessment/assessment.service';
import type { AssessmentMetadata, AssessmentAttempt } from '../../types/assessment/assessment.types';

export function useAssessmentDetail(lessonId: number) {
    //Quản lý trạng thái(State)
    const [metadata, setMetadata] = useState<AssessmentMetadata | null>(null); //Lưu thông tin cấu hình bài kiểm tra
    const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);         //Danh sách các lượt đã làm bài của learner
    const [isLoading, setIsLoading] = useState<boolean>(true);                 //Loading từ API get AssessmentInfo
    const [error, setError] = useState<string | null>(null);                   //Lưu lỗi nếu API lỗi

    //Hàm load dữ liệu
    //Gọi API lấy thông tin bài kiểm tra
    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await AssessmentService.getAssessmentInfo(lessonId);
            //Cập nhật dữ liệu trả về từ API vào state
            setMetadata(data.metadata);
            setAttempts(data.attempts);
        } catch (err: any) {

            setError(err?.message || 'Failed to load assessment details');
        } finally {
            setIsLoading(false); //Kết thúc loading
        }
    };
    //Chỉ gọi API khi lessonId hợp lệ
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
