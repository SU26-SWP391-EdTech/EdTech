import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { getCourseById } from '../../../services/course/course.service';
import { getLessonsByCourse } from '../../../services/lesson/lesson.service';
import { mapBackendLessonToCourseBuilderLesson } from '../../../utils/course/courseMappers';
import { useCourseForm } from './useCourseForm';
import { useCourseLessons } from './useCourseLessons';
import { useCoursePersistence } from './useCoursePersistence';
import { useCourseThumbnail } from './useCourseThumbnail';

export function useCreateCourse() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id') ? Number(searchParams.get('id')) : null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showUnsaved, setShowUnsaved] = useState(false);

  const form = useCourseForm();
  const thumbnail = useCourseThumbnail();
  const lessonState = useCourseLessons({ editId });

  const getCurrentCourseDraft = () => form.getCurrentCourseDraft(
    lessonState.lessons,
    thumbnail.thumbnailPreview,
  );

  const persistence = useCoursePersistence({
    deletedLessonIds: lessonState.deletedLessonIds,
    editId,
    getCurrentCourseDraft,
    lessons: lessonState.lessons,
    navigate,
    setIsSubmitting,
    thumbnailFile: thumbnail.thumbnailFile,
    title: form.title,
  });

  useEffect(() => {
    if (!editId) return;

    const loadCourseData = async () => {
      setIsSubmitting(true);
      try {
        const course = await getCourseById(editId);
        form.hydrateFromCourse(course);
        thumbnail.setThumbnailPreview(course.thumbnailUrl || null);

        const lessonsFromBackend = await getLessonsByCourse(editId);
        const mappedLessons = lessonsFromBackend.map(mapBackendLessonToCourseBuilderLesson);
        lessonState.setLessons(mappedLessons);
      } catch (err) {
        console.error('Failed to load course details for edit:', err);
        toast.error('Failed to load course details.');
      } finally {
        setIsSubmitting(false);
      }
    };

    loadCourseData();
  }, [editId]);

  function handleSubmitForReviewClick() {
    setShowSubmit(true);
  }

  function handleConfirmSubmit() {
    setShowSubmit(false);
    persistence.handleSubmit('pending');
  }

  return {
    editId,
    isEditMode: Boolean(editId),
    isSubmitting,
    showSubmit,
    setShowSubmit,
    showUnsaved,
    setShowUnsaved,

    form,
    thumbnail,

    lessons: lessonState.lessons,
    draggedLessonIndex: lessonState.draggedLessonIndex,
    onDeleteLesson: lessonState.deleteLesson,
    onDragEnd: lessonState.clearDraggedLesson,
    onDragOverLesson: lessonState.dragLesson,
    onDragStartLesson: lessonState.setDraggedLessonIndex,
    onToggleLessonLock: lessonState.toggleLessonLock,

    onCreateLesson: () => persistence.openLessonEditor(),
    onEditLesson: persistence.openLessonEditor,
    onSaveDraft: () => persistence.handleSubmit('draft'),
    onSubmitForReview: handleSubmitForReviewClick,
    onConfirmSubmit: handleConfirmSubmit,
  };
}
