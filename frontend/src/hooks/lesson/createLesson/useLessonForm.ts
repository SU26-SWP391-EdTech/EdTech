import { useCallback, useState, useEffect } from 'react';

import type {
  Assessment,
  LessonStatus,
  Objective,
  QuizQuestion,
  Resource,
} from '../../../types/lesson/create-lesson.types';

import type { Lesson } from '../../../services/lesson/lesson.service';

import {
  parseObjectivesFromContent,
  parseQuizQuestionsFromContent,
  parseResourcesFromContent,
} from '../../../utils/lesson/lessonContentParser';

/**
 * Custom hook quản lý các trường thông tin (States) của biểu mẫu Tạo / Chỉnh sửa bài học.
 * Cung cấp:
 * - Các state cho tiêu đề, nội dung đọc, video đính kèm, các câu hỏi trắc nghiệm (quiz), mục tiêu (objectives) và tài nguyên tải về (resources).
 * - Logic tự động tính thời lượng hoàn thành bài học (duration) dựa theo loại hình (video, tài liệu đọc, bài kiểm tra).
 * - Hàm reset form và hàm `hydrateFromApiLesson` đổ dữ liệu cũ từ API vào form ở chế độ chỉnh sửa.
 * - Logic đọc siêu dữ liệu (metadata) của file video upload để tự động lấy thời lượng video.
 */
export function useLessonForm() {
  // --- 1. PHÂN LOẠI HÌNH THỨC BÀI HỌC (STATES) ---
  const [hasVideo, setHasVideo] = useState(true);            // Có bài học dạng Video không
  const [hasReading, setHasReading] = useState(false);        // Có bài học dạng Tài liệu đọc không
  const [hasAssessment, setHasAssessment] = useState(false);  // Có bài học dạng Bài kiểm tra (Assessment) không

  // --- 2. THÔNG TIN CƠ BẢN CỦA BÀI HỌC ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');              // Tổng thời lượng hoàn thành bài học (phút)
  const [videoDurationInput, setVideoDurationInput] = useState(''); // Thời lượng video (phút)
  const [status, setStatus] = useState<LessonStatus>('draft');

  // --- 3. DỮ LIỆU ĐÍNH KÈM CHUYÊN BIỆT ---
  const [videoUrl, setVideoUrl] = useState('');
  const [content, setContent] = useState('');                // Tài liệu đọc dạng Markdown / HTML
  const [videoFile, setVideoFile] = useState<File | null>(null); // File video được chọn upload
  const [videoUploaded, setVideoUploaded] = useState(false); // Trạng thái đã tải video lên thành công

  // --- 4. CẤU TRÚC NỘI DUNG NÂNG CAO ---
  const [objectives, setObjectives] = useState<Objective[]>([]);         // Danh sách mục tiêu đạt được
  const [resources, setResources] = useState<Resource[]>([]);           // Danh sách tài nguyên đính kèm
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]); // Danh sách câu hỏi kiểm tra bài học
  const [assessments, setAssessments] = useState<Assessment[]>([]);       // Bài đánh giá chi tiết (nếu có)

  const [titleError, setTitleError] = useState(false);                   // Cảnh báo tiêu đề bị bỏ trống
  const [prerequisiteLessonIds, setPrerequisiteLessonIds] = useState<number[]>([]); // Danh sách ID các bài học tiên quyết

  // --- 5. EFFECT: TỰ ĐỘNG TÍNH TOÁN THỜI LƯỢNG BÀI HỌC (DURATION) ---
  // Tự động cập nhật tổng thời lượng dựa trên các hình thức được tích chọn
  useEffect(() => {
    let calculated: number;
    if (hasAssessment) {
      calculated = 15; // Mặc định 15 phút cho bài kiểm tra
    } else if (hasVideo && hasReading) {
      calculated = Number(videoDurationInput || 0) + 10; // Thời lượng video + 10 phút đọc tài liệu
    } else if (hasVideo) {
      calculated = Number(videoDurationInput || 0);      // Bằng thời lượng video
    } else if (hasReading) {
      calculated = 10;                                   // Mặc định 10 phút cho tài liệu đọc
    } else {
      calculated = 10; // Fallback mặc định
    }
    // eslint-disable-next-line
    setDuration(calculated > 0 ? String(calculated) : '');
  }, [hasVideo, hasReading, hasAssessment, videoDurationInput]);

  /**
   * Reset toàn bộ các trường nhập liệu của biểu mẫu về giá trị rỗng/mặc định ban đầu.
   */
  const resetFormFields = useCallback(() => {
    setHasVideo(true);
    setHasReading(false);
    setHasAssessment(false);

    setTitle('');
    setDescription('');
    setDuration('');
    setVideoDurationInput('');
    setStatus('draft');

    setVideoUrl('');
    setContent('');
    setVideoFile(null);
    setVideoUploaded(false);

    setObjectives([]);
    setResources([]);
    setQuizQuestions([]);
    setAssessments([]);

    setTitleError(false);
    setPrerequisiteLessonIds([]);
  }, []);

  /**
   * Nạp dữ liệu của bài học cũ từ API (Hydration) để phục vụ cho giao diện Chỉnh sửa.
   * Xử lý bóc tách các mục tiêu, tài nguyên và câu hỏi đính kèm vốn được gộp chung trong trường `content`.
   * 
   * @param lesson - Thông tin bài học tải về từ API
   */
  const hydrateFromApiLesson = useCallback((lesson: Lesson) => {
    const lessonContent = lesson.content || '';

    setTitle(lesson.title || '');
    setDescription(lesson.description || '');

    const hasVid = Boolean(lesson.videoUrl);
    
    // Tách riêng nội dung tài liệu đọc sạch (bỏ đi các phần Objectives, Resources, Quiz Questions đính kèm ở đuôi)
    let cleanReadingContent = lessonContent;
    const firstSectionIndex = lessonContent.search(/\n*(Objectives|Resources|Quiz Questions):/);
    if (firstSectionIndex !== -1) {
        cleanReadingContent = lessonContent.substring(0, firstSectionIndex).trim();
    }
    const hasRead = Boolean(cleanReadingContent.trim());

    // Nạp dữ liệu các bài kiểm tra từ API (nếu có) hoặc localStorage để xác định trạng thái hasAssessment
    let hasAss = false;
    let loadedAssessments: Assessment[] = [];
    
    if (lesson.assessments && lesson.assessments.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      loadedAssessments = lesson.assessments.map((ass: any) => ({
        id: String(ass.assessmentId || ass.id),
        assessmentId: ass.assessmentId,
        title: ass.title,
        type: ass.type,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        questions: (ass.questions || []).map((q: any) => ({
          id: String(q.questionId || q.id),
          content: q.content,
          type: q.type,
          points: Number(q.points),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          options: (q.options || []).map((o: any) => ({
            id: String(o.optionId || o.id),
            content: o.content,
            isCorrect: Boolean(o.isCorrect),
          })),
        })),
      }));
      hasAss = true;
    } else {
      const savedAss = localStorage.getItem(`assessments_lesson_${lesson.lessonId}`);
      if (savedAss) {
        try {
          loadedAssessments = JSON.parse(savedAss);
          hasAss = loadedAssessments && loadedAssessments.length > 0;
        } catch {
          loadedAssessments = [];
        }
      }
    }
    
    setAssessments(loadedAssessments);

    setHasAssessment(hasAss);
    setHasVideo(!hasAss && (hasVid || (!hasVid && !hasRead)));
    setHasReading(!hasAss && hasRead);

    const vidMin = lesson.videoDuration ? Math.round(lesson.videoDuration / 60) : 0;
    setVideoDurationInput(vidMin ? String(vidMin) : '');

    setContent(cleanReadingContent);
    setVideoUrl(lesson.videoUrl || '');
    setVideoUploaded(Boolean(lesson.videoUrl));

    // Thực hiện parser bóc tách các phần mục tiêu, tài nguyên, câu hỏi từ chuỗi content gộp
    setObjectives(
      lessonContent ? parseObjectivesFromContent(lessonContent) : []
    );

    setResources(
      lessonContent ? parseResourcesFromContent(lessonContent) : []
    );

    setQuizQuestions(
      lessonContent ? parseQuizQuestionsFromContent(lessonContent) : []
    );

    if (lesson.prerequisites) {
      setPrerequisiteLessonIds(lesson.prerequisites.map(p => Number(p.prerequisiteLessonId)));
    } else {
      setPrerequisiteLessonIds([]);
    }
  }, []);

  /**
   * Xử lý sự kiện khi người dùng chọn file video local để upload.
   * Tạo đối tượng video ẩn để load metadata lấy ra thời lượng thực tế của video (đơn vị: phút).
   * 
   * @param file - File video được chọn
   */
  const handleVideoFileChange = useCallback((file?: File) => {
    if (!file) return;

    setVideoFile(file);
    setVideoUploaded(true);

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      // Quy đổi giây sang phút
      const minutes = Math.round(video.duration / 60) || 1;
      setVideoDurationInput(String(minutes));
    };
    video.src = URL.createObjectURL(file);
  }, []);

  /**
   * Xóa video hiện tại khỏi biểu mẫu.
   */
  const clearVideo = useCallback(() => {
    setVideoUrl('');
    setVideoFile(null);
    setVideoUploaded(false);
    setVideoDurationInput('');
  }, []);

  return {
    hasVideo,
    setHasVideo,

    hasReading,
    setHasReading,

    hasAssessment,
    setHasAssessment,

    title,
    setTitle,

    description,
    setDescription,

    duration,
    setDuration,

    videoDurationInput,
    setVideoDurationInput,

    status,
    setStatus,

    videoUrl,
    setVideoUrl,

    content,
    setContent,

    videoFile,
    setVideoFile,

    videoUploaded,
    setVideoUploaded,

    objectives,
    setObjectives,

    resources,
    setResources,

    quizQuestions,
    setQuizQuestions,

    assessments,
    setAssessments,

    titleError,
    setTitleError,

    prerequisiteLessonIds,
    setPrerequisiteLessonIds,

    resetFormFields,
    hydrateFromApiLesson,
    handleVideoFileChange,
    clearVideo,
  };
}

export type UseLessonFormReturn = ReturnType<typeof useLessonForm>;
