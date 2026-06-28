import { useState, useEffect } from 'react';
import { useLessonPage } from '../../hooks/lesson/useLessonPage';
import { LessonHeader } from '../../components/lesson/detail/LessonHeader';
import { LessonPlayer } from '../../components/lesson/detail/LessonPlayer';
import { LessonReading } from '../../components/lesson/detail/LessonReading';
import { LessonSummaryNav } from '../../components/lesson/detail/LessonSummaryNav';
import { CurriculumSidebar } from '../../components/lesson/detail/CurriculumSidebar';
import { AssessmentDetailPage } from '../assessment/AssessmentDetailPage';
import { QuizArenaPage } from '../assessment/QuizArenaPage';
import { AssessmentResultPage } from '../assessment/AssessmentResultPage';
import { AssessmentService } from '../../services/assessment/assessment.service';

export function LessonPage() {
  const lesson = useLessonPage();
  const [assessmentStage, setAssessmentStage] = useState<'detail' | 'arena' | 'result'>('detail');

  // Reset stage when switching to a different lesson
  useEffect(() => {
    setAssessmentStage('detail');
  }, [lesson.activeLesson?.id]);

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

  // Navigation Guard Warn
  const checkArenaExit = (): boolean => {
    if (assessmentStage === 'arena') {
      return window.confirm(
        'Bạn đang làm bài kiểm tra. Nếu rời đi, kết quả thi hiện tại sẽ không được lưu. Bạn có chắc chắn muốn rời đi?'
      );
    }
    return true;
  };

  const handleLessonClickWithGuard = (l: any) => {
    if (checkArenaExit()) {
      lesson.handleLessonClick(l);
    }
  };

  const handlePrevLessonWithGuard = () => {
    if (checkArenaExit()) {
      lesson.handlePrevLesson();
    }
  };

  const handleNextLessonWithGuard = () => {
    if (checkArenaExit()) {
      lesson.handleNextLesson();
    }
  };

  const handleBackToCourseWithGuard = () => {
    if (checkArenaExit()) {
      lesson.handleBackToCourse();
    }
  };

  const handleQuizSubmitted = async () => {
    setAssessmentStage('result');
    try {
      if (lesson.activeLesson) {
        const { summary } = await AssessmentService.getAssessmentResult(Number(lesson.activeLesson.id));
        if (summary.isPassed) {
          // Silent update progress & mark complete on backend
          await lesson.persistLessonCompletion(lesson.activeLesson, false);
        }
      }
    } catch (e) {
      console.error('Failed to auto-submit completion progress:', e);
    }
  };

  const handleExitQuiz = () => {
    setAssessmentStage('detail');
  };

  const isAssessment = lesson.activeLesson?.type === 'Assessment';

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
        role={lesson.role}
        onBackToCourse={handleBackToCourseWithGuard}
        onMarkComplete={lesson.handleMarkComplete}
      />

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-8 py-6">
        <div className="flex gap-6 items-start">
          
          {/* ── LEFT CONTENT AREA ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">
            {isAssessment ? (
              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16, overflow: 'hidden' }}>
                {assessmentStage === 'detail' && (
                  <AssessmentDetailPage 
                    lessonId={Number(lesson.activeLesson?.id)}
                    onStartQuiz={() => setAssessmentStage('arena')}
                  />
                )}
                {assessmentStage === 'arena' && (
                  <QuizArenaPage 
                    lessonId={Number(lesson.activeLesson?.id)}
                    timeLimit={45} // 45 minutes default
                    onSubmit={handleQuizSubmitted}
                  />
                )}
                {assessmentStage === 'result' && (
                  <AssessmentResultPage 
                    lessonId={Number(lesson.activeLesson?.id)}
                    onRetry={() => setAssessmentStage('detail')}
                    onExit={handleExitQuiz}
                  />
                )}
              </div>
            ) : (
              <>
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
                  onPrevLesson={handlePrevLessonWithGuard}
                  onNextLesson={handleNextLessonWithGuard}
                />
              </>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
          <CurriculumSidebar
            modules={lesson.modules}
            expandedModules={lesson.expandedModules}
            activeLesson={lesson.activeLesson}
            totalLessons={lesson.totalLessons}
            onToggleModule={lesson.toggleModule}
            onLessonClick={handleLessonClickWithGuard}
          />
        </div>
      </div>
    </div>
  );
}
