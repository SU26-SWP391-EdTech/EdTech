import { CheckCircle2, X } from 'lucide-react';
import type { LearnerToast } from '../../../types/user/learner-profile.types';

const Toast = ({ toast, setToast }: LearnerToast) => {
    if (!toast) return null;
    
    return (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#111827', borderRadius: 10, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 200 }}>
            <CheckCircle2 size={16} style={{ color: '#4ADE80' }} />
            <span style={{ fontSize: 13.5, fontWeight: 500, color: '#fff' }}>Profile updated successfully.</span>
            <button onClick={() => setToast(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', marginLeft: 8 }}>
                <X size={13} style={{ color: '#9CA3AF' }} />
            </button>
        </div>
    );
};

export default Toast;