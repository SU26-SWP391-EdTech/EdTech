import toast from 'react-hot-toast';
import { useLessonPage } from '../../hooks/lesson/useLessonPage';
import { LessonHeader } from '../../components/lesson/detail/LessonHeader';
import { LessonPlayer } from '../../components/lesson/detail/LessonPlayer';
import { LessonReading } from '../../components/lesson/detail/LessonReading';
import { LessonQuiz } from '../../components/lesson/detail/LessonQuiz';
import { LessonAssignment } from '../../components/lesson/detail/LessonAssignment';
import { LessonSummaryNav } from '../../components/lesson/detail/LessonSummaryNav';
import { LessonTabs } from '../../components/lesson/detail/LessonTabs';
import { NotesPanel } from '../../components/lesson/detail/NotesPanel';
import { DiscussionPanel } from '../../components/lesson/detail/DiscussionPanel';
import { CurriculumSidebar } from '../../components/lesson/detail/CurriculumSidebar';
import { QUESTIONS } from '../../utils/lesson/lessonUtils';

export function LessonPage() {
  const lesson = useLessonPage();

  if (lesson.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading lesson content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ── PAGE HEADER ─────────────────────────────────────────────────────── */}
      <LessonHeader
        courseId={lesson.courseId}
        activeLesson={lesson.activeLesson}
        activeModule={lesson.activeModule}
        matchedCourse={lesson.matchedCourse}
        activeLessonIndex={lesson.activeLessonIndex}
        totalLessons={lesson.totalLessons}
        completedLessons={lesson.completedLessons}
        overallProgress={lesson.overallProgress}
        isCompleted={lesson.isCompleted}
        onBackToCourse={lesson.handleBackToCourse}
        onMarkComplete={lesson.handleMarkComplete}
      />

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-8 py-6">
        <div className="flex gap-6 items-start">
          
          {/* ── LEFT CONTENT AREA ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* VIDEO PLAYER / INTERACTIVE CONTENT AREA */}
            {lesson.activeLesson?.type === 'Video' ? (
              <LessonPlayer
                activeLesson={lesson.activeLesson}
                activeVideoUrl={lesson.activeVideoUrl}
                youtubeEmbedUrl={lesson.youtubeEmbedUrl}
                onNativeVideoEnded={() => {
                  if (lesson.activeLesson) {
                    lesson.persistLessonCompletion(lesson.activeLesson, false);
                    toast.success('Video lesson completed.');
                  }
                }}
              />
            ) : lesson.activeLesson?.type === 'Reading' ? (
              <LessonReading activeLesson={lesson.activeLesson} />
            ) : lesson.activeLesson?.type === 'Quiz' ? (
              <LessonQuiz
                quizQuestionsList={lesson.quizQuestionsList}
                quizAnswers={lesson.quizAnswers}
                quizSubmitted={lesson.quizSubmitted}
                quizScore={lesson.quizScore}
                onSelectAnswer={(idx, option) =>
                  lesson.setQuizAnswers((prev) => ({ ...prev, [idx]: option }))
                }
                onSubmitQuiz={lesson.handleQuizSubmit}
                onRetakeQuiz={() => {
                  lesson.setQuizAnswers({});
                  lesson.setQuizSubmitted(false);
                }}
              />
            ) : (
              <LessonAssignment
                assignmentSubmitted={lesson.assignmentSubmitted}
                assignmentText={lesson.assignmentText}
                assignmentFile={lesson.assignmentFile}
                onAssignmentTextChange={lesson.setAssignmentText}
                onAssignmentFileChange={lesson.setAssignmentFile}
                onSubmitAssignment={lesson.handleAssignmentSubmit}
                onResubmitAssignment={() => {
                  lesson.setAssignmentSubmitted(false);
                  lesson.setAssignmentFile(null);
                }}
              />
            )}

            {/* LESSON SUMMARY + NAVIGATION */}
            <LessonSummaryNav
              matchedCourse={lesson.matchedCourse}
              activeLessonIndex={lesson.activeLessonIndex}
              totalLessons={lesson.totalLessons}
              completedLessons={lesson.completedLessons}
              flatLessons={lesson.flatLessons}
              onPrevLesson={lesson.handlePrevLesson}
              onNextLesson={lesson.handleNextLesson}
            />

            {/* CONTENT TABS */}
            <LessonTabs
              activeTab={lesson.activeTab}
              onTabChange={lesson.setActiveTab}
              activeLesson={lesson.activeLesson}
              mockCodeInfo={lesson.mockCodeInfo}
              copiedCode={lesson.copiedCode}
              onCopyCode={lesson.handleCopyCode}
              questionsCount={QUESTIONS.length}
              notesPanel={
                <NotesPanel
                  notes={lesson.notes}
                  noteText={lesson.noteText}
                  videoProgress={lesson.videoProgress}
                  onNoteTextChange={lesson.setNoteText}
                  onAddNote={lesson.handleAddNote}
                  onDeleteNote={lesson.handleDeleteNote}
                />
              }
              discussionPanel={
                <DiscussionPanel
                  questionText={lesson.questionText}
                  onQuestionTextChange={lesson.setQuestionText}
                  onPostQuestion={() => {
                    toast.success('Question posted successfully!');
                    lesson.setQuestionText('');
                  }}
                  questions={QUESTIONS}
                />
              }
            />
          </div>

          {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
          <CurriculumSidebar
            modules={lesson.modules}
            expandedModules={lesson.expandedModules}
            activeLesson={lesson.activeLesson}
            totalLessons={lesson.totalLessons}
            onToggleModule={lesson.toggleModule}
            onLessonClick={lesson.handleLessonClick}
          />
        </div>
      </div>
    </div>
  );
}
