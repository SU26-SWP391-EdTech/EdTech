import React, { useState, useEffect } from 'react';
import { Sliders, Check, X, Edit3, PlusCircle } from 'lucide-react';
import type { LeaderboardRule } from '../../types/leaderboard/leaderboard.types';

interface LeaderboardRuleCardProps {
    courseId: number;
    courseTitle: string;
    rule: LeaderboardRule | null;
    isLoadingRule: boolean;
    onSaveRule: (
        weights: { scoreWeight: number; timeWeight: number; attemptWeight: number },
        isEdit: boolean
    ) => Promise<void>;
}


export function LeaderboardRuleCard({
    courseId,
    courseTitle,
    rule,
    isLoadingRule,
    onSaveRule,
}: LeaderboardRuleCardProps) {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Form inputs state
    const [scoreWeight, setScoreWeight] = useState<number>(0.4);
    const [timeWeight, setTimeWeight] = useState<number>(0.2);
    const [attemptWeight, setAttemptWeight] = useState<number>(0.1);

    // Sync state when rule or course changes
    useEffect(() => {
        if (rule) {
            setScoreWeight(Number(rule.scoreWeight));
            setTimeWeight(Number(rule.timeWeight));
            setAttemptWeight(Number(rule.attemptWeight));
        } else {
            // Default rules if no custom rule exists yet
            setScoreWeight(0.4);
            setTimeWeight(0.2);
            setAttemptWeight(0.1);
        }
        setIsEditing(false);
    }, [rule, courseId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await onSaveRule(
                {
                    scoreWeight: Number(scoreWeight),
                    timeWeight: Number(timeWeight),
                    attemptWeight: Number(attemptWeight),
                },
                !!rule
            );
            setIsEditing(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingRule) {
        return (
            <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: '#64748B' }}>Loading leaderboard rule configuration...</p>
            </div>
        );
    }

    return (
        <div style={{ background: '#FFF', border: '1px solid #FCD34D', borderRadius: 12, padding: '16px 20px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                
                {/* Title & Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sliders size={18} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', margin: 0 }}>
                                Leaderboard Calculation Rule — {courseTitle}
                            </h3>
                            <span style={{
                                fontSize: 11,
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: 12,
                                background: rule ? '#DEF7EC' : '#F3F4F6',
                                color: rule ? '#03543F' : '#4B5563',
                            }}>
                                {rule ? 'Custom Rule Active' : 'Default Rule (Default System Weights)'}
                            </span>
                        </div>
                        <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0 0' }}>
                            Configure weights used to calculate total leaderboard points for learners in this course.
                        </p>
                    </div>
                </div>

                {/* Edit/Configure Action Button */}
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 14px',
                            background: '#D97706',
                            color: '#FFF',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = '#B45309')}
                        onMouseOut={(e) => (e.currentTarget.style.background = '#D97706')}
                    >
                        {rule ? <Edit3 size={14} /> : <PlusCircle size={14} />}
                        {rule ? 'Edit Rule' : 'Configure Custom Rule'}
                    </button>
                )}
            </div>

            {/* Read-only Weight Overview (when not editing) */}
            {!isEditing && (
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px border-dashed #FDE68A', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, color: '#64748B' }}>Score Weight:</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#7C3AED' }}>{rule ? rule.scoreWeight : '0.40 (Default)'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, color: '#64748B' }}>Time Weight:</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#2563EB' }}>{rule ? rule.timeWeight : '0.20 (Default)'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, color: '#64748B' }}>Attempt Weight:</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#D97706' }}>{rule ? rule.attemptWeight : '0.10 (Default)'}</span>
                    </div>
                </div>
            )}

            {/* Inline Form (when editing) */}
            {isEditing && (
                <form onSubmit={handleSubmit} style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #FDE68A' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 16 }}>
                        
                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                                Score Weight
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={scoreWeight}
                                onChange={(e) => setScoreWeight(parseFloat(e.target.value) || 0)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: 6,
                                    border: '1px solid #CBD5E1',
                                    fontSize: 13,
                                    outline: 'none',
                                }}
                            />
                            <span style={{ fontSize: 11, color: '#94A3B8' }}>Multiplier for score</span>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                                Time Weight
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={timeWeight}
                                onChange={(e) => setTimeWeight(parseFloat(e.target.value) || 0)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: 6,
                                    border: '1px solid #CBD5E1',
                                    fontSize: 13,
                                    outline: 'none',
                                }}
                            />
                            <span style={{ fontSize: 11, color: '#94A3B8' }}>Multiplier for completion time</span>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
                                Attempt Weight
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={attemptWeight}
                                onChange={(e) => setAttemptWeight(parseFloat(e.target.value) || 0)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: 6,
                                    border: '1px solid #CBD5E1',
                                    fontSize: 13,
                                    outline: 'none',
                                }}
                            />
                            <span style={{ fontSize: 11, color: '#94A3B8' }}>Multiplier for attempt count</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            disabled={isSubmitting}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '6px 12px',
                                background: '#F1F5F9',
                                color: '#475569',
                                border: '1px solid #CBD5E1',
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            <X size={14} />
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '6px 16px',
                                background: '#059669',
                                color: '#FFF',
                                border: 'none',
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            <Check size={14} />
                            {isSubmitting ? 'Saving...' : 'Save Rule Configuration'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
