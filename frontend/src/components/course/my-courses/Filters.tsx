import { Search } from "lucide-react";
import { STATUS_CFG } from "./statusConfig";
import type { FiltersProps } from "../../../types/course/my-course.types";



const Filters = ({ search, setSearch, statusFilter, setStatusFilter, counts }: FiltersProps) => {
    return (
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#F3F4F6', borderRadius: 8, padding: '7px 12px', gap: 7, flex: 1, maxWidth: 300 }}>
                <Search size={13} style={{ color: '#9CA3AF' }} />
                <input 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    placeholder="Search your courses..." 
                    style={{ border: 'none', background: 'transparent', fontSize: 13, color: '#374151', outline: 'none', width: '100%' }} 
                />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(['ALL', 'DRAFT', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(s => (
                    <button 
                        key={s} 
                        onClick={() => setStatusFilter(s)} 
                        style={{ 
                            padding: '6px 12px', 
                            borderRadius: 7, 
                            border: `1px solid ${statusFilter === s ? '#E11D48' : '#E5E7EB'}`, 
                            background: statusFilter === s ? '#FFF1F3' : '#fff', 
                            cursor: 'pointer', 
                            fontSize: 12.5, 
                            fontWeight: 500, 
                            color: statusFilter === s ? '#E11D48' : '#6B7280', 
                            whiteSpace: 'nowrap' 
                        }}
                    >
                        {s === 'ALL' ? `All (${counts.ALL})` : `${STATUS_CFG[s].label} (${counts[s]})`}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Filters;