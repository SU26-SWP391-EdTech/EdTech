import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useBeforeUnload, useBlocker } from 'react-router-dom';
import { useLessonPage } from '../../hooks/lesson/useLessonPage';
import { LessonHeader } from '../../components/lesson/detail/LessonHeader';
import { LessonPlayer } from '../../components/lesson/detail/LessonPlayer';
import { LessonReading } from '../../components/lesson/detail/LessonReading';
import { LessonSummaryNav } from '../../components/lesson/detail/LessonSummaryNav';
import { CurriculumSidebar } from '../../components/lesson/detail/CurriculumSidebar';
import { AssessmentDetailPage } from '../assessment/AssessmentDetailPage';
import { QuizArenaPage } from '../assessment/QuizArenaPage';
import { AssessmentResultPage } from '../assessment/AssessmentResultPage';
import { AssessmentManagerReviewView } from '../../components/assessment/AssessmentManagerReviewView';
import { AssessmentExitModal } from '../../components/assessment/AssessmentExitModal';
import { ASSESSMENT_TIME_LIMIT_MINUTES } from '../../utils/assessment/assessmentUtils';

const NON_LEARNER_ROLES = ['course provider', 'academic manager', 'admin'];

export function LessonPage() {
  const lesson = useLessonPage();
  const [assessmentStage, setAssessmentStage] = useState<'detail' | 'arena' | 'result'>('detail');
  const isAssessmentInProgress = assessmentStage === 'arena';
  const navigationBlocker = useBlocker(isAssessmentInProgress);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('lesson_sidebar_open');
    return saved !== 'false';
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const next = !prev;
      localStorage.setItem('lesson_sidebar_open', String(next));
      return next;
    });
  };

  // Reset stage when switching to a different lesson
  useEffect(() => {
    setAssessmentStage('detail');
  }, [lesson.activeLesson?.id]);

  useBeforeUnload(useCallback((event) => {
    if (!isAssessmentInProgress) return;
    event.preventDefault();
    event.returnValue = '';
  }, [isAssessmentInProgress]));

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

  const handleQuizSubmitted = async () => {
    setAssessmentStage('result');
    try {
      if (lesson.activeLesson) {
        // Silent update progress & mark complete on backend (unconditional since passScore is removed)
        await lesson.persistLessonCompletion(lesson.activeLesson, false);
      }
    } catch (e) {
      console.error('Failed to auto-submit completion progress:', e);
    }
  };

  const handleExitQuiz = () => {
    setAssessmentStage('detail');
  };

  const isAssessment = lesson.activeLesson?.type === 'Assessment';
  const isNonLearnerRole = NON_LEARNER_ROLES.includes(lesson.role?.toLowerCase() || '');

  const handleVideoProgressReach80 = async () => {
    if (lesson.activeLesson && !lesson.isCompleted) {
      await lesson.persistLessonCompletion(lesson.activeLesson, true);
    }
  };

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
        onBackToCourse={lesson.handleBackToCourse}
        onMarkComplete={lesson.handleMarkComplete}
      />

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-8 py-6 relative">
        <div className={`flex items-start transition-all duration-300 ${isSidebarOpen ? 'gap-6' : 'gap-0'}`}>

          {/* ── LEFT CONTENT AREA ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">
            {isAssessment ? (
              isNonLearnerRole ? (
                <AssessmentManagerReviewView lessonId={Number(lesson.activeLesson?.id)} />
              ) : (
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
                    timeLimit={ASSESSMENT_TIME_LIMIT_MINUTES}
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
              )
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
                          onVideoProgressReach80={handleVideoProgressReach80}
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
              </>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
          <div
            className="transition-all duration-300 ease-in-out flex-shrink-0"
            style={{
              width: isSidebarOpen ? '360px' : '0px',
              opacity: isSidebarOpen ? 1 : 0,
              overflow: 'hidden',
              pointerEvents: isSidebarOpen ? 'auto' : 'none'
            }}
          >
            <CurriculumSidebar
              modules={lesson.modules}
              expandedModules={lesson.expandedModules}
              activeLesson={lesson.activeLesson}
              totalLessons={lesson.totalLessons}
              onToggleModule={lesson.toggleModule}
              onLessonClick={lesson.handleLessonClick}
              onToggleSidebar={toggleSidebar}
            />
          </div>
        </div>

        {/* Floating Expand Tab when sidebar is collapsed */}
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center justify-center w-9 h-20 bg-gradient-to-l from-[#BE123C] to-[#E11D48] hover:from-[#E11D48] hover:to-[#F43F5E] text-white rounded-l-2xl shadow-2xl transition-all duration-300 border-l border-t border-b border-rose-400 group"
            title="Mở rộng danh mục bài học"
          >
            <ChevronLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-0.5" />
          </button>
        )}
      </div>
      {navigationBlocker.state === 'blocked' && (
        <AssessmentExitModal
          onStay={() => navigationBlocker.reset()}
          onLeave={() => navigationBlocker.proceed()}
        />
      )}
    </div>
  );
}
