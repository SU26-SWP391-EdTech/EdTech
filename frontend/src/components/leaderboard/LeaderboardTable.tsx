import { Clock, TrendingUp, Swords } from 'lucide-react';
import type { LeaderboardTab, LeaderboardEntry } from '../../types/leaderboard/leaderboard.types';
import { RankBadge } from './LeaderboardSummaryCard';

interface LeaderboardTableProps {
    tab: LeaderboardTab;
    searchedList: LeaderboardEntry[];
    totalCourses: number;
}

export function LeaderboardTable({
    tab,
    searchedList,
    totalCourses,
}: LeaderboardTableProps) {
    const tableCols = tab === 'course'
        ? ['#', 'Learner', 'Score', 'Time', 'Attempt', 'PvP', 'Total']
        : ['#', 'Learner', 'Score', 'Time', 'Attempt', 'PvP', 'Courses', 'Total'];

    return (
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                        {tableCols.map(h => (
                            <th key={h} style={{ padding: '11px 16px', textAlign: h === '#' ? 'center' : 'left', fontSize: 11.5, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {searchedList.length === 0 ? (
                        <tr>
                            <td colSpan={tableCols.length} style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF', fontSize: 13.5 }}>
                                No learners found.
                            </td>
                        </tr>
                    ) : (
                        searchedList.map((entry, i) => {
                            const isMe = entry.isCurrentUser;
                            return (
                                <tr
                                    key={entry.userId}
                                    style={{ borderBottom: i < searchedList.length - 1 ? '1px solid #F3F4F6' : 'none', background: isMe ? '#FFF5F5' : entry.rank <= 3 ? '#FFFBF0' : 'transparent' }}
                                    onMouseEnter={e => { if (!isMe && entry.rank > 3) e.currentTarget.style.background = '#FAFAFA'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = isMe ? '#FFF5F5' : entry.rank <= 3 ? '#FFFBF0' : ''; }}
                                >
                                    <td style={{ padding: '13px 16px', textAlign: 'center' }}><RankBadge rank={entry.rank} /></td>

                                    <td style={{ padding: '13px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: isMe ? 'linear-gradient(135deg,#E11D48,#9F1239)' : 'linear-gradient(135deg,#374151,#111827)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{entry.initials}</span>
                                            </div>
                                            <p style={{ fontSize: 13.5, fontWeight: isMe ? 700 : 500, color: isMe ? '#E11D48' : '#111827' }}>
                                                {entry.fullName}
                                                {isMe && <span style={{ fontSize: 11, fontWeight: 600, marginLeft: 6, padding: '1px 6px', background: '#E11D48', color: '#fff', borderRadius: 20 }}>You</span>}
                                            </p>
                                        </div>
                                    </td>

                                    <td style={{ padding: '13px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div style={{ width: 48, height: 4, background: '#F3F4F6', borderRadius: 4 }}>
                                                <div style={{ width: `${Math.min(100, (entry.score / (tab === 'overall' ? 4 : 1)) * (tab === 'overall' ? 0.25 : 1))}%`, height: '100%', background: '#7C3AED', borderRadius: 4 }} />
                                            </div>
                                            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#7C3AED' }}>{entry.score}</span>
                                        </div>
                                    </td>

                                    <td style={{ padding: '13px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <Clock size={12} style={{ color: '#9CA3AF' }} />
                                            <span style={{ fontSize: 13.5, color: '#374151' }}>{entry.time}m</span>
                                        </div>
                                    </td>

                                    <td style={{ padding: '13px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <TrendingUp size={12} style={{ color: '#9CA3AF' }} />
                                            <span style={{ fontSize: 13.5, color: '#374151' }}>{entry.attempt}</span>
                                        </div>
                                    </td>

                                    <td style={{ padding: '13px 16px' }}>
                                        {entry.pvp > 0
                                            ? <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Swords size={12} style={{ color: '#059669' }} /><span style={{ fontSize: 13.5, fontWeight: 600, color: '#059669' }}>{entry.pvp}</span></div>
                                            : <span style={{ fontSize: 13.5, color: '#D1D5DB' }}>—</span>}
                                    </td>

                                    {/* "Courses" column — only in overall tab */}
                                    {tab === 'overall' && (
                                        <td style={{ padding: '13px 16px' }}>
                                            <span style={{ fontSize: 13.5, color: '#374151', fontWeight: 500 }}>{entry.coursesCompleted || 0} / {totalCourses}</span>
                                        </td>
                                    )}

                                    <td style={{ padding: '13px 16px' }}>
                                        <span style={{ fontSize: 15, fontWeight: 700, color: entry.rank === 1 ? '#F59E0B' : entry.rank === 2 ? '#6B7280' : entry.rank === 3 ? '#D97706' : '#111827' }}>
                                            {entry.total}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
