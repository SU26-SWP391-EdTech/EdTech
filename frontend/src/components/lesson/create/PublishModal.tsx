import { Info, CheckCircle2, AlertCircle, Rocket } from 'lucide-react';
import type { BackendCourse } from '../../../services/course/course.service';
import type { ChecklistItem } from '../../../hooks/lesson/useCreateLesson';

interface Props {
  selectedCourse: BackendCourse | null;
  checklistState: Record<string, boolean>;
  checklist: ChecklistItem[];
  isSaving: boolean;
  confirmPublish: () => void;
  onClose: () => void;
}

export function PublishModal({ selectedCourse, checklistState, checklist, isSaving, confirmPublish, onClose }: Props) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '32px 36px', width: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.16)', textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, background: '#EFF6FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Info size={24} style={{ color: '#2563EB' }} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Publish lesson?</h3>
        <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.6, marginBottom: 18 }}>
          Learners enrolled in <strong style={{ color: '#111827' }}>{selectedCourse?.title || 'this course'}</strong> will be able to access this lesson based on its visibility settings.
        </p>

        {/* Checklist */}
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 16px', marginBottom: 20, textAlign: 'left' }}>
          {checklist.slice(0, 5).map(item => (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
              {checklistState[item.key]
                ? <CheckCircle2 size={13} style={{ color: '#16A34A' }} />
                : <AlertCircle size={13} style={{ color: '#D97706' }} />}
              <span style={{ fontSize: 12.5, color: checklistState[item.key] ? '#15803D' : '#92400E' }}>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '11px', border: '1px solid #E5E7EB', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff' }}
          >
            Cancel
          </button>
          <button
            onClick={confirmPublish}
            disabled={isSaving}
            style={{ flex: 1, padding: '11px', background: '#E11D48', border: 'none', borderRadius: 9, cursor: isSaving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: isSaving ? 0.7 : 1 }}
          >
            <Rocket size={14} /> {isSaving ? 'Saving...' : 'Publish Lesson'}
          </button>
        </div>
      </div>
    </div>
  );
}
