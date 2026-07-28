import { ChevronRight, ChevronDown } from 'lucide-react';
import type { BackendCourse } from '../../../services/course/course.service';

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
    {children}{required && <span style={{ color: '#E11D48', marginLeft: 2 }}>*</span>}
  </label>
);

const Input = ({ value, onChange, placeholder, error }: { value: string; onChange: (v: string) => void; placeholder?: string; error?: boolean }) => (
  <input
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      width: '100%', border: `1px solid ${error ? '#FCA5A5' : '#E5E7EB'}`, borderRadius: 8,
      padding: '8px 12px', fontSize: 13, color: '#374151', outline: 'none',
      background: error ? '#FFF5F5' : '#FAFAFA', boxSizing: 'border-box',
      fontFamily: 'inherit', transition: 'border-color 0.15s',
    }}
  />
);

const SelectInput = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) => (
  <div style={{ position: 'relative' }}>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 32px 8px 12px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA', appearance: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
    >
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
    <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
  </div>
);

interface Props {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  duration: string;
  setDuration: (v: string) => void;
  videoDurationInput?: string;
  setVideoDurationInput?: (v: string) => void;
  hasVideo?: boolean;
  hasReading?: boolean;
  lessonOrder: number;
  courses: BackendCourse[];
  selectedCourseId: number | null;
  setSelectedCourseId: (id: number | null) => void;
  selectedCourse: BackendCourse | null;
  draftCourseTitle: string | null;
  titleError: boolean;
  setTitleError: (v: boolean) => void;
  setEditingLessonId: (id: number | null) => void;
  setSavedLessonId: (id: number | null) => void;
  searchParams: URLSearchParams;
  navigate: (path: string) => void;
  lessons?: any[];
  editingLessonId?: number | null;
  prerequisiteLessonIds?: number[];
  setPrerequisiteLessonIds?: (ids: number[]) => void;
}

export function LessonInfoSection({
  title, setTitle, description, setDescription, duration, setDuration,
  videoDurationInput = '', setVideoDurationInput, hasVideo = true, hasReading = false,
  lessonOrder, courses, setSelectedCourseId, selectedCourse,
  draftCourseTitle, titleError, setTitleError, setEditingLessonId, setSavedLessonId,
  searchParams, navigate, lessons, editingLessonId, prerequisiteLessonIds, setPrerequisiteLessonIds,
}: Props) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '22px 26px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Lesson Information</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* Title */}
        <div style={{ gridColumn: '1 / -1' }}>
          <Label required>Lesson Title</Label>
          <Input
            value={title}
            onChange={v => { setTitle(v); setTitleError(false); }}
            placeholder="Enter a clear, specific lesson title"
            error={titleError}
          />
          {titleError && <p style={{ fontSize: 11.5, color: '#E11D48', marginTop: 4 }}>Lesson title is required.</p>}
          <p style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 4 }}>Lesson title should be clear, specific, and easy for learners to understand.</p>
        </div>



        {/* Select Course */}
        <div>
          <Label>Select Course</Label>
          {draftCourseTitle ? (
            <div style={{ padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#F3F4F6', fontSize: 13, color: '#374151', fontWeight: 600 }}>
              {draftCourseTitle} (Course Draft)
            </div>
          ) : (
            <SelectInput
              value={selectedCourse?.title || ''}
              onChange={value => {
                const course = courses.find(c => c.title === value);
                setSelectedCourseId(course?.courseId ?? null);
                setEditingLessonId(null);
                setSavedLessonId(null);
              }}
              options={courses.length ? courses.map(c => c.title) : ['No courses found']}
            />
          )}
        </div>

        {/* Lesson Order */}
        <div>
          <Label>Lesson Order</Label>
          <Input value={String(lessonOrder)} onChange={() => { }} placeholder="e.g. 3" />
        </div>

        {/* Duration */}
        <div style={{ gridColumn: '1 / -1' }}>
          {hasVideo ? (
            <>
              <Label>Video Duration (min)</Label>
              <Input
                value={videoDurationInput}
                onChange={setVideoDurationInput || (() => {})}
                placeholder="e.g. 15"
              />
              <p style={{ fontSize: 11.5, color: '#6B7280', marginTop: 5 }}>
                {hasReading ? (
                  <span>
                    Total lesson duration: <strong>{duration} min</strong> (Video: {videoDurationInput || '0'} min + Default Reading: 10 min)
                  </span>
                ) : (
                  <span>Total lesson duration is based solely on video: <strong>{duration || '0'} min</strong></span>
                )}
              </p>
            </>
          ) : (
            <>
              <Label>Estimated Duration (min)</Label>
              <Input value="10" onChange={() => {}} placeholder="10" />
              <p style={{ fontSize: 11.5, color: '#6B7280', marginTop: 5 }}>
                Reading lessons have a default duration of <strong>10 minutes</strong>.
              </p>
            </>
          )}
        </div>

        {/* Prerequisites selection */}
        {lessons && lessons.length > 0 && (() => {
          const availableForPrereq = lessons.filter(
            l => Number(l.lessonId) !== Number(editingLessonId)
          );
          const selectedIds = prerequisiteLessonIds || [];
          const unselectedLessons = availableForPrereq.filter(
            l => !selectedIds.includes(Number(l.lessonId))
          );

          return (
            <div style={{ gridColumn: '1 / -1', marginTop: 10 }}>
              <Label>Prerequisite Lessons</Label>
              <p style={{ fontSize: 11.5, color: '#6B7280', marginBottom: 8 }}>
                Learners must complete these lessons before accessing this one.
              </p>

              {/* Selected prerequisite badges */}
              {selectedIds.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {selectedIds.map(lid => {
                    const lesson = lessons.find(l => Number(l.lessonId) === lid);
                    return (
                      <span
                        key={lid}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          background: '#FFF1F2', border: '1px solid #FECDD3',
                          borderRadius: 20, padding: '4px 10px 4px 12px',
                          fontSize: 12, fontWeight: 500, color: '#E11D48',
                        }}
                      >
                        {lesson?.title || `Lesson ${lid}`}
                        <button
                          type="button"
                          onClick={() => {
                            if (setPrerequisiteLessonIds) {
                              setPrerequisiteLessonIds(selectedIds.filter(id => id !== lid));
                            }
                          }}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#F43F5E', fontWeight: 700, fontSize: 14,
                            lineHeight: 1, padding: '0 2px', display: 'flex', alignItems: 'center',
                          }}
                          title="Remove prerequisite"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Dropdown to add new prerequisites */}
              {unselectedLessons.length > 0 ? (
                <div style={{ position: 'relative' }}>
                  <select
                    value=""
                    onChange={e => {
                      const lid = Number(e.target.value);
                      if (lid && setPrerequisiteLessonIds) {
                        setPrerequisiteLessonIds([...selectedIds, lid]);
                      }
                    }}
                    style={{
                      width: '100%', border: '1px solid #E5E7EB', borderRadius: 8,
                      padding: '8px 32px 8px 12px', fontSize: 13, color: '#374151',
                      outline: 'none', background: '#FAFAFA', appearance: 'none',
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    <option value="">+ Add prerequisite lesson…</option>
                    {unselectedLessons.map(l => (
                      <option key={Number(l.lessonId)} value={Number(l.lessonId)}>
                        {l.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    style={{
                      position: 'absolute', right: 10, top: '50%',
                      transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none',
                    }}
                  />
                </div>
              ) : (
                <p style={{
                  fontSize: 12, color: '#9CA3AF', fontStyle: 'italic',
                  padding: '8px 12px', border: '1px solid #E5E7EB',
                  borderRadius: 8, background: '#FAFAFA',
                }}>
                  {availableForPrereq.length === 0
                    ? 'No other lessons in this course yet.'
                    : 'All available lessons have been added as prerequisites.'}
                </p>
              )}
            </div>
          );
        })()}
      </div>

      {/* Back to course link */}
      {searchParams.get('redirectBack') && (
        <button
          onClick={() => navigate(searchParams.get('redirectBack')!)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4, background: 'none', border: 'none', color: '#2563EB', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', padding: 0 }}
        >
          <ChevronRight size={13} style={{ transform: 'rotate(180deg)' }} /> Back to Course
        </button>
      )}
    </div>
  );
}
