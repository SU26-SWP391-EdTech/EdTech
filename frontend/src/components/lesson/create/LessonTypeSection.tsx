import { Video, BookOpen, ClipboardList } from 'lucide-react';

interface Props {
  hasVideo: boolean;
  setHasVideo: (b: boolean) => void;
  hasReading: boolean;
  setHasReading: (b: boolean) => void;
  hasAssessment: boolean;
  setHasAssessment: (b: boolean) => void;
}

export function LessonTypeSection({
  hasVideo,
  setHasVideo,
  hasReading,
  setHasReading,
  hasAssessment,
  setHasAssessment
}: Props) {
  const handleToggleVideo = () => {
    if (hasAssessment) {
      setHasVideo(true);
      setHasAssessment(false);
      return;
    }
    if (hasVideo && !hasReading) return;
    setHasVideo(!hasVideo);
  };

  const handleToggleReading = () => {
    if (hasAssessment) {
      setHasReading(true);
      setHasAssessment(false);
      return;
    }
    if (hasReading && !hasVideo) return;
    setHasReading(!hasReading);
  };

  const handleToggleAssessment = () => {
    if (hasAssessment) return;
    setHasAssessment(true);
    setHasVideo(false);
    setHasReading(false);
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '22px 26px', marginBottom: 16 }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Lesson Content Options</h2>
        <p style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>Select the content type(s) included in this lesson (choose at least one).</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {/* Video Card */}
        <button
          type="button"
          onClick={handleToggleVideo}
          style={{
            textAlign: 'left', padding: '16px 20px', borderRadius: 10,
            border: `1.5px solid ${hasVideo ? '#E11D48' : '#E5E7EB'}`,
            background: hasVideo ? '#FFF1F3' : '#FAFAFA',
            cursor: 'pointer', transition: 'all 0.15s',
            display: 'flex', flexDirection: 'column', gap: 4
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Video size={20} color={hasVideo ? '#E11D48' : '#6B7280'} />
            <input 
              type="checkbox" 
              checked={hasVideo} 
              readOnly 
              style={{ accentColor: '#E11D48', cursor: 'pointer' }}
            />
          </div>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: hasVideo ? '#E11D48' : '#111827', marginTop: 8 }}>Video Lecture</p>
          <p style={{ fontSize: 11.5, color: '#6B7280', lineHeight: 1.4 }}>Upload or link a video lesson</p>
        </button>

        {/* Reading Card */}
        <button
          type="button"
          onClick={handleToggleReading}
          style={{
            textAlign: 'left', padding: '16px 20px', borderRadius: 10,
            border: `1.5px solid ${hasReading ? '#E11D48' : '#E5E7EB'}`,
            background: hasReading ? '#FFF1F3' : '#FAFAFA',
            cursor: 'pointer', transition: 'all 0.15s',
            display: 'flex', flexDirection: 'column', gap: 4
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <BookOpen size={20} color={hasReading ? '#E11D48' : '#6B7280'} />
            <input 
              type="checkbox" 
              checked={hasReading} 
              readOnly 
              style={{ accentColor: '#E11D48', cursor: 'pointer' }}
            />
          </div>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: hasReading ? '#E11D48' : '#111827', marginTop: 8 }}>Reading Material</p>
          <p style={{ fontSize: 11.5, color: '#6B7280', lineHeight: 1.4 }}>Written content, articles, or documentation</p>
        </button>

        {/* Assessment Card */}
        <button
          type="button"
          onClick={handleToggleAssessment}
          style={{
            textAlign: 'left', padding: '16px 20px', borderRadius: 10,
            border: `1.5px solid ${hasAssessment ? '#E11D48' : '#E5E7EB'}`,
            background: hasAssessment ? '#FFF1F3' : '#FAFAFA',
            cursor: 'pointer', transition: 'all 0.15s',
            display: 'flex', flexDirection: 'column', gap: 4
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <ClipboardList size={20} color={hasAssessment ? '#E11D48' : '#6B7280'} />
            <input 
              type="checkbox" 
              checked={hasAssessment} 
              readOnly 
              style={{ accentColor: '#E11D48', cursor: 'pointer' }}
            />
          </div>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: hasAssessment ? '#E11D48' : '#111827', marginTop: 8 }}>Assessment</p>
          <p style={{ fontSize: 11.5, color: '#6B7280', lineHeight: 1.4 }}>Practice quiz, PvP Arena, or test</p>
        </button>
      </div>
    </div>
  );
}
