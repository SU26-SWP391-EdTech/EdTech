/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { FileQuestion, CheckCircle2, AlertCircle, Eye, Award, HelpCircle } from 'lucide-react';
import { AssessmentService } from '../../services/assessment/assessment.service';
import type { AssessmentQuestion } from '../../types/assessment/assessment.types';

interface AssessmentManagerReviewViewProps {
  lessonId: number;
}

export function AssessmentManagerReviewView({ lessonId }: AssessmentManagerReviewViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessmentTitle, setAssessmentTitle] = useState('Assessment');
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchAssessment = async () => {
      setLoading(true);
      setError(null);
      try {
        // Attempt 1: Fetch via manager review endpoint
        const managerData = await AssessmentService.getAssessmentForManager(lessonId);
        if (isMounted && managerData && Array.isArray(managerData) && managerData.length > 0) {
          const firstAss = managerData[0];
          setAssessmentTitle(firstAss.title || 'Assessment');

          if (firstAss.questions && Array.isArray(firstAss.questions) && firstAss.questions.length > 0) {
            const parsedQuestions: AssessmentQuestion[] = firstAss.questions.map((q: any, idx: number) => {
              const isMulti = q.type === 'MULTIPLE_CHOICE_MULTI';
              return {
                id: q.questionId || q.id || idx + 1,
                type: isMulti ? 'multiple-choice' : 'single-choice',
                content: q.content || `Question ${idx + 1}`,
                points: q.points ? Number(q.points) : 10,
                options: (q.options || []).map((opt: any, oIdx: number) => ({
                  id: String(opt.optionId || opt.id || oIdx + 1),
                  text: opt.content || opt.text || `Option ${oIdx + 1}`,
                  isCorrect: !!opt.isCorrect,
                })),
              };
            });
            setQuestions(parsedQuestions);
            setLoading(false);
            return;
          }
        }

        // Fallback: Fetch general questions & info
        const info = await AssessmentService.getAssessmentInfo(lessonId);
        const qList = await AssessmentService.getQuestions(lessonId, false);
        if (isMounted) {
          if (info?.metadata?.title) setAssessmentTitle(info.metadata.title);
          setQuestions(qList || []);
        }
      } catch (err: any) {
        console.warn('Manager review fetch failed, using fallback questions:', err);
        try {
          const qList = await AssessmentService.getQuestions(lessonId, false);
          if (isMounted) setQuestions(qList || []);
        } catch {
          if (isMounted) setError('Unable to load assessment questions.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAssessment();
    return () => {
      isMounted = false;
    };
  }, [lessonId]);

  if (loading) {
    return (
      <div style={{ padding: '64px 32px', textAlign: 'center', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16 }}>
        <div className="loading loading-spinner loading-lg text-rose-600 mb-3 mx-auto" />
        <p style={{ fontSize: 14, color: '#6B7280' }}>Loading assessment content for manager review...</p>
      </div>
    );
  }

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 10), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── HEADER NOTICE BANNER ─────────────────────────────────────────── */}
      <div style={{
        padding: '20px 24px',
        background: '#FFF1F2',
        border: '1px solid #FECDD3',
        borderRadius: 16,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
      }}>
        <div style={{ background: '#FFE4E6', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Eye size={22} style={{ color: '#E11D48' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#9F1239', margin: 0 }}>
              {assessmentTitle} — Manager review
            </h3>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: '#FFE4E6', color: '#9F1239', textTransform: 'uppercase' }}>
              Read only
            </span>
          </div>
          <p style={{ fontSize: 13.5, color: '#BE123C', marginTop: 4, marginBottom: 0, lineHeight: 1.5 }}>
            You are viewing this lesson as a manager or instructor. Only learners can submit assessments. Review the questions and answers below.
          </p>
        </div>
      </div>

      {/* ── STATS SUMMARY BAR ────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12,
      }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileQuestion size={20} style={{ color: '#2563EB' }} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>Total questions</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{questions.length} questions</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={20} style={{ color: '#D97706' }} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>Total points</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{totalPoints} points</div>
          </div>
        </div>
      </div>

      {/* ── QUESTIONS LIST ────────────────────────────────────────────────── */}
      {error && (
        <div style={{ padding: 16, background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, color: '#991B1B', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: 13 }}>{error}</span>
        </div>
      )}

      {!error && questions.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16 }}>
          <HelpCircle size={32} style={{ color: '#9CA3AF', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, color: '#4B5563', fontWeight: 600 }}>This assessment has no questions yet</p>
          <p style={{ fontSize: 13, color: '#9CA3AF' }}>Add questions from the course management screen.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h4 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0, paddingLeft: 4 }}>
            Assessment questions ({questions.length})
          </h4>

          {questions.map((q, idx) => {
            const isMulti = q.type === 'multiple-choice';

            return (
              <div
                key={q.id || idx}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: 16,
                  padding: '20px 24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                {/* Question Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, background: '#F3F4F6', color: '#374151', padding: '4px 10px', borderRadius: 8 }}>
                      Question {idx + 1}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 8, background: isMulti ? '#FFFBEB' : '#EFF6FF', color: isMulti ? '#D97706' : '#2563EB', border: `1px solid ${isMulti ? '#FDE68A' : '#BFDBFE'}` }}>
                      {isMulti ? 'Multiple choice' : 'Single choice'}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#E11D48', background: '#FFF1F2', padding: '3px 10px', borderRadius: 8 }}>
                    {q.points} points
                  </span>
                </div>

                {/* Question Content */}
                <p style={{ fontSize: 15, fontWeight: 600, color: '#1F2937', lineHeight: 1.6, marginBottom: 16 }}>
                  {q.content}
                </p>

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {q.options.map((opt: any, oIdx: number) => {
                    const isCorrect = !!opt.isCorrect;
                    const optionLetter = String.fromCharCode(65 + oIdx);

                    return (
                      <div
                        key={opt.id || oIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '11px 16px',
                          background: isCorrect ? '#F0FDF4' : '#F8FAFC',
                          border: `1px solid ${isCorrect ? '#86EFAC' : '#E5E7EB'}`,
                          borderRadius: 10,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: isCorrect ? '#16A34A' : '#6B7280',
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          background: isCorrect ? '#DCFCE7' : '#E5E7EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {optionLetter}
                        </span>

                        <span style={{ fontSize: 14, color: isCorrect ? '#14532D' : '#374151', flex: 1, fontWeight: isCorrect ? 600 : 400 }}>
                          {opt.text}
                        </span>

                        {isCorrect && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#DCFCE7', border: '1px solid #86EFAC', padding: '2px 8px', borderRadius: 6 }}>
                            <CheckCircle2 size={14} style={{ color: '#16A34A' }} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#15803D' }}>Correct answer</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
