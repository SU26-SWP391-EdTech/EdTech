import { useState } from 'react';
import { Plus, Trash2, CheckCircle2, X, HelpCircle, Check, Award } from 'lucide-react';
import type { Assessment, AssessmentQuestion, AssessmentType, QuestionType, QuestionOption } from '../../../types/lesson/create-lesson.types';
import { QuestionService } from '../../../services/assessment/question.service';

interface Props {
  assessments: Assessment[];
  setAssessments: React.Dispatch<React.SetStateAction<Assessment[]>>;
  courseId?: number | null;
  lessonId?: number | null;
}

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
    {children}{required && <span style={{ color: '#E11D48', marginLeft: 2 }}>*</span>}
  </label>
);

export function LessonAssessmentSection({ assessments, setAssessments, courseId, lessonId }: Props) {
  // Assessment Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<AssessmentType>('LESSON_QUIZ');

  // Question Form State (for a specific assessment)
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(null);
  const [qContent, setQContent] = useState('');
  const [qType, setQType] = useState<QuestionType>('MULTIPLE_CHOICE_SINGLE');
  const [qPoints, setQPoints] = useState(1);
  const [qOptions, setQOptions] = useState<string[]>(['', '', '', '']);
  const [correctIndices, setCorrectIndices] = useState<number[]>([0]);

  // Create Assessment
  const handleCreateAssessment = () => {
    if (!newTitle.trim()) return;
    const newAssessment: Assessment = {
      id: `ast-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      questions: [],
    };
    setAssessments(prev => [...prev, newAssessment]);
    setNewTitle('');
  };

  // Delete Assessment
  const handleDeleteAssessment = async (id: string | number) => {
    const target = assessments.find(a => a.id === id);
    if (target && courseId && lessonId) {
      const numericAssessmentId = typeof target.id === 'number' || !String(target.id).startsWith('ast-')
        ? Number(target.id)
        : Number(target.assessmentId);
        
      if (numericAssessmentId) {
        for (const q of target.questions || []) {
          const isDbQuestion = typeof q.id === 'number' || !String(q.id).startsWith('q-');
          const numericQuestionId = isDbQuestion ? Number(q.id) : Number((q as any).questionId);
          if (numericQuestionId) {
            try {
              await QuestionService.deleteQuestion(
                Number(courseId),
                Number(lessonId),
                numericAssessmentId,
                numericQuestionId
              );
            } catch (err) {
              console.error('Failed to delete question from backend:', err);
            }
          }
        }
      }
    }
    setAssessments(prev => prev.filter(a => a.id !== id));
  };

  // Handle Question Type Change (prefill True/False options)
  const handleQuestionTypeChange = (type: QuestionType) => {
    setQType(type);
    if (type === 'TRUE_FALSE') {
      setQOptions(['True', 'False']);
      setCorrectIndices([0]);
    } else {
      setQOptions(['', '', '', '']);
      setCorrectIndices([0]);
    }
  };

  // Toggle Correct Option Index
  const toggleCorrectIndex = (index: number) => {
    if (qType === 'MULTIPLE_CHOICE_SINGLE' || qType === 'TRUE_FALSE') {
      setCorrectIndices([index]);
    } else {
      // MULTIPLE_CHOICE_MULTI
      if (correctIndices.includes(index)) {
        setCorrectIndices(correctIndices.filter(i => i !== index));
      } else {
        setCorrectIndices([...correctIndices, index]);
      }
    }
  };

  // Save Question
  const handleSaveQuestion = async () => {
    if (!activeAssessmentId || !qContent.trim()) return;

    // Filter out blank options
    const filteredOptions = qOptions.map((o, idx) => ({
      id: `opt-${Date.now()}-${idx}`,
      content: o.trim() || `Option ${idx + 1}`,
      isCorrect: correctIndices.includes(idx),
    }));

    let newQuestion: AssessmentQuestion = {
      id: `q-${Date.now()}`,
      content: qContent.trim(),
      type: qType,
      points: qPoints,
      options: filteredOptions,
    };

    const isDbAssessment = typeof activeAssessmentId === 'number' || !String(activeAssessmentId).startsWith('ast-');
    if (isDbAssessment && courseId && lessonId) {
      try {
        const qResponse = await QuestionService.createQuestion(
          Number(courseId),
          Number(lessonId),
          Number(activeAssessmentId),
          {
            content: newQuestion.content,
            type: newQuestion.type === 'MULTIPLE_CHOICE_MULTI' ? 'MULTIPLE_CHOICE_MULTI' : 'MULTIPLE_CHOICE_SINGLE',
            points: newQuestion.points,
          }
        );
        if (qResponse && qResponse.questionId) {
          const dbQuestionId = qResponse.questionId;
          const savedOptions = [];
          
          for (let idx = 0; idx < filteredOptions.length; idx++) {
            const opt = filteredOptions[idx];
            try {
              const optResponse = await QuestionService.createQuestionOption(dbQuestionId, {
                content: opt.content,
                isCorrect: opt.isCorrect,
              });
              savedOptions.push({
                id: optResponse.optionId,
                content: optResponse.content,
                isCorrect: optResponse.isCorrect,
              });
            } catch (optErr) {
              console.warn('Failed to save option during direct add:', optErr);
              savedOptions.push(opt);
            }
          }
          
          newQuestion = {
            ...newQuestion,
            id: dbQuestionId,
            options: savedOptions,
          };
        }
      } catch (err) {
        console.error('Failed to immediately save question to backend:', err);
      }
    }

    setAssessments(prev => prev.map(a => {
      if (a.id === activeAssessmentId) {
        return {
          ...a,
          questions: [...a.questions, newQuestion],
        };
      }
      return a;
    }));

    // Reset question form
    setQContent('');
    setQType('MULTIPLE_CHOICE_SINGLE');
    setQPoints(1);
    setQOptions(['', '', '', '']);
    setCorrectIndices([0]);
    setActiveAssessmentId(null);
  };

  // Delete Question
  const handleDeleteQuestion = async (assessmentId: string | number, questionId: string | number) => {
    const isDbQuestion = typeof questionId === 'number' || !String(questionId).startsWith('q-');
    if (isDbQuestion && courseId && lessonId) {
      try {
        const numericAssessmentId = typeof assessmentId === 'number' || !String(assessmentId).startsWith('ast-')
          ? Number(assessmentId)
          : Number(assessments.find(a => a.id === assessmentId)?.assessmentId);
        
        if (numericAssessmentId) {
          await QuestionService.deleteQuestion(
            Number(courseId),
            Number(lessonId),
            numericAssessmentId,
            Number(questionId)
          );
        }
      } catch (err) {
        console.error('Failed to delete question from backend:', err);
      }
    }

    setAssessments(prev => prev.map(a => {
      if (a.id === assessmentId) {
        return {
          ...a,
          questions: a.questions.filter(q => q.id !== questionId),
        };
      }
      return a;
    }));
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '22px 26px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, background: '#FFF1F3', color: '#E11D48' }}>
          <Award size={16} />
        </div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>Assessments & Quizzes</h2>
      </div>

      {/* Create Assessment Form */}
      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <p style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 12 }}>Create New Assessment for this Lesson</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 240px' }}>
            <Label required>Title</Label>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="e.g. Final Lesson Assessment, Practice Quiz..."
              style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ width: 180 }}>
            <Label required>Type</Label>
            <select
              value={newType}
              onChange={e => setNewType(e.target.value as AssessmentType)}
              style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151', outline: 'none', background: '#fff' }}
            >
              <option value="LESSON_QUIZ">Lesson Quiz</option>
              <option value="PRACTICE">Practice</option>
              <option value="PVP">PvP Arena Quiz</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleCreateAssessment}
            disabled={!newTitle.trim()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px',
              border: 'none', borderRadius: 8, background: '#E11D48',
              color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              opacity: newTitle.trim() ? 1 : 0.6,
            }}
          >
            <Plus size={14} /> Create Assessment
          </button>
        </div>
      </div>

      {/* Assessments list */}
      {assessments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 20px', border: '1.5px dashed #E2E8F0', borderRadius: 12 }}>
          <HelpCircle size={32} style={{ color: '#94A3B8', marginBottom: 8 }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: '#64748B', margin: '0 0 4px' }}>No assessments created yet</p>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>Add assessments to evaluate students' learning progress.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {assessments.map(ast => (
            <div key={ast.id} style={{ border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: ast.type === 'LESSON_QUIZ' ? '#EFF6FF' : ast.type === 'PRACTICE' ? '#ECFDF5' : '#FFF1F3',
                    color: ast.type === 'LESSON_QUIZ' ? '#2563EB' : ast.type === 'PRACTICE' ? '#059669' : '#E11D48',
                  }}>
                    {ast.type}
                  </span>
                  <h3 style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', margin: 0 }}>{ast.title}</h3>
                  <span style={{ fontSize: 12, color: '#64748B' }}>({ast.questions.length} questions)</span>
                  {ast.type === 'PVP' && ast.questions.length < 5 && (
                    <span style={{ fontSize: 11, color: '#E11D48', fontWeight: 600, background: '#FFF1F3', padding: '2px 8px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      ⚠️ Needs at least 5 questions ({ast.questions.length}/5)
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setActiveAssessmentId(ast.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px',
                      background: '#FFF1F3', border: '1px solid #FECDD3', borderRadius: 6,
                      color: '#E11D48', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    }}
                  >
                    <Plus size={12} /> Add Question
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAssessment(ast.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifySelf: 'center', padding: 6,
                      background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Questions list inside assessment */}
              <div style={{ padding: '12px 18px' }}>
                {ast.questions.length === 0 ? (
                  <p style={{ fontSize: 12, color: '#94A3B8', margin: '4px 0', fontStyle: 'italic' }}>No questions added. Click "Add Question" above to add some.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {ast.questions.map((q, qidx) => (
                      <div key={q.id} style={{ display: 'flex', gap: 8, background: '#FAFAFA', borderRadius: 8, padding: 12, border: '1px solid #F1F5F9' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}>Q{qidx + 1}.</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', margin: 0 }}>{q.content}</p>
                            <span style={{ fontSize: 10, padding: '1px 6px', background: '#F1F5F9', color: '#64748B', borderRadius: 4, fontWeight: 600 }}>{q.type}</span>
                            <span style={{ fontSize: 10, padding: '1px 6px', background: '#FEF3C7', color: '#D97706', borderRadius: 4, fontWeight: 600 }}>{q.points} pts</span>
                          </div>
                          {/* Options visualizer */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 8 }}>
                            {q.options.map((opt, oidx) => (
                              <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{
                                  width: 14, height: 14, borderRadius: '50%',
                                  background: opt.isCorrect ? '#10B981' : '#E2E8F0',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                  {opt.isCorrect && <Check size={10} color="#fff" />}
                                </div>
                                <span style={{ fontSize: 12, color: opt.isCorrect ? '#059669' : '#475569', fontWeight: opt.isCorrect ? 600 : 400 }}>
                                  {opt.content}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(ast.id, q.id)}
                          style={{ border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', alignSelf: 'flex-start', padding: 4 }}
                          onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                          onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Question Modal Form */}
      {activeAssessmentId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', width: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.16)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Add Question</h3>
                <p style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Adding to assessment: {assessments.find(a => a.id === activeAssessmentId)?.title}</p>
              </div>
              <button onClick={() => setActiveAssessmentId(null)} style={{ border: 'none', background: '#F3F4F6', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Question Text */}
              <div>
                <Label required>Question Text / Content</Label>
                <textarea
                  value={qContent}
                  onChange={e => setQContent(e.target.value)}
                  placeholder="Type the question content here..."
                  rows={3}
                  style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              {/* Question Type & Points */}
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <Label required>Question Type</Label>
                  <select
                    value={qType}
                    onChange={e => handleQuestionTypeChange(e.target.value as QuestionType)}
                    style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA', fontFamily: 'inherit' }}
                  >
                    <option value="MULTIPLE_CHOICE_SINGLE">Single Choice</option>
                    <option value="MULTIPLE_CHOICE_MULTI">Multiple Choice</option>
                    <option value="TRUE_FALSE">True / False</option>
                  </select>
                </div>
                <div style={{ width: 100 }}>
                  <Label required>Points</Label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={qPoints}
                    onChange={e => setQPoints(Math.max(1, Number(e.target.value)))}
                    style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Options */}
              <div>
                <Label required>Answer Options & Correct Answer</Label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  {qOptions.map((opt, index) => {
                    const isCorrect = correctIndices.includes(index);
                    const isTrueFalse = qType === 'TRUE_FALSE';
                    return (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* Correct indicator selection (checkbox or radio style) */}
                        <button
                          type="button"
                          onClick={() => toggleCorrectIndex(index)}
                          style={{
                            width: 20, height: 20, borderRadius: qType === 'MULTIPLE_CHOICE_MULTI' ? 6 : '50%',
                            border: `1.5px solid ${isCorrect ? '#10B981' : '#CBD5E1'}`,
                            background: isCorrect ? '#10B981' : 'transparent',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isCorrect && <Check size={12} color="#fff" />}
                        </button>

                        <input
                          type="text"
                          value={opt}
                          disabled={isTrueFalse}
                          onChange={e => {
                            const updated = [...qOptions];
                            updated[index] = e.target.value;
                            setQOptions(updated);
                          }}
                          placeholder={`Option ${index + 1}`}
                          style={{
                            flex: 1, border: '1px solid #E5E7EB', borderRadius: 8,
                            padding: '8px 12px', fontSize: 13, color: '#374151',
                            outline: 'none', background: isTrueFalse ? '#F1F5F9' : '#FAFAFA',
                            boxSizing: 'border-box', fontFamily: 'inherit',
                          }}
                        />

                        {/* Delete option button for MCQ */}
                        {!isTrueFalse && qOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              setQOptions(qOptions.filter((_, i) => i !== index));
                              setCorrectIndices(correctIndices.filter(i => i !== index).map(i => i > index ? i - 1 : i));
                            }}
                            style={{ border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', padding: 4 }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add Option button for MCQ */}
                {qType !== 'TRUE_FALSE' && (
                  <button
                    type="button"
                    onClick={() => setQOptions([...qOptions, ''])}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4, margin: '10px 0 0',
                      background: 'transparent', border: 'none', color: '#E11D48',
                      cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
                    }}
                  >
                    <Plus size={12} /> Add option
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 26 }}>
              <button
                type="button"
                onClick={() => setActiveAssessmentId(null)}
                style={{ flex: 1, padding: '10px', border: '1px solid #E5E7EB', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuestion}
                disabled={!qContent.trim() || qOptions.some((o, i) => qType !== 'TRUE_FALSE' && !o.trim() && correctIndices.includes(i))}
                style={{
                  flex: 1, padding: '10px', background: '#E11D48', border: 'none',
                  borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  color: '#fff', opacity: qContent.trim() ? 1 : 0.6,
                }}
              >
                Save Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
