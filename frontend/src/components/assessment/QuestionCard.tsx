import { CheckSquare, Square } from 'lucide-react';
import type { AssessmentQuestion } from '../../types/assessment/assessment.types';

interface QuestionCardProps {
    question: AssessmentQuestion;
    index: number;
    total: number;
    selectedAnswers: string[];
    toggleOption: (optId: string) => void;
}

export function QuestionCard({ question, index, total, selectedAnswers, toggleOption }: QuestionCardProps) {
    const isMulti = question.type === 'multiple-choice';

    return (
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 14, padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ background: '#E11D48', color: '#fff', fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 6 }}>
                        Question {index + 1}
                    </span>
                    <span
                        style={{
                            fontSize: 12,
                            padding: '3px 10px',
                            borderRadius: 20,
                            background: isMulti ? '#FFFBEB' : '#FFF1F3',
                            color: isMulti ? '#D97706' : '#E11D48',
                            fontWeight: 600,
                            border: `1px solid ${isMulti ? '#FDE68A' : '#FECDD3'}`
                        }}
                    >
                        {isMulti ? 'Multiple choice' : 'Single choice'}
                    </span>
                </div>
                <span style={{ fontSize: 12.5, color: '#9CA3AF' }}>{index + 1} / {total}</span>
            </div>

            {/* Question Text */}
            <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.7, color: '#111827', fontWeight: 500 }}>
                {question.content}
            </p>

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {question.options.length === 0 && (
                    <div
                        role={'alert'}
                        style={{
                            padding: '12px 14px',
                            borderRadius: 10,
                            background: '#FFF7ED',
                            color: '#9A3412',
                            fontSize: 13.5,
                            lineHeight: 1.5,
                        }}
                    >
                        This question has no answer options. Update it in lesson management.
                    </div>
                )}
                {question.options.map(opt => {
                    const selected = selectedAnswers.includes(opt.id);
                    return (
                        <button
                            key={opt.id}
                            onClick={() => toggleOption(opt.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 11,
                                padding: '13px 15px',
                                background: selected ? '#FFF1F3' : '#FFFFFF',
                                border: `1.5px solid ${selected ? '#E11D48' : '#E5E7EB'}`,
                                borderRadius: 10,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.12s',
                                color: selected ? '#111827' : '#374151',
                            }}
                            onMouseEnter={e => { if (!selected) (e.currentTarget.style.borderColor = '#FECDD3'); }}
                            onMouseLeave={e => { if (!selected) (e.currentTarget.style.borderColor = '#E5E7EB'); }}
                        >
                            {isMulti ? (
                                selected
                                    ? <CheckSquare size={17} style={{ color: '#E11D48', flexShrink: 0, marginTop: 1 }} />
                                    : <Square size={17} style={{ color: '#9CA3AF', flexShrink: 0, marginTop: 1 }} />
                            ) : (
                                <div
                                    style={{
                                        width: 17,
                                        height: 17,
                                        borderRadius: '50%',
                                        border: `2px solid ${selected ? '#E11D48' : '#9CA3AF'}`,
                                        background: selected ? '#E11D48' : 'transparent',
                                        flexShrink: 0,
                                        marginTop: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {selected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                                </div>
                            )}
                            <span style={{ fontSize: 14, lineHeight: 1.6, fontWeight: selected ? 600 : 400 }}>
                                {opt.text}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
