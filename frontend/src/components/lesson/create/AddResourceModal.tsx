import { Upload, X } from 'lucide-react';

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
    {children}{required && <span style={{ color: '#E11D48', marginLeft: 2 }}>*</span>}
  </label>
);
const Input = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box', fontFamily: 'inherit' }} />
);

interface SelectProps { value: string; onChange: (v: string) => void; options: string[]; }
const Sel = ({ value, onChange, options }: SelectProps) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#374151', outline: 'none', background: '#FAFAFA', fontFamily: 'inherit' }}>
    {options.map(o => <option key={o}>{o}</option>)}
  </select>
);

interface Props {
  rName: string; setRName: (v: string) => void;
  rType: string; setRType: (v: string) => void;
  rVisibility: 'public' | 'enrolled'; setRVisibility: (v: 'public' | 'enrolled') => void;
  onAdd: () => void;
  onClose: () => void;
}

export function AddResourceModal({ rName, setRName, rType, setRType, rVisibility, setRVisibility, onAdd, onClose }: Props) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', width: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.16)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Add Resource</h3>
          <button onClick={onClose} style={{ border: 'none', background: '#F3F4F6', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><Label required>Resource Name</Label><Input value={rName} onChange={setRName} placeholder="e.g. REST Controller Cheat Sheet" /></div>
          <div><Label>Resource Type</Label><Sel value={rType} onChange={setRType} options={['PDF', 'ZIP', 'JSON', 'Link', 'Video', 'Image', 'Other']} /></div>
          <div>
            <Label>Upload File or URL</Label>
            <div style={{ border: '1.5px dashed #E5E7EB', borderRadius: 8, padding: '16px', textAlign: 'center', cursor: 'pointer', background: '#FAFAFA' }}>
              <Upload size={18} style={{ color: '#9CA3AF', marginBottom: 6 }} />
              <p style={{ fontSize: 12.5, color: '#6B7280' }}>Drop file or click to browse</p>
            </div>
          </div>
          <div><Label>Visibility</Label><Sel value={rVisibility === 'public' ? 'Public' : 'Enrolled Only'} onChange={v => setRVisibility(v === 'Public' ? 'public' : 'enrolled')} options={['Enrolled Only', 'Public']} /></div>
          <div><Label>Description (optional)</Label><Input value="" onChange={() => { }} placeholder="Brief description for learners" /></div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', border: '1px solid #E5E7EB', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff' }}>Cancel</button>
          <button onClick={onAdd} style={{ flex: 1, padding: '10px', background: '#E11D48', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff' }}>Add Resource</button>
        </div>
      </div>
    </div>
  );
}
