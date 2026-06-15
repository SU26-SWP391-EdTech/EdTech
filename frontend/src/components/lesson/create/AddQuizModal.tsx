import { X } from 'lucide-react';

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
    {children}{required && <span style={{ color: '#E11D48', marginLeft: 2 }}>*</span>}
  </label>
);
const Input = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box', fontFamily: 'inherit' }} />
);

interface Props {
  qText: string; setQText: (v: string) => void;
  qType: string; setQType: (v: string) => void;
  qOptions: string[]; setQOptions: (v: string[]) => void;
  qCorrect: number; setQCorrect: (v: number) => void;
  shortAnswer: string; setShortAnswer: (v: string) => void;
  onAdd: () => void;
  onClose: () => void;
}

export function AddQuizModal({ qText, setQText, qType, setQType, qOptions, setQOptions, qCorrect, setQCorrect, shortAnswer, setShortAnswer, onAdd, onClose }: Props) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', width: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.16)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Add Quiz Question</h3>
          <button onClick={onClose} style={{ border: 'none', background: '#F3F4F6', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Question text */}
          <div>
            <Label required>Question Text</Label>
            <textarea
              value={qText} onChange={e => setQText(e.target.value)} rows={3}
              placeholder="Enter your question..."
              style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, background: '#FAFAFA', boxSizing: 'border-box' }}
            />
          </div>

          {/* Question type */}
          <div>
            <Label>Question Type</Label>
            <select value={qType} onChange={e => setQType(e.target.value)} style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA', fontFamily: 'inherit' }}>
              {['Multiple Choice', 'True / False', 'Short Answer'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          {/* Multiple choice options */}
          {qType === 'Multiple Choice' && (
            <div>
              <Label>Answer Options</Label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {qOptions.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => setQCorrect(i)}
                      style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${qCorrect === i ? '#E11D48' : '#D1D5DB'}`, background: qCorrect === i ? '#E11D48' : 'transparent', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <input
                      value={opt}
                      onChange={e => { const a = [...qOptions]; a[i] = e.target.value; setQOptions(a); }}
                      placeholder={`Option ${i + 1}`}
                      style={{ flex: 1, border: '1px solid #E5E7EB', borderRadius: 7, padding: '6px 10px', fontSize: 12.5, outline: 'none', background: '#FAFAFA' }}
                    />
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 5 }}>Click the circle to mark the correct answer</p>
            </div>
          )}

          {/* True / False */}
          {qType === 'True / False' && (
            <div>
              <Label>Answer Options</Label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {['True', 'False'].map((label, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => setQCorrect(idx)}
                      style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${qCorrect === idx ? '#E11D48' : '#D1D5DB'}`, background: qCorrect === idx ? '#E11D48' : 'transparent', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 5 }}>Click the circle to select the correct statement</p>
            </div>
          )}

          {/* Short answer */}
          {qType === 'Short Answer' && (
            <div>
              <Label required>Correct Answer</Label>
              <Input value={shortAnswer} onChange={setShortAnswer} placeholder="Enter the exact correct answer text..." />
            </div>
          )}

          <div><Label>Explanation (optional)</Label><Input value="" onChange={() => { }} placeholder="Explain why this is the correct answer..." /></div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', border: '1px solid #E5E7EB', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff' }}>Cancel</button>
          <button onClick={onAdd} style={{ flex: 1, padding: '10px', background: '#E11D48', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff' }}>Add Question</button>
        </div>
      </div>
    </div>
  );
}
