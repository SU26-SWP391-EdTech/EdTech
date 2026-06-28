import { Swords } from 'lucide-react';
import type { LeaderboardTab, LeaderboardEntry } from '../../types/leaderboard/leaderboard.types';

interface ChallengeModalProps {
    challengeModalEntry: LeaderboardEntry | null;
    setChallengeModalEntry: (e: LeaderboardEntry | null) => void;
    tab: LeaderboardTab;
    selectedCourseTitle: string;
    currentUserCourseEntry: LeaderboardEntry | undefined;
    currentUserOverallEntry: any;
    handleSendChallenge: () => void;
}

export function ChallengeModal({
    challengeModalEntry,
    setChallengeModalEntry,
    tab,
    selectedCourseTitle,
    currentUserCourseEntry,
    currentUserOverallEntry,
    handleSendChallenge,
}: ChallengeModalProps) {
    if (!challengeModalEntry) return null;

    const isCourseTab = tab === 'course';
    const theirTotal = challengeModalEntry.total;
    const yourTotal = isCourseTab
        ? (currentUserCourseEntry?.total ?? 0)
        : (currentUserOverallEntry?.total ?? 0);

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', width: 400, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#E11D48,#9F1239)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <Swords size={22} color="#fff" />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
                    Challenge {challengeModalEntry.fullName}?
                </h3>
                <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.6, marginBottom: 16 }}>
                    {isCourseTab ? (
                        <>Head-to-head in <strong style={{ color: '#111827' }}>{selectedCourseTitle}</strong>.</>
                    ) : (
                        <>Overall challenge across all courses.</>
                    )}
                </p>
                <div style={{ background: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: 10, padding: '14px 18px', marginBottom: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                    <div style={{ textAlign: 'center', borderRight: '1px solid #E5E7EB', paddingRight: 16 }}>
                        <p style={{ fontSize: 11.5, color: '#9CA3AF', marginBottom: 4 }}>Their total</p>
                        <p style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{theirTotal}</p>
                    </div>
                    <div style={{ textAlign: 'center', paddingLeft: 16 }}>
                        <p style={{ fontSize: 11.5, color: '#9CA3AF', marginBottom: 4 }}>Your total</p>
                        <p style={{ fontSize: 22, fontWeight: 700, color: '#E11D48' }}>
                            {yourTotal}
                        </p>
                    </div>
                </div>
                <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 20 }}>Winner earns +5 PvP points.</p>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        onClick={() => setChallengeModalEntry(null)}
                        style={{ flex: 1, padding: '10px', border: '1px solid #E5E7EB', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSendChallenge}
                        style={{ flex: 1, padding: '10px', background: '#E11D48', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                        <Swords size={14} /> Send Challenge
                    </button>
                </div>
            </div>
        </div>
    );
}
