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
}

export function LessonInfoSection({
  title, setTitle, description, setDescription, duration, setDuration,
  lessonOrder, courses, setSelectedCourseId, selectedCourse,
  draftCourseTitle, titleError, setTitleError, setEditingLessonId, setSavedLessonId,
  searchParams, navigate,
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

        {/* Description */}
        <div style={{ gridColumn: '1 / -1' }}>
          <Label>Short Description</Label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }}
          />
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

        {/* Select Module */}
        <div>
          <Label>Select Module</Label>
          {searchParams.get('targetModuleId') ? (
            <div style={{ padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#F3F4F6', fontSize: 13, color: '#374151', fontWeight: 600 }}>
              {(() => {
                const saved = localStorage.getItem('create_course_draft');
                if (saved) {
                  try {
                    const draft = JSON.parse(saved);
                    const mod = draft.modules?.find((m: any) => m.id === searchParams.get('targetModuleId'));
                    if (mod) return mod.title;
                  } catch { }
                }
                return 'Selected Module';
              })()}
            </div>
          ) : (
            <SelectInput value="Course Lessons" onChange={() => { }} options={['Course Lessons']} />
          )}
        </div>

        {/* Lesson Order */}
        <div>
          <Label>Lesson Order</Label>
          <Input value={String(lessonOrder)} onChange={() => { }} placeholder="e.g. 3" />
        </div>

        {/* Duration */}
        <div>
          <Label>Estimated Duration (min)</Label>
          <Input value={duration} onChange={setDuration} placeholder="18" />
        </div>
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
