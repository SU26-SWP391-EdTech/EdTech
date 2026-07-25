import { Save, CheckCircle2, CircleX, X } from 'lucide-react';
import { useCreateLesson } from '../../hooks/lesson/createLesson';
import { LessonInfoSection } from '../../components/lesson/create/LessonInfoSection';
import { LessonTypeSection } from '../../components/lesson/create/LessonTypeSection';
import { LessonContentSection } from '../../components/lesson/create/LessonContentSection';
import { AddResourceModal } from '../../components/lesson/create/AddResourceModal';
import { LessonAssessmentSection } from '../../components/lesson/create/LessonAssessmentSection';

export function CreateLessonPage() {
  const hook = useCreateLesson();

  return (
    <div style={{ fontFamily: "'Inter', 'SF Pro Display', sans-serif", background: '#F8FAFC', minHeight: '100vh' }}>

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '20px 24px 60px' }}>

        {/* Page header */}
        <div style={{
          background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14,
          padding: '20px 26px', marginBottom: 20,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20,
        }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.4px', marginBottom: 5 }}>{hook.isModeLocked ? 'Edit Lesson' : 'Create Lesson'}</h1>
            <p style={{ fontSize: 13.5, color: '#6B7280' }}>{hook.isModeLocked ? 'Update this lesson while keeping its saved content mode.' : 'Add lesson content, resources, and practice activities to your course.'}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              onClick={hook.handleSaveLesson}
              disabled={hook.isSaving}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff',
                cursor: hook.isSaving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600,
                color: '#374151', opacity: hook.isSaving ? 0.7 : 1,
              }}
            >
              <Save size={14} /> {hook.isSaving ? 'Saving...' : 'Save Lesson'}
            </button>
          </div>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <LessonInfoSection
            title={hook.title}
            setTitle={hook.setTitle}
            description={hook.description}
            setDescription={hook.setDescription}
            duration={hook.duration}
            setDuration={hook.setDuration}
            videoDurationInput={hook.videoDurationInput}
            setVideoDurationInput={hook.setVideoDurationInput}
            hasVideo={hook.hasVideo}
            hasReading={hook.hasReading}
            lessonOrder={hook.lessonOrder}
            courses={hook.courses}
            selectedCourseId={hook.selectedCourseId}
            setSelectedCourseId={hook.setSelectedCourseId}
            selectedCourse={hook.selectedCourse}
            draftCourseTitle={hook.draftCourseTitle}
            titleError={hook.titleError}
            setTitleError={hook.setTitleError}
            setEditingLessonId={hook.setEditingLessonId}
            setSavedLessonId={hook.setSavedLessonId}
            searchParams={hook.searchParams}
            navigate={hook.navigate}
            lessons={hook.lessons}
            editingLessonId={hook.editingLessonId}
            prerequisiteLessonIds={hook.prerequisiteLessonIds}
            setPrerequisiteLessonIds={hook.setPrerequisiteLessonIds}
          />

          <LessonTypeSection
            hasVideo={hook.hasVideo}
            setHasVideo={hook.setHasVideo}
            hasReading={hook.hasReading}
            setHasReading={hook.setHasReading}
            hasAssessment={hook.hasAssessment}
            setHasAssessment={hook.setHasAssessment}
            isModeLocked={hook.isModeLocked}
          />

          {(hook.hasVideo || hook.hasReading) && (
            <LessonContentSection
              hasVideo={hook.hasVideo}
              videoUrl={hook.videoUrl}
              setVideoUrl={hook.setVideoUrl}
              videoFile={hook.videoFile}
              videoUploaded={hook.videoUploaded}
              videoInputRef={hook.videoInputRef}
              hasReading={hook.hasReading}
              content={hook.content}
              setContent={hook.setContent}
              handleVideoFileChange={hook.handleVideoFileChange}
              clearVideo={hook.clearVideo}
            />
          )}

          {hook.hasAssessment && (
            <LessonAssessmentSection
              assessments={hook.assessments}
              setAssessments={hook.setAssessments}
              courseId={hook.selectedCourseId}
              lessonId={hook.editingLessonId || hook.savedLessonId}
            />
          )}

        </div>
      </div>

      {/* Modals */}
      {hook.modal === 'resource' && (
        <AddResourceModal
          rName={hook.rName} setRName={hook.setRName}
          rType={hook.rType} setRType={hook.setRType}
          rVisibility={hook.rVisibility} setRVisibility={hook.setRVisibility}
          onAdd={hook.handleAddResource}
          onClose={() => hook.setModal(null)}
        />
      )}

      {/* Toast */}
      {hook.showToast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, background: '#111827',
          borderRadius: 10, padding: '12px 18px', display: 'flex', alignItems: 'center',
          gap: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 2000,
        }}>
          {hook.feedbackType === 'error'
            ? <CircleX size={16} style={{ color: '#F87171' }} />
            : <CheckCircle2 size={16} style={{ color: '#4ADE80' }} />}
          <span style={{ fontSize: 13.5, fontWeight: 500, color: '#fff' }}>{hook.toastMessage}</span>
          <button onClick={() => hook.setShowToast(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', marginLeft: 8 }}>
            <X size={13} style={{ color: '#9CA3AF' }} />
          </button>
        </div>
      )}
    </div>
  );
}
