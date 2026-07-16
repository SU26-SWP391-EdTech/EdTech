import { AlertTriangle } from "lucide-react";

interface EditWarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const EditWarningModal = ({ isOpen, onClose, onConfirm }: EditWarningModalProps) => {
    return (
        isOpen ? (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
                <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', width: 420, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                    <div style={{ width: 44, height: 44, background: '#FEF3C7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                        <AlertTriangle size={18} style={{ color: '#D97706' }} />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Warning: Edit course?</h3>
                    <p style={{ fontSize: 13.5, color: '#4B5563', lineHeight: 1.6, marginBottom: 20 }}>
                        Warning: This course is currently in <strong>APPROVED</strong> status. Editing this course will change its status back to <strong>DRAFT</strong>, and you will need to submit it for review again to update the course. Do you want to continue?
                    </p>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={onClose} style={{ flex: 1, padding: '10px', border: '1px solid #E5E7EB', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff' }}>Cancel</button>
                        <button onClick={onConfirm} style={{ flex: 1, padding: '10px', background: '#D97706', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff' }}>Confirm</button>
                    </div>
                </div>
            </div>
        ) : null
    );
};

export default EditWarningModal;
