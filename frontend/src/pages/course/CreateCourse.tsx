import {
  BasicInfoSection,
  CourseActionBar,
  CreateCourseHeader,
  CurriculumSection,
  LoadingOverlay,
  UnsavedModal,
  SubmitModal,
} from '../../components/course/create';
import { useCreateCourse } from '../../hooks/course/createCourse';

export function CreateCoursePage() {
  const course = useCreateCourse();

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {course.isSubmitting && <LoadingOverlay isEditMode={course.isEditMode} />}

      <div className="max-w-[1376px] mx-auto px-8 py-8">
        <CreateCourseHeader
          isEditMode={course.isEditMode}
          isSubmitting={course.isSubmitting}
          onBackToCourses={course.onBackToCourses}
          onSaveDraft={course.onSaveDraft}
          onSubmitForReview={course.onSubmitForReview}
        />

        {course.reviewReason && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <p className="mb-1 font-semibold">Reason for rejection</p>
            <p>{course.reviewReason}</p>
          </div>
        )}
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 space-y-5">
            <BasicInfoSection
              description={course.form.description}
              dragOver={course.thumbnail.dragOver}
              fileInputRef={course.thumbnail.fileInputRef}
              language={course.form.language}
              tags={course.form.tags}
              thumbnailPreview={course.thumbnail.thumbnailPreview}
              title={course.form.title}
              titleError={course.form.titleError}
              onClearThumbnail={course.thumbnail.clearThumbnail}
              onDescriptionChange={course.form.setDescription}
              onDragLeave={course.thumbnail.onDragLeave}
              onDragOver={course.thumbnail.onDragOver}
              onDrop={course.thumbnail.onDrop}
              onFileChange={course.thumbnail.handleFileChange}
              onLanguageChange={course.form.setLanguage}
              onTagsChange={course.form.setTags}
              onTitleChange={course.form.setTitle}
            />

            <CurriculumSection
              draggedLessonIndex={course.draggedLessonIndex}
              lessons={course.lessons}
              onCreateLesson={course.onCreateLesson}
              onDeleteLesson={course.onDeleteLesson}
              onDragEnd={course.onDragEnd}
              onDragOver={course.onDragOverLesson}
              onDragStart={course.onDragStartLesson}
              onEditLesson={course.onEditLesson}
            />

            <CourseActionBar
              isSubmitting={course.isSubmitting}
              onSaveDraft={course.onSaveDraft}
              onSubmitForReview={course.onSubmitForReview}
            />
          </div>
        </div>
      </div>
      {course.showSubmit && (
        <SubmitModal
          courseTitle={course.form.title}
          lessonCount={course.lessons.length}
          isSubmitting={course.isSubmitting}
          onClose={() => course.setShowSubmit(false)}
          onConfirm={course.onConfirmSubmit}
          onAddLesson={() => {
            course.setShowSubmit(false);
            course.onCreateLesson();
          }}
        />
      )}
      {course.showUnsaved && (
        <UnsavedModal
          onStay={course.onStayOnPage}
          onLeave={course.onLeavePage}
        />
      )}
    </div>
  );
}
