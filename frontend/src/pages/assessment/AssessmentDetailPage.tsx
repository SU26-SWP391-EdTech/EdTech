import { useState } from 'react';
import { AlertCircle, Trophy, Zap, BarChart3 } from 'lucide-react';
import { useAssessmentDetail } from '../../hooks/assessment/useAssessmentDetail';
import { ScoreRing } from '../../components/assessment/ScoreRing';
import { AssessmentStatsGrid } from '../../components/assessment/AssessmentStatsGrid';
import { ASSESSMENT_TIME_LIMIT_MINUTES, formatAssessmentDate, formatAssessmentDuration } from '../../utils/assessment/assessmentUtils';

interface AssessmentDetailPageProps {
    lessonId: number;
    onStartQuiz: () => void;
}

export function AssessmentDetailPage({ lessonId, onStartQuiz }: AssessmentDetailPageProps) {
    const { metadata: a, attempts, isLoading, error } = useAssessmentDetail(lessonId);
    const [confirmStart, setConfirmStart] = useState(false);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', fontFamily: "'Inter',sans-serif" }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ border: '3px solid #E2E8F0', borderTop: '3px solid #E11D48', borderRadius: '50%', width: 32, height: 32, animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 13, color: '#64748B' }}>Loading assessment details...</p>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    if (error || !a) {
        return (
            <div style={{ padding: 24, textAlign: 'center', color: '#EF4444', fontFamily: "'Inter',sans-serif" }}>
                <AlertCircle size={24} style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 14 }}>{error || 'Assessment details could not be found.'}</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#111827', fontFamily: "'Inter','SF Pro Display',sans-serif", paddingBottom: 60 }}>
            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 0', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28, alignItems: 'start' }}>
                {/* Left column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Stats row */}
                    <AssessmentStatsGrid
                        questionCount={a.questionCount}
                        pointsReward={a.pointsReward}
                    />

                    {/* Previous attempts */}
                    {attempts.length > 0 && (
                        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#111827' }}>Attempt history</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {attempts.map((s, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 12 }}>
                                        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                                            <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>Attempt {attempts.length - i}</span>
                                            <span style={{ fontSize: 13, color: '#64748B' }}>{formatAssessmentDate(s.date)}</span>
                                            <span style={{ fontSize: 13, color: '#64748B' }}>{formatAssessmentDuration(s.duration)}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <span style={{ fontSize: 16, fontWeight: 700, color: '#4F46E5' }}>{s.score}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right column — CTA card */}
                <div style={{ position: 'sticky', top: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16, padding: '24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)' }}>
                        {/* Best score ring */}
                        <div style={{ textAlign: 'center', marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <ScoreRing score={a.bestScore} size={110} />
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 }}>
                                <BarChart3 size={14} style={{ color: '#64748B' }} />
                                <span style={{ fontSize: 13, color: '#64748B' }}>
                                    Best score: <strong style={{ color: '#4F46E5' }}>{a.bestScore}%</strong>
                                </span>
                            </div>
                        </div>

                        {!confirmStart ? (
                            <button
                                onClick={() => setConfirmStart(true)}
                                style={{ width: '100%', padding: '14px', background: `linear-gradient(135deg, #E11D48, #BE123C)`, border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '0.3px', boxShadow: `0 4px 14px rgba(225, 29, 72, 0.35)`, transition: 'transform 0.15s, box-shadow 0.15s' }}
                                onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'translateY(-1px)'; (e.target as HTMLElement).style.boxShadow = `0 6px 20px rgba(225, 29, 72, 0.45)`; }}
                                onMouseLeave={e => { (e.target as HTMLElement).style.transform = ''; (e.target as HTMLElement).style.boxShadow = `0 4px 14px rgba(225, 29, 72, 0.35)`; }}
                            >
                                START ASSESSMENT
                            </button>
                        ) : (
                            <div>
                                <p style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 14 }}>Start this {ASSESSMENT_TIME_LIMIT_MINUTES}-minute assessment?</p>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={() => setConfirmStart(false)} style={{ flex: 1, padding: '11px', background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 10, cursor: 'pointer', fontSize: 13, color: '#64748B', fontWeight: 600 }}>Cancel</button>
                                    <button
                                        onClick={onStartQuiz}
                                        style={{ flex: 1, padding: '11px', background: '#E11D48', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, color: '#fff', fontWeight: 700 }}
                                    >Confirm</button>
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: 16, padding: '12px 14px', background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
                            <Trophy size={18} style={{ color: '#D97706', flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: '#64748B', lineHeight: 1.4 }}>Complete the assessment to earn <strong style={{ color: '#D97706' }}>{a.pointsReward} Points</strong> and a course badge</span>
                        </div>
                    </div>

                    <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Zap size={16} style={{ color: '#059669' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Next attempt</div>
                            <div style={{ fontSize: 12, color: '#64748B' }}>Attempt {a.attempts + 1}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
