import { ChevronLeft, ChevronRight, Send, AlertTriangle } from 'lucide-react';
import { useQuizArena } from '../../hooks/assessment/useQuizArena';
import { QuizTimer } from '../../components/assessment/QuizTimer';
import { QuizNavigator } from '../../components/assessment/QuizNavigator';
import { QuestionCard } from '../../components/assessment/QuestionCard';

interface QuizArenaPageProps {
    lessonId: number;
    timeLimit: number;
    onSubmit: () => void;
}

export function QuizArenaPage({ lessonId, timeLimit, onSubmit }: QuizArenaPageProps) {
    const {
        questions,
        currentQ,
        setCurrentQ,
        answers,
        timeLeft,
        totalTimeSeconds,
        showSubmitModal,
        setShowSubmitModal,
        isSubmitting,
        isLoading,
        error,
        toggleOption,
        submitExam,
        answeredCount
    } = useQuizArena(lessonId, timeLimit, onSubmit);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', fontFamily: "'Inter',sans-serif" }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ border: '3px solid #E2E8F0', borderTop: '3px solid #E11D48', borderRadius: '50%', width: 32, height: 32, animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 13, color: '#64748B' }}>Preparing your assessment...</p>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    if (error || questions.length === 0) {
        return (
            <div style={{ padding: 24, textAlign: 'center', color: '#EF4444', fontFamily: "'Inter',sans-serif" }}>
                <p style={{ fontSize: 14 }}>{error || 'No assessment questions were found.'}</p>
            </div>
        );
    }

    const q = questions[currentQ];
    const TOTAL = questions.length;

    return (
        <div style={{ fontFamily: "'Inter','SF Pro Display',sans-serif", background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Top Bar Navigation */}
            <header
                style={{
                    background: '#FFFFFF',
                    borderBottom: '1px solid #E5E7EB',
                    padding: '0 28px',
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                    position: 'sticky',
                    top: 0,
                    zIndex: 100
                }}
            >
                <QuizTimer timeLeft={timeLeft} totalTime={totalTimeSeconds} title="Final assessment" />

                <div style={{ width: 1, height: 20, background: '#E5E7EB' }} />

                {/* Progress bar info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                    <span style={{ fontSize: 12.5, color: '#6B7280' }}>Answered</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#E11D48' }}>{answeredCount}</span>
                    <span style={{ fontSize: 12.5, color: '#9CA3AF' }}>/ {TOTAL}</span>
                    <div style={{ width: 60, height: 4, background: '#F3F4F6', borderRadius: 2 }}>
                        <div style={{ height: '100%', width: `${(answeredCount / TOTAL) * 100}%`, background: '#E11D48', borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                </div>

                <div style={{ width: 1, height: 20, background: '#E5E7EB' }} />

                <button
                    onClick={() => setShowSubmitModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', background: '#E11D48', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: '#fff' }}
                >
                    <Send size={14} /> Submit assessment
                </button>
            </header>

            {/* Layout body grid */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 220px', maxWidth: 1000, margin: '0 auto', width: '100%', padding: '24px 28px', gap: 20, alignItems: 'start' }}>

                {/* Left panel - active question card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <QuestionCard
                        question={q}
                        index={currentQ}
                        total={TOTAL}
                        selectedAnswers={answers[q.id] ?? []}
                        toggleOption={toggleOption}
                    />

                    {/* Prev / Next buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6 }}>
                        <button
                            onClick={() => setCurrentQ(p => Math.max(0, p - 1))}
                            disabled={currentQ === 0}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 8, cursor: currentQ === 0 ? 'not-allowed' : 'pointer', fontSize: 13, color: currentQ === 0 ? '#9CA3AF' : '#374151', fontWeight: 500, opacity: currentQ === 0 ? 0.5 : 1 }}
                        >
                            <ChevronLeft size={14} /> Previous question
                        </button>
                        <button
                            onClick={() => setCurrentQ(p => Math.min(TOTAL - 1, p + 1))}
                            disabled={currentQ === TOTAL - 1}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 8, cursor: currentQ === TOTAL - 1 ? 'not-allowed' : 'pointer', fontSize: 13, color: currentQ === TOTAL - 1 ? '#9CA3AF' : '#374151', fontWeight: 500, opacity: currentQ === TOTAL - 1 ? 0.5 : 1 }}
                        >
                            Next question <ChevronRight size={14} />
                        </button>
                    </div>
                </div>

                {/* Right panel - sidebar navigator grid */}
                <QuizNavigator
                    questions={questions}
                    answers={answers}
                    currentQ={currentQ}
                    setCurrentQ={setCurrentQ}
                />
            </div>

            {/* Confirm Submit Dialog Overlay Modal */}
            {showSubmitModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
                    <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16, padding: '30px 34px', maxWidth: 400, width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                        <div style={{ width: 52, height: 52, borderRadius: 12, background: answeredCount < TOTAL ? '#FFFBEB' : '#FFF1F3', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {answeredCount < TOTAL ? <AlertTriangle size={26} style={{ color: '#D97706' }} /> : <Send size={26} style={{ color: '#E11D48' }} />}
                        </div>
                        <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Submit assessment?</h3>
                        {answeredCount < TOTAL && (
                            <p style={{ margin: '0 0 10px', fontSize: 13.5, color: '#D97706' }}>
                                There are <strong>{TOTAL - answeredCount}</strong> unanswered questions. They will be marked incorrect.
                            </p>
                        )}
                        <p style={{ margin: '0 0 22px', fontSize: 13, color: '#6B7280' }}>
                            Answered <strong style={{ color: '#111827' }}>{answeredCount}/{TOTAL}</strong> questions. Answers cannot be changed after submission.
                        </p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setShowSubmitModal(false)} disabled={isSubmitting} style={{ flex: 1, padding: '11px', background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 9, cursor: 'pointer', fontSize: 13.5, color: '#6B7280', fontWeight: 600 }}>Go back</button>
                            <button
                                onClick={submitExam}
                                disabled={isSubmitting}
                                style={{ flex: 1, padding: '11px', background: '#E11D48', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 13.5, fontWeight: 700, color: '#fff' }}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit assessment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
