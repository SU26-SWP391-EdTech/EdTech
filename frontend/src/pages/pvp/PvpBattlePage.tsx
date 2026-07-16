import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Swords, Trophy, AlertCircle, ArrowLeft, Loader, CheckCircle2, XCircle, Clock, ShieldAlert, Award, Star, Zap, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { pvpSocket } from '../../services/pvp/pvp-socket';
import { useAuthStore } from '../../stores/auth/auth.stores';
import api from '../../lib/axios';
import { getLearnerProfile } from '../../services/learner/learner.services';

const MOCK_QUESTIONS = [
    {
        questionId: 1,
        type: 'MULTIPLE_CHOICE',
        content: 'Which of the following is NOT a fundamental concept of Object-Oriented Programming?',
        options: [
            { optionId: 101, position: 1, content: 'Inheritance' },
            { optionId: 102, position: 2, content: 'Compilation' },
            { optionId: 103, position: 3, content: 'Encapsulation' },
            { optionId: 104, position: 4, content: 'Polymorphism' }
        ],
        correctOptionId: 102
    },
    {
        questionId: 2,
        type: 'MULTIPLE_CHOICE',
        content: 'In SQL, what statement is used to remove all records from a table without logging the individual row deletions?',
        options: [
            { optionId: 201, position: 1, content: 'DELETE' },
            { optionId: 202, position: 2, content: 'DROP' },
            { optionId: 203, position: 3, content: 'TRUNCATE' },
            { optionId: 204, position: 4, content: 'REMOVE' }
        ],
        correctOptionId: 203
    },
    {
        questionId: 3,
        type: 'MULTIPLE_CHOICE',
        content: 'Which data structure operates on a Last-In, First-Out (LIFO) principle?',
        options: [
            { optionId: 301, position: 1, content: 'Queue' },
            { optionId: 302, position: 2, content: 'Stack' },
            { optionId: 303, position: 3, content: 'Heap' },
            { optionId: 304, position: 4, content: 'Tree' }
        ],
        correctOptionId: 302
    },
    {
        questionId: 4,
        type: 'MULTIPLE_CHOICE',
        content: 'What is the time complexity of searching in a balanced Binary Search Tree (BST) in the worst case?',
        options: [
            { optionId: 401, position: 1, content: 'O(1)' },
            { optionId: 402, position: 2, content: 'O(n)' },
            { optionId: 403, position: 3, content: 'O(log n)' },
            { optionId: 404, position: 4, content: 'O(n log n)' }
        ],
        correctOptionId: 403
    },
    {
        questionId: 5,
        type: 'MULTIPLE_CHOICE',
        content: 'Which protocol is responsible for establishing a secure, encrypted link between a web server and a browser?',
        options: [
            { optionId: 501, position: 1, content: 'HTTP' },
            { optionId: 502, position: 2, content: 'FTP' },
            { optionId: 503, position: 3, content: 'SMTP' },
            { optionId: 504, position: 4, content: 'HTTPS' }
        ],
        correctOptionId: 504
    }
];

export function PvpBattlePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const matchId = Number(searchParams.get('matchId'));
    const roomId = searchParams.get('roomId');
    const opponentId = Number(searchParams.get('opponentId'));
    const challengerId = Number(searchParams.get('challengerId'));
    const isMock = searchParams.get('mock') === 'true';

    const currentUser = useAuthStore((state) => state.user);

    // Battle and Player states
    const [battleQuestions, setBattleQuestions] = useState<any[]>(MOCK_QUESTIONS);
    const [opponentProfile, setOpponentProfile] = useState<any>(null);
    const [activeQuestion, setActiveQuestion] = useState<any>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(5);
    const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [questionCountdown, setQuestionCountdown] = useState(15);

    // Live score state
    const [scores, setScores] = useState({ player1Score: 0, player2Score: 0 });

    // Mock mode score tracking
    const [mockCorrectCount, setMockCorrectCount] = useState(0);

    // Match status: 'loading' | 'playing' | 'waiting_next' | 'gameover' | 'opponent_left' | 'error'
    const [status, setStatus] = useState<'loading' | 'playing' | 'waiting_next' | 'gameover' | 'opponent_left' | 'error'>('loading');
    const [matchResult, setMatchResult] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [pointsAwarded, setPointsAwarded] = useState(false);

    // Award PvP points when the player wins a match (or opponent forfeits)
    useEffect(() => {
        if (!currentUser?.userId || !matchId || pointsAwarded) return;
        
        let won = false;
        if (status === 'opponent_left') {
            won = true;
        } else if (status === 'gameover' && matchResult) {
            won = matchResult.winner === currentUser.userId;
        }

        if (won) {
            const currentSaved = localStorage.getItem(`leaderboard_pvp_points_user_${currentUser.userId}`);
            const newPvpPoints = (currentSaved ? Number(currentSaved) : 0) + 5;
            localStorage.setItem(`leaderboard_pvp_points_user_${currentUser.userId}`, String(newPvpPoints));
            setPointsAwarded(true);
        }
    }, [status, matchResult, currentUser?.userId, matchId, pointsAwarded]);

    // Fetch Opponent Profile on mount
    useEffect(() => {
        if (!matchId || !opponentId) {
            setStatus('error');
            setErrorMsg('Invalid match or opponent configuration.');
            return;
        }

        async function fetchOpponentDetails() {
            try {
                const profile = await getLearnerProfile(opponentId);
                setOpponentProfile(profile);
                setScores({
                    player1Score: 0,
                    player2Score: 0
                });
                
                if (isMock) {
                    const assId = Number(searchParams.get('assessmentId'));
                    let loadedQuestions = [...MOCK_QUESTIONS];
                    if (assId) {
                        try {
                            const res = await api.get(`/assessment/${assId}`);
                            const dbQuestions = res.data?.questions || [];
                            if (dbQuestions.length >= 5) {
                                loadedQuestions = dbQuestions.map((q: any) => {
                                    const correctOpt = q.options?.find((o: any) => o.isCorrect);
                                    return {
                                        questionId: q.questionId,
                                        type: q.type || 'MULTIPLE_CHOICE',
                                        content: q.content,
                                        options: (q.options || []).map((o: any, idx: number) => ({
                                            optionId: o.optionId,
                                            position: idx + 1,
                                            content: o.content
                                        })),
                                        correctOptionId: correctOpt ? correctOpt.optionId : 0
                                    };
                                });
                            }
                        } catch (err) {
                            console.warn('Failed to load real assessment questions for practice, using mock:', err);
                        }
                    }
                    // Select 5 random questions
                    const shuffled = loadedQuestions.sort(() => 0.5 - Math.random()).slice(0, 5);
                    setBattleQuestions(shuffled);
                    setActiveQuestion(shuffled[0]);
                    setCurrentQuestionIndex(1);
                }
                setStatus('playing');
            } catch (err) {
                console.error('Failed to fetch opponent details:', err);
                // Fallback name
                setOpponentProfile({ fullName: `User #${opponentId}` });
                setScores({
                    player1Score: 0,
                    player2Score: 0
                });
                if (isMock) {
                    const assId = Number(searchParams.get('assessmentId'));
                    let loadedQuestions = [...MOCK_QUESTIONS];
                    if (assId) {
                        try {
                            const res = await api.get(`/assessment/${assId}`);
                            const dbQuestions = res.data?.questions || [];
                            if (dbQuestions.length >= 5) {
                                loadedQuestions = dbQuestions.map((q: any) => {
                                    const correctOpt = q.options?.find((o: any) => o.isCorrect);
                                    return {
                                        questionId: q.questionId,
                                        type: q.type || 'MULTIPLE_CHOICE',
                                        content: q.content,
                                        options: (q.options || []).map((o: any, idx: number) => ({
                                            optionId: o.optionId,
                                            position: idx + 1,
                                            content: o.content
                                        })),
                                        correctOptionId: correctOpt ? correctOpt.optionId : 0
                                    };
                                });
                            }
                        } catch (err) {
                            console.warn('Failed to load real assessment questions for practice, using mock:', err);
                        }
                    }
                    // Select 5 random questions
                    const shuffled = loadedQuestions.sort(() => 0.5 - Math.random()).slice(0, 5);
                    setBattleQuestions(shuffled);
                    setActiveQuestion(shuffled[0]);
                    setCurrentQuestionIndex(1);
                }
                setStatus('playing');
            }
        }

        fetchOpponentDetails();
    }, [matchId, opponentId, isMock]);

    // Socket Event listeners
    useEffect(() => {
        if (isMock) return;
        if (!matchId) return;

        const socket = pvpSocket.getSocket();
        if (!socket) {
            console.error('PvP Socket is not initialized.');
            setStatus('error');
            setErrorMsg('WebSocket connection is not active.');
            return;
        }

        const handleQuestion = (data: any) => {
            console.log('Battle question received:', data);
            setActiveQuestion(data.question);
            setCurrentQuestionIndex(data.questionIndex);
            setQuestionCountdown(15);
            setSelectedOptionId(null);
            setSubmitted(false);
            setStatus('playing');
        };

        const handleNextQuestion = (data: any) => {
            console.log('Battle next question prep:', data);
            setStatus('waiting_next');
        };

        const handleScoreUpdated = (data: any) => {
            console.log('Battle scores updated:', data);
            setScores({
                player1Score: data.player1Score,
                player2Score: data.player2Score
            });
        };

        const handleGameOver = (data: any) => {
            console.log('Battle game over:', data);
            setScores({
                player1Score: data.player1Score,
                player2Score: data.player2Score
            });
        };

        const handleMatchResult = (data: any) => {
            console.log('Battle match results:', data);
            setMatchResult(data);
            setStatus('gameover');
        };

        const handleOpponentLeft = (data: any) => {
            console.log('Battle opponent left:', data);
            setStatus('opponent_left');
            toast.error('Your opponent has left the battle.');
        };

        const handleSocketError = (err: any) => {
            console.error('Socket battle error:', err);
            toast.error(err.message || 'An error occurred during the battle.');
        };

        // Listeners registration
        socket.on('question', handleQuestion);
        socket.on('nextQuestion', handleNextQuestion);
        socket.on('scoreUpdated', handleScoreUpdated);
        socket.on('gameOver', handleGameOver);
        socket.on('matchResult', handleMatchResult);
        socket.on('opponentLeft', handleOpponentLeft);
        socket.on('error', handleSocketError);

        return () => {
            socket.off('question', handleQuestion);
            socket.off('nextQuestion', handleNextQuestion);
            socket.off('scoreUpdated', handleScoreUpdated);
            socket.off('gameOver', handleGameOver);
            socket.off('matchResult', handleMatchResult);
            socket.off('opponentLeft', handleOpponentLeft);
            socket.off('error', handleSocketError);
        };
    }, [matchId, isMock]);

    // Timer Interval for remaining question time
    useEffect(() => {
        if (status !== 'playing' || !activeQuestion) return;

        const interval = setInterval(() => {
            setQuestionCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    
                    // Time out
                    if (isMock) {
                        setSubmitted(true);
                        toast.error('Time limit reached!');
                        
                        let nextScores = { ...scores };
                        // Opponent answers: 60% chance correct
                        const opponentCorrect = Math.random() < 0.6;
                        if (opponentCorrect) {
                            nextScores.player2Score += 10;
                        }
                        setScores(nextScores);

                        setTimeout(() => {
                            if (currentQuestionIndex < 5) {
                                setStatus('waiting_next');
                                setTimeout(() => {
                                    const nextIdx = currentQuestionIndex;
                                    setCurrentQuestionIndex(nextIdx + 1);
                                    setActiveQuestion(battleQuestions[nextIdx]);
                                    setSelectedOptionId(null);
                                    setSubmitted(false);
                                    setQuestionCountdown(15);
                                    setStatus('playing');
                                }, 1000);
                            } else {
                                const finalResult = {
                                    winner: nextScores.player1Score > nextScores.player2Score ? currentUser?.userId : (nextScores.player1Score < nextScores.player2Score ? opponentId : null),
                                    totalQuestions: 5,
                                    correctAnswers: {
                                        player1: mockCorrectCount,
                                        player2: Math.round(nextScores.player2Score / 10)
                                    },
                                    accuracy: {
                                        player1: mockCorrectCount / 5,
                                        player2: Math.round(nextScores.player2Score / 10) / 5
                                    },
                                    battleDuration: 48
                                };
                                setMatchResult(finalResult);
                                setStatus('gameover');
                            }
                        }, 1500);
                    } else {
                        setSubmitted(true);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [status, activeQuestion, currentQuestionIndex, scores, mockCorrectCount, isMock, currentUser?.userId, opponentId]);

    const handleOptionSelect = (optionId: number) => {
        if (submitted || status !== 'playing') return;
        setSelectedOptionId(optionId);
    };

    const handleSubmitAnswer = () => {
        if (selectedOptionId === null || submitted || !activeQuestion) return;

        if (isMock) {
            setSubmitted(true);
            toast.success('Answer submitted! Waiting for opponent...');

            // Check correctness of answer
            const isCorrect = selectedOptionId === activeQuestion.correctOptionId;
            let nextScores = { ...scores };
            let nextMockCorrectCount = mockCorrectCount;
            if (isCorrect) {
                nextMockCorrectCount += 1;
                setMockCorrectCount(nextMockCorrectCount);
                nextScores.player1Score += 10;
            }

            // Opponent answers: 60% chance correct
            const opponentCorrect = Math.random() < 0.6;
            if (opponentCorrect) {
                nextScores.player2Score += 10;
            }
            setScores(nextScores);

            // Wait 1.5s then advance or finish
            setTimeout(() => {
                if (currentQuestionIndex < 5) {
                    setStatus('waiting_next');
                    setTimeout(() => {
                        const nextIdx = currentQuestionIndex;
                        setCurrentQuestionIndex(nextIdx + 1);
                        setActiveQuestion(battleQuestions[nextIdx]);
                        setSelectedOptionId(null);
                        setSubmitted(false);
                        setQuestionCountdown(15);
                        setStatus('playing');
                    }, 1000);
                } else {
                    // Match Over
                    const finalResult = {
                        winner: nextScores.player1Score > nextScores.player2Score ? currentUser?.userId : (nextScores.player1Score < nextScores.player2Score ? opponentId : null),
                        totalQuestions: 5,
                        correctAnswers: {
                            player1: nextMockCorrectCount,
                            player2: Math.round(nextScores.player2Score / 10)
                        },
                        accuracy: {
                            player1: nextMockCorrectCount / 5,
                            player2: Math.round(nextScores.player2Score / 10) / 5
                        },
                        battleDuration: 42
                    };
                    setMatchResult(finalResult);
                    setStatus('gameover');
                }
            }, 1500);

            return;
        }

        console.log(`Submitting answer for question ${activeQuestion.questionId}, option: ${selectedOptionId}`);
        pvpSocket.emit('submitAnswer', {
            matchId,
            questionId: activeQuestion.questionId,
            optionId: selectedOptionId
        });

        setSubmitted(true);
        toast.success('Answer submitted! Waiting for opponent...');
    };

    const handleLeaveMatch = () => {
        if (window.confirm('Are you sure you want to leave? You will forfeit the match!')) {
            if (!isMock) {
                pvpSocket.emit('leaveBattle', { matchId });
            }
            navigate('/learner/leaderboard');
        }
    };

    // Calculate details
    const isPlayer1 = currentUser?.userId === challengerId;
    const myProfile = currentUser;
    const myScore = isPlayer1 ? scores.player1Score : scores.player2Score;
    const opponentScore = isPlayer1 ? scores.player2Score : scores.player1Score;

    // Loading State
    if (status === 'loading') {
        return (
            <div style={{
                minHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                color: '#1E293B',
                padding: 24,
                fontFamily: "'Inter', 'SF Pro Display', sans-serif"
            }}>
                <div style={{ position: 'relative', marginBottom: 24 }}>
                    <div style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        border: '3px solid #E2E8F0',
                        borderTopColor: '#E11D48',
                        borderBottomColor: '#3B82F6',
                        animation: 'spin 1.2s linear infinite'
                    }} />
                    <Swords size={24} className="text-rose-500" style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }} />
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '0.2px', marginBottom: 8, color: '#1E293B' }}>
                    Entering Arena
                </h3>
                <p style={{ fontSize: 13.5, color: '#64748B', fontWeight: 400 }}>Synchronizing combatants and loading match criteria...</p>
            </div>
        );
    }

    // Error State
    if (status === 'error') {
        return (
            <div style={{
                minHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                color: '#1E293B',
                padding: 24,
                textAlign: 'center',
                fontFamily: "'Inter', 'SF Pro Display', sans-serif"
            }}>
                <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.05)',
                    border: '2px solid #EF4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)'
                }}>
                    <AlertCircle size={36} className="text-red-500" />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#EF4444', marginBottom: 10 }}>Arena Error</h2>
                <p style={{ fontSize: 14.5, color: '#64748B', maxWidth: 420, margin: '0 auto 24px auto', lineHeight: 1.6 }}>
                    {errorMsg || 'Failed to establish stable link with battle arena.'}
                </p>
                <button
                    onClick={() => navigate('/learner/leaderboard')}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '11px 24px',
                        borderRadius: 10,
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        color: '#475569',
                        fontSize: 13.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#F8FAFC';
                        e.currentTarget.style.borderColor = '#CBD5E1';
                        e.currentTarget.style.color = '#111827';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.color = '#475569';
                    }}
                >
                    <ArrowLeft size={15} /> Return to Dashboard
                </button>
            </div>
        );
    }

    // Opponent Forfeited State
    if (status === 'opponent_left') {
        return (
            <div style={{
                minHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                color: '#1E293B',
                padding: 24,
                textAlign: 'center',
                fontFamily: "'Inter', 'SF Pro Display', sans-serif"
            }}>
                <div style={{
                    position: 'relative',
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 24,
                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)'
                }}>
                    <Trophy size={48} color="#fff" />
                    <div style={{
                        position: 'absolute',
                        bottom: -3,
                        right: -3,
                        background: '#F59E0B',
                        borderRadius: '50%',
                        padding: 5,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                    }}>
                        <Star size={14} fill="#fff" color="#fff" />
                    </div>
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#059669', marginBottom: 10 }}>
                    Victory by Forfeit!
                </h2>
                <p style={{ fontSize: 15, color: '#64748B', maxWidth: 450, margin: '0 auto 28px auto', lineHeight: 1.6 }}>
                    Your opponent fled the combat zone. You are declared the victor and receive PvP bonus points!
                </p>
                <button
                    onClick={() => navigate('/learner/leaderboard')}
                    style={{
                        padding: '12px 28px',
                        border: 'none',
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #10B981, #059669)',
                        color: '#fff',
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
                        transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)';
                    }}
                >
                    Continue to Dashboard
                </button>
            </div>
        );
    }

    // GameOver Result State
    if (status === 'gameover' && matchResult) {
        const isWinner = matchResult.winner === currentUser?.userId;
        const isDraw = matchResult.winner === null;

        return (
            <div style={{
                minHeight: '85vh',
                background: 'transparent',
                color: '#1E293B',
                padding: '40px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Inter', 'SF Pro Display', sans-serif"
            }}>
                <div style={{
                    maxWidth: 500,
                    width: '100%',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 24,
                    padding: '40px 32px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                    textAlign: 'center'
                }}>
                    {isDraw ? (
                        <div style={{
                            display: 'inline-flex',
                            padding: '4px 14px',
                            background: 'rgba(100, 116, 139, 0.06)',
                            border: '1px solid rgba(100, 116, 139, 0.15)',
                            color: '#64748B',
                            borderRadius: 20,
                            fontWeight: 700,
                            fontSize: 11,
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            marginBottom: 20
                        }}>
                            DRAW MATCH
                        </div>
                    ) : isWinner ? (
                        <div style={{
                            display: 'inline-flex',
                            padding: '4px 14px',
                            background: 'rgba(16, 185, 129, 0.06)',
                            border: '1px solid rgba(16, 185, 129, 0.15)',
                            color: '#10B981',
                            borderRadius: 20,
                            fontWeight: 700,
                            fontSize: 11,
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            marginBottom: 20,
                            gap: 5,
                            alignItems: 'center'
                        }}>
                            <Trophy size={12} /> VICTORY (+5 PvP Points)
                        </div>
                    ) : (
                        <div style={{
                            display: 'inline-flex',
                            padding: '4px 14px',
                            background: 'rgba(225, 29, 72, 0.06)',
                            border: '1px solid rgba(225, 29, 72, 0.15)',
                            color: '#E11D48',
                            borderRadius: 20,
                            fontWeight: 700,
                            fontSize: 11,
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            marginBottom: 20
                        }}>
                            DEFEATED
                        </div>
                    )}

                    <h1 style={{
                        fontSize: 30,
                        fontWeight: 800,
                        margin: '0 0 28px 0',
                        color: isDraw ? '#475569' : isWinner ? '#D97706' : '#E11D48',
                        letterSpacing: '-0.5px'
                    }}>
                        {isDraw ? 'Tie Game!' : isWinner ? 'Winner!' : 'Defeat!'}
                    </h1>

                    {/* Arena Score block */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 50px 1fr',
                        alignItems: 'center',
                        background: '#F8FAFC',
                        borderRadius: 20,
                        padding: '24px 16px',
                        border: '1px solid #E2E8F0',
                        marginBottom: 28
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: 44,
                                height: 44,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #F43F5E, #BE123C)',
                                margin: '0 auto 8px auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: 16,
                                color: '#fff',
                                boxShadow: '0 4px 8px rgba(244, 63, 94, 0.2)'
                            }}>
                                {myProfile?.fullName?.charAt(0) || 'Y'}
                            </div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {myProfile?.fullName || 'You'}
                            </p>
                            <p style={{ fontSize: 11, color: '#64748B', margin: '0 0 6px 0' }}>
                                Correct: {isPlayer1 ? matchResult.correctAnswers?.player1 : matchResult.correctAnswers?.player2} / {matchResult.totalQuestions}
                            </p>
                            <h2 style={{ fontSize: 28, fontWeight: 800, color: isWinner ? '#10B981' : '#475569', margin: 0 }}>
                                {myScore}
                            </h2>
                        </div>

                        <div style={{ fontSize: 12, fontWeight: 800, color: '#94A3B8', letterSpacing: '1px' }}>VS</div>

                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: 44,
                                height: 44,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                                margin: '0 auto 8px auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: 16,
                                color: '#fff',
                                boxShadow: '0 4px 8px rgba(59, 82, 246, 0.2)'
                            }}>
                                {opponentProfile?.fullName?.charAt(0) || 'O'}
                            </div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {opponentProfile?.fullName || 'Opponent'}
                            </p>
                            <p style={{ fontSize: 11, color: '#64748B', margin: '0 0 6px 0' }}>
                                Correct: {isPlayer1 ? matchResult.correctAnswers?.player2 : matchResult.correctAnswers?.player1} / {matchResult.totalQuestions}
                            </p>
                            <h2 style={{ fontSize: 28, fontWeight: 800, color: !isWinner && !isDraw ? '#E11D48' : '#475569', margin: 0 }}>
                                {opponentScore}
                            </h2>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
                        <div style={{ padding: 14, border: '1px solid #E2E8F0', background: '#F8FAFC', borderRadius: 16, textAlign: 'left' }}>
                            <p style={{ margin: 0, fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Accuracy</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: 18, fontWeight: 800, color: '#1E293B' }}>
                                {Math.round((isPlayer1 ? matchResult.accuracy?.player1 : matchResult.accuracy?.player2) * 100)}%
                            </p>
                        </div>
                        <div style={{ padding: 14, border: '1px solid #E2E8F0', background: '#F8FAFC', borderRadius: 16, textAlign: 'left' }}>
                            <p style={{ margin: 0, fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Battle Duration</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: 18, fontWeight: 800, color: '#1E293B' }}>
                                {matchResult.battleDuration}s
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/learner/leaderboard')}
                        style={{
                            width: '100%',
                            padding: '14px',
                            border: 'none',
                            borderRadius: 12,
                            background: isWinner ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                            color: '#fff',
                            fontSize: 15,
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: isWinner ? '0 4px 12px rgba(16, 185, 129, 0.15)' : '0 4px 12px rgba(59, 82, 246, 0.15)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.filter = 'brightness(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.filter = 'none';
                        }}
                    >
                        Back to Leaderboard
                    </button>
                </div>
            </div>
        );
    }

    // Active Battle Arena
    return (
        <div style={{
            background: 'transparent',
            color: '#1E293B',
            padding: '24px 16px',
            fontFamily: "'Inter', 'SF Pro Display', sans-serif"
        }}>
            <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* Scoreboard / Opponents Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    alignItems: 'center',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 20,
                    padding: '20px 24px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)'
                }}>
                    {/* Player 1 (You) info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #F43F5E, #BE123C)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 16,
                            boxShadow: '0 2px 8px rgba(244, 63, 94, 0.2)',
                            border: '2px solid #F43F5E'
                        }}>
                            {myProfile?.fullName?.charAt(0) || 'Y'}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {myProfile?.fullName || 'You'}
                            </p>
                            <span style={{ fontSize: 12, color: '#64748B' }}>
                                Score: <strong style={{ color: '#E11D48', fontSize: 14, fontWeight: 700 }}>{myScore}</strong>
                            </span>
                        </div>
                    </div>

                    {/* VS Badge with details */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '0 16px' }}>
                        <div style={{
                            padding: '4px 12px',
                            background: 'rgba(225, 29, 72, 0.06)',
                            border: '1px solid rgba(225, 29, 72, 0.15)',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 800,
                            color: '#E11D48',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5
                        }}>
                            <Swords size={12} style={{ transform: 'rotate(-45deg)' }} /> BATTLE
                        </div>
                        <span style={{ fontSize: 10.5, color: '#64748B', fontWeight: 600, letterSpacing: '0.5px' }}>
                            ROUND {currentQuestionIndex || 1} OF 5
                        </span>
                    </div>

                    {/* Player 2 (Opponent) info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'flex-end', textAlign: 'right' }}>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {opponentProfile?.fullName || 'Opponent'}
                            </p>
                            <span style={{ fontSize: 12, color: '#64748B' }}>
                                Score: <strong style={{ color: '#3B82F6', fontSize: 14, fontWeight: 700 }}>{opponentScore}</strong>
                            </span>
                        </div>
                        <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 16,
                            boxShadow: '0 2px 8px rgba(59, 82, 246, 0.2)',
                            border: '2px solid #3B82F6'
                        }}>
                            {opponentProfile?.fullName?.charAt(0) || 'O'}
                        </div>
                    </div>
                </div>

                {/* Progress bar countdown */}
                {activeQuestion && status === 'playing' && (
                    <div style={{
                        width: '100%',
                        background: '#E2E8F0',
                        height: 6,
                        borderRadius: 3,
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${(questionCountdown / 15) * 100}%`,
                            height: '100%',
                            borderRadius: 3,
                            background: questionCountdown > 7 
                                ? 'linear-gradient(90deg, #10B981, #34D399)' 
                                : questionCountdown > 3 
                                    ? 'linear-gradient(90deg, #F59E0B, #FBBF24)' 
                                    : 'linear-gradient(90deg, #EF4444, #F87171)',
                            transition: 'width 1s linear'
                        }} />
                    </div>
                )}

                {/* Main Arena Cards */}
                {status === 'waiting_next' ? (
                    <div style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: 20,
                        padding: '48px 24px',
                        textAlign: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 16
                    }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                border: '3px solid #E2E8F0',
                                borderTopColor: '#3B82F6',
                                animation: 'spin 1s linear infinite'
                            }} />
                            <Zap size={18} className="text-blue-500" style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)'
                            }} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1E293B', margin: '0 0 6px 0' }}>
                                Preparing Next Round...
                            </h3>
                            <p style={{ fontSize: 13.5, color: '#64748B', margin: 0, maxWidth: 350, lineHeight: 1.5 }}>
                                Hold on! The server is loading the next question. Get ready!
                            </p>
                        </div>
                    </div>
                ) : activeQuestion ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        
                        {/* Question Panel */}
                        <div style={{
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: 20,
                            padding: 32,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Decorative background grid */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'radial-gradient(circle at 10% 20%, rgba(244, 63, 94, 0.02) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(59, 82, 246, 0.02) 0%, transparent 40%)',
                                pointerEvents: 'none'
                            }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, position: 'relative', zIndex: 1 }}>
                                <span style={{
                                    fontSize: 10.5,
                                    fontWeight: 700,
                                    color: '#E11D48',
                                    background: 'rgba(225, 29, 72, 0.06)',
                                    border: '1px solid rgba(225, 29, 72, 0.15)',
                                    padding: '3px 8px',
                                    borderRadius: 6,
                                    letterSpacing: '0.5px',
                                    textTransform: 'uppercase'
                                }}>
                                    {activeQuestion.type?.replace(/_/g, ' ') || 'Multiple Choice'}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: questionCountdown > 5 ? '#10B981' : '#EF4444' }}>
                                    <Clock size={13} />
                                    <span>Time Left: {questionCountdown}s</span>
                                </div>
                            </div>
                            <h2 style={{
                                fontSize: 18,
                                fontWeight: 700,
                                color: '#1E293B',
                                lineHeight: 1.5,
                                margin: 0,
                                position: 'relative',
                                zIndex: 1
                            }}>
                                {activeQuestion.content}
                            </h2>
                        </div>

                        {/* Options Stack */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {activeQuestion.options?.map((option: any) => {
                                const isSelected = selectedOptionId === option.optionId;
                                return (
                                    <button
                                        key={option.optionId}
                                        onClick={() => handleOptionSelect(option.optionId)}
                                        disabled={submitted}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 14,
                                            width: '100%',
                                            padding: '16px 20px',
                                            borderRadius: 14,
                                            border: isSelected 
                                                ? '2px solid #E11D48' 
                                                : '1px solid #E2E8F0',
                                            background: isSelected 
                                                ? '#FFF1F3' 
                                                : '#FFFFFF',
                                            color: isSelected ? '#E11D48' : '#334155',
                                            fontSize: 15,
                                            fontWeight: 600,
                                            textAlign: 'left',
                                            cursor: submitted ? 'not-allowed' : 'pointer',
                                            boxShadow: isSelected ? '0 2px 8px rgba(225, 29, 72, 0.05)' : 'none',
                                            transition: 'all 0.15s ease',
                                            outline: 'none'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!submitted && !isSelected) {
                                                e.currentTarget.style.background = '#F8FAFC';
                                                e.currentTarget.style.borderColor = '#CBD5E1';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!submitted && !isSelected) {
                                                e.currentTarget.style.background = '#FFFFFF';
                                                e.currentTarget.style.borderColor = '#E2E8F0';
                                            }
                                        }}
                                    >
                                        {/* Option Letter Icon */}
                                        <div style={{
                                            width: 26,
                                            height: 26,
                                            borderRadius: '50%',
                                            border: isSelected 
                                                ? '2px solid #E11D48' 
                                                : '1.5px solid #94A3B8',
                                            background: isSelected ? '#E11D48' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: isSelected ? '#fff' : '#64748B',
                                            fontWeight: 800,
                                            fontSize: 12,
                                            flexShrink: 0
                                        }}>
                                            {String.fromCharCode(65 + option.position - 1)}
                                        </div>
                                        <div style={{ flex: 1, lineHeight: 1.4 }}>{option.content}</div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Control Buttons bar */}
                        <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                            <button
                                onClick={handleLeaveMatch}
                                style={{
                                    padding: '12px 20px',
                                    border: '1px solid #FEE2E2',
                                    borderRadius: 12,
                                    background: '#FEF2F2',
                                    color: '#EF4444',
                                    fontSize: 14.5,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    transition: 'all 0.15s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#FEE2E2';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#FEF2F2';
                                }}
                            >
                                <XCircle size={15} /> Forfeit
                            </button>
                            <button
                                onClick={handleSubmitAnswer}
                                disabled={selectedOptionId === null || submitted}
                                style={{
                                    flex: 1,
                                    padding: '12px 20px',
                                    border: 'none',
                                    borderRadius: 12,
                                    background: selectedOptionId === null || submitted 
                                        ? '#E2E8F0' 
                                        : 'linear-gradient(135deg, #E11D48, #BE123C)',
                                    color: selectedOptionId === null || submitted ? '#94A3B8' : '#fff',
                                    fontSize: 14.5,
                                    fontWeight: 700,
                                    cursor: selectedOptionId === null || submitted ? 'not-allowed' : 'pointer',
                                    boxShadow: selectedOptionId === null || submitted 
                                        ? 'none' 
                                        : '0 4px 12px rgba(225, 29, 72, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6,
                                    transition: 'all 0.15s'
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedOptionId !== null && !submitted) {
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(225, 29, 72, 0.2)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedOptionId !== null && !submitted) {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(225, 29, 72, 0.15)';
                                    }
                                }}
                            >
                                {submitted ? (
                                    <>
                                        <CheckCircle2 size={15} className="text-emerald-600" /> Answer Locked
                                    </>
                                ) : (
                                    'Lock In Answer'
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: 20,
                        padding: '48px 24px',
                        textAlign: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 16
                    }}>
                        <Loader className="animate-spin text-rose-500" size={32} />
                        <div>
                            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1E293B', margin: '0 0 6px 0' }}>
                                Awaiting Start Signal...
                            </h3>
                            <p style={{ fontSize: 13.5, color: '#64748B', margin: 0 }}>
                                Establishing sync. The battle will begin as soon as both combatants are ready.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
