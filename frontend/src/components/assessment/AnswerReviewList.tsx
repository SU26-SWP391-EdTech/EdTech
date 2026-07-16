import { useState } from 'react';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { AnswerReviewItem } from '../../types/assessment/assessment.types';

interface AnswerReviewListProps {
    reviews: AnswerReviewItem[];
}

export function AnswerReviewList({ reviews }: AnswerReviewListProps) {
    const [expandedQ, setExpandedQ] = useState<number | null>(null);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reviews.map(a => {
                const expanded = expandedQ === a.id;
                return (
                    <div 
                        key={a.id} 
                        style={{ 
                            background: '#FFFFFF', 
                            border: `1px solid ${a.isCorrect ? '#BBF7D0' : '#FECDD3'}`, 
                            borderRadius: 12, 
                            overflow: 'hidden' 
                        }}
                    >
                        <button 
                            onClick={() => setExpandedQ(expanded ? null : a.id)} 
                            style={{ 
                                width: '100%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 11, 
                                padding: '13px 16px', 
                                background: 'transparent', 
                                border: 'none', 
                                cursor: 'pointer', 
                                textAlign: 'left' 
                            }}
                        >
                            <div 
                                style={{ 
                                    width: 26, 
                                    height: 26, 
                                    borderRadius: 7, 
                                    background: a.isCorrect ? '#F0FDF4' : '#FFF1F3', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    flexShrink: 0 
                                }}
                            >
                                {a.isCorrect 
                                    ? <CheckCircle2 size={14} style={{ color: '#16A34A' }} /> 
                                    : <XCircle size={14} style={{ color: '#E11D48' }} />
                                }
                            </div>
                            <span style={{ fontSize: 12, color: '#9CA3AF', flexShrink: 0, fontWeight: 600 }}>Q{a.id}</span>
                            <span style={{ flex: 1, fontSize: 13.5, color: '#374151', lineHeight: 1.5 }}>{a.content}</span>
                            <span 
                                style={{ 
                                    fontSize: 11, 
                                    padding: '2px 8px', 
                                    borderRadius: 12, 
                                    background: a.type === 'multiple-choice' ? '#FFFBEB' : '#EFF6FF', 
                                    color: a.type === 'multiple-choice' ? '#D97706' : '#2563EB', 
                                    fontWeight: 600, 
                                    border: `1px solid ${a.type === 'multiple-choice' ? '#FDE68A' : '#BFDBFE'}`, 
                                    flexShrink: 0 
                                }}
                            >
                                {a.type === 'multiple-choice' ? 'Nhiều đáp án' : 'Một đáp án'}
                            </span>
                            {expanded 
                                ? <ChevronUp size={14} style={{ color: '#9CA3AF', flexShrink: 0 }} /> 
                                : <ChevronDown size={14} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                            }
                        </button>

                        {expanded && (
                            <div style={{ padding: '0 16px 16px', borderTop: '1px solid #F3F4F6' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                                    {a.options.map(opt => {
                                        const wasSelected = a.selected.includes(opt.id);
                                        const isCorrectOpt = a.correct.includes(opt.id);
                                        
                                        let bg = '#F8FAFC';
                                        let border = '#E5E7EB';
                                        let color = '#9CA3AF';

                                        if (isCorrectOpt) { 
                                            bg = '#F0FDF4'; 
                                            border = '#BBF7D0'; 
                                            color = '#16A34A'; 
                                        } else if (wasSelected && !isCorrectOpt) { 
                                            bg = '#FFF1F3'; 
                                            border = '#FECDD3'; 
                                            color = '#E11D48'; 
                                        }

                                        return (
                                            <div 
                                                key={opt.id} 
                                                style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: 9, 
                                                    padding: '8px 12px', 
                                                    background: bg, 
                                                    border: `1px solid ${border}`, 
                                                    borderRadius: 8 
                                                }}
                                            >
                                                <span style={{ fontSize: 11, fontWeight: 700, color: isCorrectOpt ? '#16A34A' : wasSelected ? '#E11D48' : '#9CA3AF', minWidth: 14 }}>
                                                    {opt.id.toUpperCase()}
                                                </span>
                                                <span style={{ fontSize: 13, color: isCorrectOpt ? '#374151' : '#6B7280', flex: 1 }}>
                                                    {opt.text}
                                                </span>
                                                {wasSelected && !isCorrectOpt && <XCircle size={13} style={{ color: '#E11D48' }} />}
                                                {isCorrectOpt && <CheckCircle2 size={13} style={{ color: '#16A34A' }} />}
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                {a.explanation && (
                                    <div style={{ marginTop: 10, padding: '11px 14px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, borderLeft: '3px solid #2563EB' }}>
                                        <div style={{ fontSize: 11, color: '#2563EB', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                            Giải thích
                                        </div>
                                        <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.65 }}>
                                            {a.explanation}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
