import type { AssessmentQuestion } from '../../types/assessment/assessment.types';

interface QuizNavigatorProps {
    questions: AssessmentQuestion[];
    answers: Record<number, string[]>;
    currentQ: number;
    setCurrentQ: (idx: number) => void;
}

export function QuizNavigator({ questions, answers, currentQ, setCurrentQ }: QuizNavigatorProps) {
    const TOTAL = questions.length;
    const answeredCount = Object.keys(answers).filter(k => answers[Number(k)]?.length > 0).length;

    const qStatus = (idx: number) => {
        if (idx === currentQ) return 'current';
        if (answers[questions[idx].id]?.length > 0) return 'answered';
        return 'unanswered';
    };

    return (
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 14px', position: 'sticky', top: 72 }}>
            <h4 style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Question navigator
            </h4>

            {/* Questions Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>
                {questions.map((_, idx) => {
                    const st = qStatus(idx);
                    let borderColor = '#E5E7EB';
                    let background = '#F8FAFC';
                    let color = '#9CA3AF';

                    if (st === 'current') {
                        borderColor = '#E11D48';
                        background = '#E11D48';
                        color = '#FFFFFF';
                    } else if (st === 'answered') {
                        borderColor = '#BBF7D0';
                        background = '#F0FDF4';
                        color = '#16A34A';
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => setCurrentQ(idx)}
                            style={{
                                width: '100%',
                                aspectRatio: '1',
                                borderRadius: 6,
                                border: `1.5px solid ${borderColor}`,
                                cursor: 'pointer',
                                fontSize: 11,
                                fontWeight: 600,
                                background,
                                color,
                                transition: 'all 0.1s'
                            }}
                        >
                            {idx + 1}
                        </button>
                    );
                })}
            </div>

            {/* Legend guide */}
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[
                    { color: '#E11D48', bg: '#E11D48', label: 'Current' },
                    { color: '#16A34A', bg: '#F0FDF4', label: 'Answered' },
                    { color: '#9CA3AF', bg: '#F8FAFC', label: 'Not answered' },
                ].map(({ color, bg, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 11, height: 11, borderRadius: 3, background: bg, border: `1.5px solid ${color}` }} />
                        <span style={{ fontSize: 11, color: '#6B7280' }}>{label}</span>
                    </div>
                ))}
            </div>

            {/* Counter box */}
            <div style={{ marginTop: 14, padding: '11px 12px', background: '#FFF1F3', border: '1px solid #FECDD3', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#6B7280', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Not answered
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#E11D48' }}>
                    {TOTAL - answeredCount}
                </div>
                <div style={{ fontSize: 10, color: '#9CA3AF' }}>/ {TOTAL} questions</div>
            </div>
        </div>
    );
}
