import { Trophy, Search } from 'lucide-react';

interface LeaderboardHeaderProps {
    search: string;
    setSearch: (s: string) => void;
}

export function LeaderboardHeader({ search, setSearch }: LeaderboardHeaderProps) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#F59E0B,#E11D48)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trophy size={17} color="#fff" />
                </div>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px' }}>Leaderboard</h1>
                    <p style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 1 }}>Rankings by score, time, attempts and PvP challenges</p>
                </div>
            </div>

            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 9, padding: '7px 12px', gap: 7, width: 220 }}>
                <Search size={13} style={{ color: '#9CA3AF' }} />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search learner..."
                    style={{ border: 'none', background: 'transparent', fontSize: 13, color: '#374151', outline: 'none', width: '100%' }}
                />
            </div>
        </div>
    );
}
