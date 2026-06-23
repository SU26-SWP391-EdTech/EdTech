import { useLessonPage } from '../../hooks/lesson/useLessonPage';
import { LessonHeader } from '../../components/lesson/detail/LessonHeader';
import { LessonPlayer } from '../../components/lesson/detail/LessonPlayer';
import { LessonReading } from '../../components/lesson/detail/LessonReading';
import { LessonSummaryNav } from '../../components/lesson/detail/LessonSummaryNav';
import { CurriculumSidebar } from '../../components/lesson/detail/CurriculumSidebar';

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
        role = {lesson.role}
        onBackToCourse={lesson.handleBackToCourse}
        onMarkComplete={lesson.handleMarkComplete}
      />

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-8 py-6">
        <div className="flex gap-6 items-start">
          
          {/* ── LEFT CONTENT AREA ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* VIDEO PLAYER / INTERACTIVE CONTENT AREA */}
            {(() => {
              const typeLower = lesson.activeLesson?.type?.toLowerCase() || '';
              const hasVideo = typeLower === 'video' || typeLower === 'video & reading' || !!lesson.activeLesson?.videoUrl;
              const hasReading = typeLower === 'reading' || typeLower === 'video & reading' || !hasVideo;

              return (
                <div className="space-y-6">
                  {hasVideo && (
                    <LessonPlayer
                      activeLesson={lesson.activeLesson!}
                      activeVideoUrl={lesson.activeVideoUrl}
                      youtubeEmbedUrl={lesson.youtubeEmbedUrl}
                    />
                  )}
                  {hasReading && (
                    <LessonReading activeLesson={lesson.activeLesson!} />
                  )}
                </div>
              );
            })()}

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
