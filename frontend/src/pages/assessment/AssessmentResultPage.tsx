import { Trophy, Zap, CheckCircle2, XCircle, RotateCcw, LayoutDashboard } from 'lucide-react';
import { useAssessmentResult } from '../../hooks/assessment/useAssessmentResult';
import { ScoreRing } from '../../components/assessment/ScoreRing';
import { AnswerReviewList } from '../../components/assessment/AnswerReviewList';

interface AssessmentResultPageProps {
    lessonId: number;
    onRetry: () => void;
    onExit: () => void;
}

export function AssessmentResultPage({ lessonId, onRetry, onExit }: AssessmentResultPageProps) {
    const {
        summary: r,
        filteredReviews,
        filter,
        setFilter,
        isLoading,
        error
    } = useAssessmentResult(lessonId);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', fontFamily: "'Inter',sans-serif" }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ border: '3px solid #E2E8F0', borderTop: '3px solid #E11D48', borderRadius: '50%', width: 32, height: 32, animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 13, color: '#64748B' }}>Đang tải kết quả bài làm...</p>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    if (error || !r) {
        return (
            <div style={{ padding: 24, textAlign: 'center', color: '#EF4444', fontFamily: "'Inter',sans-serif" }}>
                <p style={{ fontSize: 14 }}>{error || 'Không tìm thấy kết quả bài kiểm tra.'}</p>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "'Inter','SF Pro Display',sans-serif", background: '#F8FAFC', minHeight: '100vh', paddingBottom: 60 }}>
            {/* Result Banner Summary */}
            <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB', padding: '28px 32px' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 32 }}>
                    <ScoreRing score={r.score} size={150} />

                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4, lineHeight: 1.3 }}>
                            Bạn đã hoàn thành bài kiểm tra! 
                        </h1>
                        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
                            Nộp lúc {r.submittedAt}
                        </p>

                        {/* Stats Row */}
                        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                            {[
                                { label: 'Câu đúng', value: `${r.correctCount}/${r.totalQuestions}`, color: '#16A34A' },
                                { label: 'Câu sai', value: `${r.incorrectCount}`, color: '#E11D48' },
                                { label: 'Thời gian', value: r.duration, color: '#6B7280' },
                            ].map((st, i) => (
                                <div key={i}>
                                    <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {st.label}
                                    </div>
                                    <div style={{ fontSize: 17, fontWeight: 700, color: st.color }}>{st.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Points Rewards banner */}
                        {r.pointsEarned > 0 && (
                            <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 9 }}>
                                <Zap size={16} style={{ color: '#D97706' }} />
                                <span style={{ fontSize: 15, fontWeight: 700, color: '#D97706' }}>+{r.pointsEarned} Points</span>
                                <span style={{ fontSize: 12.5, color: '#374151' }}>đã được tích lũy vào tài khoản của bạn</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Answer Detailed Review */}
            <div style={{ maxWidth: 1000, margin: '24px auto 0', padding: '0 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Xem lại đáp án chi tiết</h2>
                    
                    {/* Toggle filters */}
                    <div style={{ display: 'flex', gap: 6 }}>
                        {(['all', 'correct', 'incorrect'] as const).map(f => (
                            <button 
                                key={f} 
                                onClick={() => setFilter(f)} 
                                style={{
                                    padding: '6px 14px', 
                                    borderRadius: 7,
                                    border: `1px solid ${filter === f ? (f === 'correct' ? '#16A34A' : f === 'incorrect' ? '#E11D48' : '#4F46E5') : '#E5E7EB'}`,
                                    background: filter === f ? (f === 'correct' ? '#F0FDF4' : f === 'incorrect' ? '#FFF1F3' : '#EEF2FF') : '#FFFFFF',
                                    cursor: 'pointer', 
                                    fontSize: 12.5, 
                                    fontWeight: 600,
                                    color: filter === f ? (f === 'correct' ? '#16A34A' : f === 'incorrect' ? '#E11D48' : '#4F46E5') : '#6B7280',
                                }}
                            >
                                {f === 'all' 
                                    ? `Tất cả (${r.totalQuestions})` 
                                    : f === 'correct' 
                                        ? `✓ Đúng (${r.correctCount})` 
                                        : `✗ Sai (${r.incorrectCount})`
                                }
                            </button>
                        ))}
                    </div>
                </div>

                <AnswerReviewList reviews={filteredReviews} />
            </div>

            {/* Bottom sticky bar actions */}
            <div style={{ position: 'sticky', bottom: 0, background: '#FFFFFF', borderTop: '1px solid #E5E7EB', padding: '13px 32px', display: 'flex', justifyContent: 'center', gap: 10, marginTop: 28 }}>
                <button 
                    onClick={onRetry} 
                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 9, cursor: 'pointer', fontSize: 13.5, color: '#6B7280', fontWeight: 600 }}
                >
                    <RotateCcw size={14} /> Làm lại bài thi
                </button>
            </div>
        </div>
    );
}
