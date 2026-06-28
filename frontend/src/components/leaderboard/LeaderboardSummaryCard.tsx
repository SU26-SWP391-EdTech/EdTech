import { Crown, Medal, Target, Clock, TrendingUp, Swords, Zap } from 'lucide-react';
import type { LeaderboardTab, LeaderboardEntry } from '../../types/leaderboard/leaderboard.types';

interface LeaderboardSummaryCardProps {
    tab: LeaderboardTab;
    currentUserCourseEntry: LeaderboardEntry | undefined;
    currentUserOverallEntry: any;
    selectedCourseTitle: string;
}

export function RankBadge({ rank }: { rank: number }) {
    if (rank === 1) return <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#F59E0B,#D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Crown size={13} color="#fff" /></div>;
    if (rank === 2) return <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#9CA3AF,#6B7280)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Medal size={13} color="#fff" /></div>;
    if (rank === 3) return <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#D97706,#B45309)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Medal size={13} color="#fff" /></div>;
    return <span style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#9CA3AF' }}>{rank}</span>;
}

export function LeaderboardSummaryCard({
    tab,
    currentUserCourseEntry,
    currentUserOverallEntry,
    selectedCourseTitle,
}: LeaderboardSummaryCardProps) {
    if (tab === 'course' && currentUserCourseEntry) {
        return (
            <div style={{ background: 'linear-gradient(135deg,#FFF1F3,#fff)', border: '1px solid #FECDD3', borderRadius: 12, padding: '12px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <RankBadge rank={currentUserCourseEntry.rank} />
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#E11D48,#9F1239)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{currentUserCourseEntry.initials}</span>
                    </div>
                    <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#E11D48' }}>You — #{currentUserCourseEntry.rank} · {selectedCourseTitle}</p>
                        <p style={{ fontSize: 11, color: '#9CA3AF' }}>Total {currentUserCourseEntry.total} pts</p>
                    </div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 20 }}>
                    {[
                        { label: 'Score', val: currentUserCourseEntry.score, color: '#7C3AED', icon: Target },
                        { label: 'Time', val: `${currentUserCourseEntry.time}m`, color: '#2563EB', icon: Clock },
                        { label: 'Attempt', val: currentUserCourseEntry.attempt, color: '#D97706', icon: TrendingUp },
                        { label: 'PvP', val: currentUserCourseEntry.pvp, color: '#059669', icon: Swords },
                        { label: 'Total', val: currentUserCourseEntry.total, color: '#E11D48', icon: Zap },
                    ].map(s => (
                        <div key={s.label} style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.val}</p>
                            <p style={{ fontSize: 10.5, color: '#9CA3AF' }}>{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (tab === 'overall' && currentUserOverallEntry) {
        return (
            <div style={{ background: 'linear-gradient(135deg,#FFF1F3,#fff)', border: '1px solid #FECDD3', borderRadius: 12, padding: '12px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <RankBadge rank={currentUserOverallEntry.rank} />
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#E11D48,#9F1239)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>JD</span>
                    </div>
                    <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#E11D48' }}>You — #{currentUserOverallEntry.rank} Overall</p>
                        <p style={{ fontSize: 11, color: '#9CA3AF' }}>{currentUserOverallEntry.coursesCompleted} courses · {currentUserOverallEntry.total} total pts</p>
                    </div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 20 }}>
                    {[
                        { label: 'Score', val: currentUserOverallEntry.score, color: '#7C3AED' },
                        { label: 'Attempt', val: currentUserOverallEntry.attempt, color: '#D97706' },
                        { label: 'PvP', val: currentUserOverallEntry.pvp, color: '#059669' },
                        { label: 'Courses', val: currentUserOverallEntry.coursesCompleted, color: '#2563EB' },
                        { label: 'Total', val: currentUserOverallEntry.total, color: '#E11D48' },
                    ].map(s => (
                        <div key={s.label} style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.val}</p>
                            <p style={{ fontSize: 10.5, color: '#9CA3AF' }}>{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return null;
}
