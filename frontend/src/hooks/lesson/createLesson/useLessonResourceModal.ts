import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import type {
    ModalType,
    Resource,
} from '../../../types/lesson/create-lesson.types';

type UseLessonResourceModalParams = {
    setResources: Dispatch<SetStateAction<Resource[]>>;
    setModal: Dispatch<SetStateAction<ModalType>>;
};

/**
 * Custom hook quản lý trạng thái biểu mẫu đính kèm tài liệu học tập (Resource Modal) trong trình tạo bài học.
 * Cho phép giảng viên thiết lập:
 * - Tên tài nguyên (rName).
 * - Định dạng tài nguyên (rType: PDF, DOCX, ZIP, PPTX...).
 * - Quyền hiển thị tài nguyên (rVisibility: công khai 'public' hay chỉ dành cho học viên đăng ký khóa học 'enrolled').
 * - Thêm mới tài nguyên vào danh sách tài liệu tải về đính kèm bài học.
 */
export function useLessonResourceModal({
    setResources,
    setModal,
}: UseLessonResourceModalParams) {
    // --- 1. CÁC STATE QUẢN LÝ TRÊN BIỂU MẪU TÀI NGUYÊN ---
    const [rName, setRName] = useState('');                                        // Tên tài nguyên đính kèm
    const [rType, setRType] = useState('PDF');                                    // Loại tài liệu
    const [rVisibility, setRVisibility] = useState<'public' | 'enrolled'>('enrolled'); // Quyền truy cập/tải về

    /**
     * Thêm tài nguyên học tập vừa soạn vào danh sách tài nguyên đính kèm bài học.
     */
    function handleAddResource() {
        if (!rName.trim()) return;

        // Cập nhật danh sách tài nguyên đính kèm của bài học qua hàm setState truyền từ hook cha
        setResources(prev => [
            ...prev,
            {
                id: `r${Date.now()}`,
                name: rName.trim(),
                type: rType,
                size: '—', // Mặc định kích thước chưa xác định trước khi upload file thực tế
                visibility: rVisibility,
            },
        ]);

        // Reset biểu mẫu nhập tài nguyên về trạng thái mặc định
        setRName('');
        setRType('PDF');
        setRVisibility('enrolled');
        setModal(null); // Đóng modal tài nguyên
    }

    return {
        rName,
        setRName,

        rType,
        setRType,

        rVisibility,
        setRVisibility,

        handleAddResource,
    };
}