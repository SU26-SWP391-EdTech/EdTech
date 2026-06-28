import { useState } from 'react';
import { BookOpen, ChevronRight, FileQuestion, AlertCircle, Trophy, Zap, BarChart3 } from 'lucide-react';
import { useAssessmentDetail } from '../../hooks/assessment/useAssessmentDetail';
import { ScoreRing } from '../../components/assessment/ScoreRing';
import { AssessmentStatsGrid } from '../../components/assessment/AssessmentStatsGrid';

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
                    <p style={{ fontSize: 13, color: '#64748B' }}>Đang tải thông tin bài thi...</p>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    if (error || !a) {
        return (
            <div style={{ padding: 24, textAlign: 'center', color: '#EF4444', fontFamily: "'Inter',sans-serif" }}>
                <AlertCircle size={24} style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 14 }}>{error || 'Không tìm thấy thông tin bài thi.'}</p>
            </div>
        );
    }

    const passing = a.passScore;

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#111827', fontFamily: "'Inter','SF Pro Display',sans-serif", paddingBottom: 60 }}>
            {/* Header band */}
            <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB', padding: '24px 0' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
                    {/* Course breadcrumb */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748B', marginBottom: 16 }}>
                        <BookOpen size={14} style={{ color: '#64748B' }} />
                        <span>{a.course}</span>
                        <ChevronRight size={12} />
                        <span style={{ color: '#E11D48', fontWeight: 500 }}>Bài kiểm tra</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 14, background: '#FEF2F2', border: '1.5px solid #E11D48', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FileQuestion size={26} style={{ color: '#E11D48' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px', marginBottom: 6 }}>
                                {a.title}
                            </h1>
                            <p style={{ margin: 0, color: '#64748B', fontSize: 14, lineHeight: 1.6, maxWidth: 700 }}>{a.description}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 0', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28, alignItems: 'start' }}>
                {/* Left column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Stats row */}
                    <AssessmentStatsGrid 
                        timeLimit={a.timeLimit} 
                        passScore={a.passScore} 
                        questionCount={a.questionCount} 
                        xpReward={a.xpReward} 
                    />

                    {/* Topics covered */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#111827' }}>Nội dung kiểm tra</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {a.topics.map((t, i) => (
                                <span key={i} style={{ background: '#EEF2FF', border: '1.5px solid #F1F5F9', borderRadius: 20, padding: '6px 14px', fontSize: 13, color: '#4F46E5', fontWeight: 500 }}>{t}</span>
                            ))}
                        </div>
                    </div>

                    {/* Rules */}
                    <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 16, padding: '20px 24px', display: 'flex', gap: 14 }}>
                        <AlertCircle size={20} style={{ color: '#D97706', flexShrink: 0, marginTop: 1 }} />
                        <div style={{ fontSize: 14, color: '#92400E', lineHeight: 1.6 }}>
                            <strong style={{ color: '#92400E', fontWeight: 700 }}>Lưu ý trước khi làm bài:</strong>
                            <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                                <li>Đồng hồ đếm ngược sẽ bắt đầu ngay khi bạn nhấn "Bắt đầu làm bài".</li>
                                <li>Không thể tạm dừng bài thi sau khi đã bắt đầu.</li>
                                <li>Câu hỏi chưa trả lời được tính là sai khi hết giờ.</li>
                                <li>Bạn có thể quay lại các câu đã làm trong phiên thi.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Previous attempts */}
                    {attempts.length > 0 && (
                        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#111827' }}>Lịch sử làm bài</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {attempts.map((s, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 12 }}>
                                        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                                            <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>Lần {attempts.length - i}</span>
                                            <span style={{ fontSize: 13, color: '#64748B' }}>{s.date}</span>
                                            <span style={{ fontSize: 13, color: '#64748B' }}>{s.duration}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <span style={{ fontSize: 18, fontWeight: 700, color: s.score >= passing ? '#059669' : '#DC2626' }}>{s.score} điểm</span>
                                            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: s.score >= passing ? '#ECFDF5' : '#FEF2F2', color: s.score >= passing ? '#059669' : '#DC2626' }}>{s.score >= passing ? 'ĐẠT' : 'CHƯA ĐẠT'}</span>
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
                            <ScoreRing score={a.bestScore} passScore={a.passScore} passed={a.bestScore >= a.passScore} size={110} />
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 }}>
                                <BarChart3 size={14} style={{ color: '#64748B' }} />
                                <span style={{ fontSize: 13, color: '#64748B' }}>
                                    {a.bestScore >= passing 
                                        ? 'Chúc mừng! Bạn đã vượt qua bài kiểm tra' 
                                        : <>Cần <strong style={{ color: '#D97706' }}>{passing - a.bestScore}</strong> điểm nữa để đạt</>
                                    }
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
                                BẮT ĐẦU LÀM BÀI
                            </button>
                        ) : (
                            <div>
                                <p style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 14 }}>Xác nhận bắt đầu bài thi {a.timeLimit} phút?</p>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={() => setConfirmStart(false)} style={{ flex: 1, padding: '11px', background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 10, cursor: 'pointer', fontSize: 13, color: '#64748B', fontWeight: 600 }}>Hủy</button>
                                    <button
                                        onClick={onStartQuiz}
                                        style={{ flex: 1, padding: '11px', background: '#E11D48', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, color: '#fff', fontWeight: 700 }}
                                    >Xác nhận</button>
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: 16, padding: '12px 14px', background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
                            <Trophy size={18} style={{ color: '#D97706', flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: '#64748B', lineHeight: 1.4 }}>Đạt bài thi nhận ngay <strong style={{ color: '#D97706' }}>{a.xpReward} XP</strong> và huy hiệu khóa học</span>
                        </div>
                    </div>

                    <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Zap size={16} style={{ color: '#059669' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Độ khó: {a.difficulty}</div>
                            <div style={{ fontSize: 12, color: '#64748B' }}>Lần thử {a.attempts + 1} của bạn</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
