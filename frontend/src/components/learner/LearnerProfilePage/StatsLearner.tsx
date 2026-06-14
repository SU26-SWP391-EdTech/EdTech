import { BookOpen, CheckCircle2, TrendingUp } from 'lucide-react';
import type { LearnerStats } from '../../../types/learner/learner-profile.types';

const StatsLearner = ({ enrolledCount, completedCount, avgProgress }: LearnerStats) => {
    // Nếu avgProgress là NaN (khi chưa đăng ký khóa học nào), đặt là 0
    const safeAvgProgress = isNaN(avgProgress) ? 0 : avgProgress;
    
    // Nếu avgProgress ở dạng thập phân [0, 1] thì quy đổi ra phần trăm (nhân 100), ngược lại giữ nguyên
    const displayProgress = safeAvgProgress <= 1 && safeAvgProgress > 0 ? safeAvgProgress * 100 : safeAvgProgress;

    return (
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '16px 18px' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Learning Stats</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                    { icon: BookOpen, label: 'Enrolled Courses', value: enrolledCount, color: '#7C3AED' },
                    { icon: CheckCircle2, label: 'Completed', value: completedCount, color: '#16A34A' },
                    { icon: TrendingUp, label: 'Avg. Progress', value: `${Math.round(displayProgress)}%`, color: '#E11D48' },
                ].map(s => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <s.icon size={15} style={{ color: s.color, flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 12.5, color: '#6B7280' }}>{s.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatsLearner;