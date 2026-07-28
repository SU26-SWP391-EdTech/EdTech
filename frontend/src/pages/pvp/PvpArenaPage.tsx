import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Search, Loader, ShieldAlert, UserCheck, Sparkles, BookOpen, Star } from 'lucide-react';
import { usePvp } from '../../context/PvpContext';
import { getLearnerProfile } from '../../services/learner/learner.services';
import { useAuthStore } from '../../stores/auth/auth.stores';
import { getMyEnrollments } from '../../services/enrollment/enrollment.service';
import { pvpSocket } from '../../services/pvp/pvp-socket';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

interface PvpPlayer {
    userId: number;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    bio?: string;
    level?: string;
}

export function PvpArenaPage() {
    const navigate = useNavigate();
    const { sendChallenge } = usePvp();
    const currentUser = useAuthStore((state) => state.user);

    // Enrollments and Course selection states
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

    // Player and loading states
    const [players, setPlayers] = useState<PvpPlayer[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    // 1. Fetch user's enrolled courses on mount
    useEffect(() => {
        async function fetchMyCourses() {
            try {
                const list = await getMyEnrollments();
                setCourses(list);
                if (list && list.length > 0) {
                    setSelectedCourseId(list[0].course.courseId);
                } else {
                    setSelectedCourseId(null);
                }
            } catch (err) {
                console.error('Failed to fetch user enrollments:', err);
                // Fallback courses list
                setCourses([
                    { course: { courseId: 1, title: 'Java Basic' } },
                    { course: { courseId: 2, title: 'Spring Boot REST API' } },
                    { course: { courseId: 4, title: 'React & TypeScript' } }
                ]);
                setSelectedCourseId(1);
            }
        }
        fetchMyCourses();
    }, []);

    // 2. Fetch and filter candidates for the selected course (online only)
    useEffect(() => {
        if (!selectedCourseId) {
            setPlayers([]);
            setLoading(false);
            return;
        }
        let isMounted = true;

        async function fetchRealOnline() {
            try {
                const res = await api.get<PvpPlayer[]>(`/challenge_request/online`, {
                    params: { courseId: selectedCourseId }
                });
                if (isMounted) {
                    setPlayers(res.data || []);
                }
            } catch (err) {
                console.error('Failed to fetch online players:', err);
                if (isMounted) {
                    setPlayers([]);
                }
            }
        }

        async function loadAllData() {
            setLoading(true);
            await fetchRealOnline();
            if (isMounted) {
                setLoading(false);
            }
        }

        loadAllData();

        // Listen for real-time online status changes
        const handleOnlineStatusChange = (data: any) => {
            console.log('Real-time online status change event:', data);
            fetchRealOnline();
        };

        pvpSocket.on('online_players_changed', handleOnlineStatusChange);

        const interval = setInterval(() => {
            fetchRealOnline();
        }, 10000);

        return () => {
            isMounted = false;
            pvpSocket.off('online_players_changed', handleOnlineStatusChange);
            clearInterval(interval);
        };
    }, [selectedCourseId, currentUser?.userId]);

    const getPvpAssessmentId = async () => {
        let pvpAssessmentId: number | null = null;
        if (selectedCourseId) {
            try {
                const res = await api.get(`/assessment/courses/${selectedCourseId}/pvp`);
                if (res.data) {
                    if (res.data.assessmentId) {
                        pvpAssessmentId = res.data.assessmentId;
                    } else if (Array.isArray(res.data) && res.data.length > 0) {
                        pvpAssessmentId = res.data[0].assessmentId;
                    }
                }
            } catch (err) {
                console.warn('Failed to fetch PvP assessment for course:', err);
            }
        }
        return pvpAssessmentId;
    };

    const handleChallengeReal = async (player: PvpPlayer) => {
        const assessmentId = await getPvpAssessmentId();
        if (!assessmentId) {
            toast.error('Could not find PvP assessment for this course.');
            return;
        }
        try {
            sendChallenge(player.userId, assessmentId);
            toast.success(`Challenge sent to ${player.fullName}! Waiting for response...`, {
                icon: '⚔️',
                duration: 5000
            });
        } catch (err) {
            toast.error('Failed to send challenge invitation.');
        }
    };

    // Filter players by Search term
    const filteredOnline = players.filter((p) => {
        return p.fullName.toLowerCase().includes(search.toLowerCase()) ||
            p.email.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div style={{
            background: 'transparent',
            color: '#1E293B',
            padding: '16px 0 40px',
            fontFamily: "'Inter', 'SF Pro Display', sans-serif"
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                {/* Header banner */}
                <div style={{
                    background: 'linear-gradient(135deg, #FFF1F3 0%, #FFE4E6 100%)',
                    borderRadius: 20,
                    padding: '40px 36px',
                    color: '#9F1239',
                    marginBottom: 32,
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid #FECDD3',
                    boxShadow: '0 10px 25px rgba(225, 29, 72, 0.04)'
                }}>
                    {/* Decorative glowing gradient circle */}
                    <div style={{
                        position: 'absolute',
                        top: '-30%',
                        right: '-10%',
                        width: 320,
                        height: 320,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(244, 63, 94, 0.12) 0%, rgba(255,255,255,0) 70%)',
                        filter: 'blur(30px)',
                        pointerEvents: 'none'
                    }} />

                    <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                        <div style={{
                            width: 64,
                            height: 64,
                            borderRadius: 16,
                            backgroundColor: '#FFFFFF',
                            border: '2px solid #E11D48',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#E11D48',
                            boxShadow: '0 8px 20px rgba(225, 29, 72, 0.12)'
                        }}>
                            <Swords size={32} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: '#880808' }}>
                                PvP Battle Arena
                            </h1>
                            <p style={{ margin: '8px 0 0 0', color: '#4C0519', opacity: 0.8, fontSize: 15, maxWidth: 650, lineHeight: 1.6 }}>
                                Challenge active peers studying the same course in real-time mental duels. Test your course knowledge under pressure!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Course Selector Tabs Bar */}
                <div style={{ marginBottom: 32 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>
                        Select course to duel in
                    </p>
                    {courses.length === 0 ? (
                        <div style={{
                            backgroundColor: '#FFF1F2',
                            border: '1px dashed #FECDD3',
                            borderRadius: 16,
                            padding: '16px 24px',
                            color: '#E11D48',
                            fontSize: 14.5,
                            fontWeight: 600
                        }}>
                            Hãy tham gia khóa học để tìm người pvp
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', overflowX: 'auto', paddingBottom: 8 }}>
                            {courses.map((item) => {
                                const c = item.course;
                                const isSelected = selectedCourseId === c.courseId;
                                return (
                                    <button
                                        key={c.courseId}
                                        onClick={() => setSelectedCourseId(c.courseId)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            padding: '10px 18px',
                                            borderRadius: 99,
                                            background: isSelected
                                                ? 'linear-gradient(135deg, #E11D48, #BE123C)'
                                                : '#FFFFFF',
                                            border: isSelected
                                                ? '1px solid #E11D48'
                                                : '1px solid #E2E8F0',
                                            color: isSelected ? '#fff' : '#475569',
                                            fontSize: 13.5,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            boxShadow: isSelected ? '0 4px 12px rgba(225, 29, 72, 0.15)' : '0 1px 2px rgba(0,0,0,0.02)',
                                            transition: 'all 0.15s',
                                            whiteSpace: 'nowrap'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.background = '#F8FAFC';
                                                e.currentTarget.style.color = '#111827';
                                                e.currentTarget.style.borderColor = '#CBD5E1';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.background = '#FFFFFF';
                                                e.currentTarget.style.color = '#475569';
                                                e.currentTarget.style.borderColor = '#E2E8F0';
                                            }
                                        }}
                                    >
                                        <BookOpen size={15} />
                                        {c.title}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Main Content Layout Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>

                    {/* Players Listing Section */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Sparkles size={18} className="text-rose-500" /> Co-Learners
                            </h2>

                            {/* Search bar */}
                            <div style={{ position: 'relative', width: '100%', maxWidth: 300 }}>
                                <Search size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input
                                    type="text"
                                    placeholder="Search student by name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 16px 10px 40px',
                                        borderRadius: 12,
                                        background: '#FFFFFF',
                                        border: '1px solid #E2E8F0',
                                        outline: 'none',
                                        fontSize: 13.5,
                                        color: '#1E293B',
                                        transition: 'all 0.15s',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = '#E11D48';
                                        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(225, 29, 72, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = '#E2E8F0';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 260, gap: 16 }}>
                                <Loader className="animate-spin text-rose-500" size={32} />
                                <span style={{ color: '#64748B', fontSize: 14, fontWeight: 500 }}>Searching for classmates online...</span>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                                {/* 1. Real Online Players Section */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                        <span style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            backgroundColor: '#10B981',
                                            boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
                                            display: 'inline-block'
                                        }} />
                                        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                                            Online Classmates ({filteredOnline.length})
                                        </h3>
                                    </div>

                                    {filteredOnline.length === 0 ? (
                                        <div style={{
                                            backgroundColor: '#FFFFFF',
                                            border: '1px dashed #E2E8F0',
                                            borderRadius: 16,
                                            padding: '32px 20px',
                                            textAlign: 'center',
                                            color: '#64748B',
                                            fontSize: 14
                                        }}>
                                            {courses.length === 0
                                                ? 'Hãy tham gia khóa học để tìm người pvp'
                                                : 'No active classmates online right now. Invite your classmates to join the arena!'}
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
                                            {filteredOnline.map((player) => (
                                                <div
                                                    key={player.userId}
                                                    style={{
                                                        backgroundColor: '#FFFFFF',
                                                        border: '1px solid #E2E8F0',
                                                        borderRadius: 16,
                                                        padding: 24,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        textAlign: 'center',
                                                        transition: 'all 0.2s',
                                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                                        e.currentTarget.style.borderColor = '#10B981';
                                                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(16, 185, 129, 0.08)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.borderColor = '#E2E8F0';
                                                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.03)';
                                                    }}
                                                >
                                                    {player.avatarUrl ? (
                                                        <img
                                                            src={player.avatarUrl}
                                                            alt={player.fullName}
                                                            style={{
                                                                width: 64,
                                                                height: 64,
                                                                borderRadius: '50%',
                                                                objectFit: 'cover',
                                                                marginBottom: 14,
                                                                border: '2px solid #10B981'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            width: 64,
                                                            height: 64,
                                                            borderRadius: '50%',
                                                            backgroundColor: 'rgba(16, 185, 129, 0.05)',
                                                            border: '2px solid rgba(16, 185, 129, 0.2)',
                                                            color: '#10B981',
                                                            fontSize: 22,
                                                            fontWeight: 800,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            marginBottom: 14,
                                                            boxShadow: '0 0 10px rgba(16, 185, 129, 0.05)'
                                                        }}>
                                                            {player.fullName.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}

                                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', margin: '0 0 4px 0' }}>
                                                        {player.fullName}
                                                    </h3>
                                                    <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 18px 0' }}>
                                                        {player.email}
                                                    </p>

                                                    <div style={{ flex: 1 }} />

                                                    <button
                                                        onClick={() => handleChallengeReal(player)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: 8,
                                                            width: '100%',
                                                            padding: '9px 16px',
                                                            borderRadius: 10,
                                                            backgroundColor: '#10B981',
                                                            border: 'none',
                                                            color: 'white',
                                                            fontSize: 13,
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)',
                                                            transition: 'all 0.15s'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#059669';
                                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.25)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#10B981';
                                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.15)';
                                                        }}
                                                    >
                                                        <Swords size={14} style={{ transform: 'rotate(-45deg)' }} />
                                                        Challenge
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>
                        )}
                    </div>

                    {/* Sidebar section: User Stats */}
                    <div style={{ position: 'sticky', top: 90 }}>
                        <div style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: 20,
                            padding: 24,
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
                        }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', margin: '0 0 20px 0', borderBottom: '1px solid #F1F5F9', paddingBottom: 14, letterSpacing: '0.1px' }}>
                                My Battle Profile
                            </h3>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                                {currentUser?.avatarUrl ? (
                                    <img
                                        src={currentUser.avatarUrl}
                                        alt={currentUser.fullName}
                                        style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1px solid #E2E8F0' }}
                                    />
                                ) : (
                                    <div style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: '50%',
                                        backgroundColor: 'rgba(59, 82, 246, 0.05)',
                                        border: '2px solid rgba(59, 82, 246, 0.15)',
                                        color: '#3B82F6',
                                        fontSize: 16,
                                        fontWeight: 800,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 0 10px rgba(59, 82, 246, 0.05)'
                                    }}>
                                        {currentUser?.fullName?.charAt(0).toUpperCase() || 'L'}
                                    </div>
                                )}
                                <div style={{ overflow: 'hidden' }}>
                                    <p style={{ fontSize: 14.5, fontWeight: 700, color: '#1E293B', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.fullName}</p>
                                    <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0 0', wordBreak: 'break-all' }}>{currentUser?.email}</p>
                                </div>
                            </div>

                            <div style={{
                                backgroundColor: '#F8FAFC',
                                borderRadius: 12,
                                padding: 16,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 12,
                                border: '1px solid #E2E8F0'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 13, color: '#64748B' }}>Status</span>
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 5,
                                        fontSize: 10.5,
                                        fontWeight: 700,
                                        color: '#10B981',
                                        backgroundColor: 'rgba(16, 185, 129, 0.08)',
                                        border: '1px solid rgba(16, 185, 129, 0.15)',
                                        padding: '3px 8px',
                                        borderRadius: 20,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        <UserCheck size={11} />
                                        Ready
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 13, color: '#64748B' }}>Current Streak</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        🔥 0 days
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
