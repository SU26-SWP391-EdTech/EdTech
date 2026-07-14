import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import type {
    ModalType,
    QuizQuestion,
} from '../../../types/lesson/create-lesson.types';

type UseLessonQuizModalParams = {
    setQuizQuestions: Dispatch<SetStateAction<QuizQuestion[]>>;
    setModal: Dispatch<SetStateAction<ModalType>>;
    showFeedback: (message: string) => void;
};

/**
 * Custom hook quản lý trạng thái biểu mẫu soạn câu hỏi (Quiz Question Modal) trong trình tạo bài học.
 * Cho phép giảng viên thiết lập:
 * - Nội dung câu hỏi (qText).
 * - Loại câu hỏi (Multiple Choice, True/False, Short Answer).
 * - Danh sách phương án trả lời và đáp án đúng tương ứng.
 * - Thêm mới câu hỏi đã soạn vào danh sách câu hỏi của bài học.
 */
export function useLessonQuizModal({
    setQuizQuestions,
    setModal,
    showFeedback,
}: UseLessonQuizModalParams) {
    // --- 1. CÁC STATE QUẢN LÝ TRÊN MODAL SOẠN CÂU HỎI ---
    const [qText, setQText] = useState('');                           // Nội dung câu hỏi
    const [qType, setQType] = useState('Multiple Choice');            // Loại câu hỏi: Trắc nghiệm / Đúng Sai / Tự luận ngắn
    const [qOptions, setQOptions] = useState(['', '', '', '']);       // 4 lựa chọn cho trắc nghiệm
    const [qCorrect, setQCorrect] = useState(0);                      // Chỉ số (index) của đáp án đúng (0-indexed)
    const [shortAnswer, setShortAnswer] = useState('');               // Nội dung đáp án mẫu cho câu hỏi tự luận ngắn

    /**
     * Xử lý thêm câu hỏi vừa soạn vào danh sách câu hỏi chung.
     * Validate thông tin theo từng loại câu hỏi:
     * - Trắc nghiệm (Multiple Choice): Cần tối thiểu 2 lựa chọn có nội dung.
     * - Đúng Sai (True / False): Cố định 2 đáp án True và False.
     * - Tự luận ngắn (Short Answer): Đáp án đúng chính là chuỗi nhập từ ô tự luận.
     */
    function handleAddQuestion() {
        if (!qText.trim()) return;

        let options: string[] = [];
        let correctIdx = qCorrect;

        if (qType === 'Multiple Choice') {
            // Lọc bỏ các lựa chọn trống
            options = qOptions.filter(option => option.trim());

            if (options.length < 2) {
                showFeedback('Please add at least 2 answer options.');
                return;
            }
        } else if (qType === 'True / False') {
            options = ['True', 'False'];
        } else {
            options = [shortAnswer.trim()];
            correctIdx = 0;
        }

        // Cập nhật vào danh sách câu hỏi chung thông qua setState truyền từ hook cha
        setQuizQuestions(prev => [
            ...prev,
            {
                id: `q${Date.now()}`,
                text: qText.trim(),
                type: qType,
                options,
                correct: correctIdx,
            },
        ]);

        // Reset toàn bộ form soạn câu hỏi về trạng thái mặc định
        setQText('');
        setQOptions(['', '', '', '']);
        setQCorrect(0);
        setShortAnswer('');
        setModal(null); // Đóng modal soạn câu hỏi
    }

    return {
        qText,
        setQText,

        qType,
        setQType,

        qOptions,
        setQOptions,

        qCorrect,
        setQCorrect,

        shortAnswer,
        setShortAnswer,

        handleAddQuestion,
    };
}