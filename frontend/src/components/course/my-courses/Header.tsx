import { Plus } from "lucide-react";
import type { HeaderProps } from "../../../types/course/my-course.types";


const Header = ({ onCreateCourse }: HeaderProps) => {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
            <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px', marginBottom: 4 }}>My Courses</h1>
                <p style={{ fontSize: 13.5, color: '#6B7280' }}>Manage your courses — create, edit, and submit for review.</p>
            </div>
            <button onClick={onCreateCourse} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#E11D48', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff' }}>
                <Plus size={14} /> Create Course
            </button>
        </div>
    );
};

export default Header;