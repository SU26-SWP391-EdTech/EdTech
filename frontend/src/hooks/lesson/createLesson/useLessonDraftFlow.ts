import { useEffect, useMemo, useState } from 'react';

import { readCourseDraft } from '../../../utils/course/courseDraftStorage';

type UseLessonDraftFlowParams = {
    searchParams: URLSearchParams;
};

/**
 * Custom hook quản lý luồng lưu nháp của bài học (Lesson Draft Flow) khi đang được tạo/sửa
 * từ bên trong trình dựng khóa học (Course Builder).
 * Xác định xem bài học có đang được dựng trong bối cảnh thiết lập khóa học nháp hay không,
 * và hiển thị tiêu đề của khóa học nháp liên quan để chỉ dẫn cho người dùng.
 * 
 * @param params - Đối tượng chứa URL searchParams
 */
export function useLessonDraftFlow({
    searchParams,
}: UseLessonDraftFlowParams) {
    // --- 1. QUẢN LÝ TRẠNG THÁI (STATE) ---
    const [draftCourseTitle, setDraftCourseTitle] = useState<string | null>(null); // Tiêu đề của khóa học nháp (nếu có)

    // Xác định xem bài học này có được mở từ trình dựng khóa học (Course Builder) hay không
    const isCourseBuilder = useMemo(() => {
        return (
            searchParams.get('isCourseBuilder') === 'true' ||
            Boolean(searchParams.get('targetModuleId'))
        );
    }, [searchParams]);

    // --- 2. EFFECT: ĐỒNG BỘ TIÊU ĐỀ KHÓA HỌC NHÁP ---
    useEffect(() => {
        if (isCourseBuilder) {
            // Ưu tiên lấy tiêu đề khóa học từ query params trên URL
            const queryCourseTitle = searchParams.get('courseTitle');
            if (queryCourseTitle) {
                setDraftCourseTitle(queryCourseTitle);
                return;
            }

            // Nếu không có trên URL, tìm kiếm bản nháp khóa học được lưu trong localStorage / sessionStorage
            const draft = readCourseDraft();
            setDraftCourseTitle(draft?.title || null);
        } else {
            setDraftCourseTitle(null);
        }
    }, [searchParams, isCourseBuilder]);

    return {
        isCourseBuilder,

        draftCourseTitle,
        setDraftCourseTitle,
    };
}

export type UseLessonDraftFlowReturn = ReturnType<typeof useLessonDraftFlow>;
