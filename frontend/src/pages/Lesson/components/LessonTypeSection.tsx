import { Video, BookOpen, ClipboardCheck } from 'lucide-react';
import type { LessonType } from './useCreateLesson';

const lessonTypes: { id: LessonType; icon: React.FC<{ size: number; color?: string }>; title: string; desc: string }[] = [
  { id: 'video', icon: Video, title: 'Video Lesson', desc: 'Upload or link a video lecture' },
  { id: 'reading', icon: BookOpen, title: 'Reading Lesson', desc: 'Written content, articles, or notes' },
  { id: 'quiz', icon: ClipboardCheck, title: 'Quiz', desc: 'Knowledge check with questions' },
];

interface Props {
  lessonType: LessonType;
  setLessonType: (t: LessonType) => void;
}

export function LessonTypeSection({ lessonType, setLessonType }: Props) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '22px 26px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Lesson Type</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {lessonTypes.map(lt => {
          const selected = lessonType === lt.id;
          return (
            <button
              key={lt.id}
              onClick={() => setLessonType(lt.id)}
              style={{
                textAlign: 'left', padding: '14px 16px', borderRadius: 10,
                border: `1.5px solid ${selected ? '#E11D48' : '#E5E7EB'}`,
                background: selected ? '#FFF1F3' : '#FAFAFA',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <lt.icon size={18} color={selected ? '#E11D48' : '#6B7280'} />
              <p style={{ fontSize: 13, fontWeight: 600, color: selected ? '#E11D48' : '#111827', marginTop: 8, marginBottom: 3 }}>{lt.title}</p>
              <p style={{ fontSize: 11.5, color: '#6B7280', lineHeight: 1.4 }}>{lt.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
