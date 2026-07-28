import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Swords, X, Play } from 'lucide-react';
import { pvpSocket } from '../services/pvp/pvp-socket';
import { useAuthStore } from '../stores/auth/auth.stores';
import { getLearnerProfile } from '../services/learner/learner.services';

interface PvpContextProps {
    sendChallenge: (receiverId: number, assessmentId: number) => void;
    approveChallenge: (challengeId: number) => void;
    rejectChallenge: (challengeId: number) => void;
    cancelChallenge: (challengeId: number) => void;
    isConnected: boolean;
}

const PvpContext = createContext<PvpContextProps | undefined>(undefined);

export function PvpProvider({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);
    const [isConnected, setIsConnected] = useState(false);

    // States for incoming challenge pop-up
    const [incomingChallenge, setIncomingChallenge] = useState<any>(null);
    const [challengerProfile, setChallengerProfile] = useState<any>(null);
    const [countdown, setCountdown] = useState(30);
    
    // States for outgoing challenge
    const [outgoingChallenge, setOutgoingChallenge] = useState<any>(null);
    const [lastChallengedUserId, setLastChallengedUserId] = useState<number | null>(null);

    // Socket Connection Lifecycle
    useEffect(() => {
        if (!token || user?.roleName?.toLowerCase() !== 'learner') {
            pvpSocket.disconnect();
            setIsConnected(false);
            return;
        }

        let socket: any;
        try {
            socket = pvpSocket.connect();
            setIsConnected(true);
        } catch (err) {
            console.error('Socket connection failed:', err);
            setIsConnected(false);
            return;
        }

        const handleChallengeReceived = async (challenge: any) => {
            console.log('SocketEvent challengeReceived:', challenge);
            setIncomingChallenge(challenge);
            setCountdown(30);
            try {
                const profile = await getLearnerProfile(challenge.challengerId);
                setChallengerProfile(profile);
            } catch (err) {
                console.error('Failed to get challenger profile:', err);
                setChallengerProfile({ fullName: `User #${challenge.challengerId}` });
            }
        };

        const handleChallengeCancelled = (data: any) => {
            console.log('SocketEvent challengeCancelled:', data);
            toast.error('The challenge request was cancelled by the challenger.');
            setIncomingChallenge(null);
            setChallengerProfile(null);
        };

        const handleChallengePending = (challenge: any) => {
            console.log('SocketEvent challengePending:', challenge);
            setOutgoingChallenge(challenge);
            toast.dismiss(); // Dismiss the loading toast from handleSendChallenge
        };

        const handleChallengeExpired = (data: any) => {
            console.log('SocketEvent challengeExpired:', data);
            toast.error('The challenge has expired.');
            setIncomingChallenge(null);
            setChallengerProfile(null);
            setOutgoingChallenge(null);
        };

        const handleChallengeRejected = (data: any) => {
            console.log('SocketEvent challengeRejected:', data);
            toast.error('Your challenge was rejected.');
            setOutgoingChallenge(null);
        };

        const handleBattleStarted = (battleInfo: any) => {
            console.log('SocketEvent battleStarted:', battleInfo);
            const opponentId = user?.userId === battleInfo.challengerId
                ? battleInfo.receiverId
                : battleInfo.challengerId;

            const challengerId = battleInfo.challengerId;

            setIncomingChallenge(null);
            setChallengerProfile(null);
            setOutgoingChallenge(null);
            toast.success('Battle starting! Get ready!');
            navigate(
                `/learner/pvp/battle?matchId=${battleInfo.matchId}&roomId=${battleInfo.roomId}&assessmentId=${battleInfo.assessmentId}&opponentId=${opponentId}&challengerId=${challengerId}`
            );
        };

        const handleSocketError = (err: any) => {
            console.error('PvP Socket Error event:', err);
            toast.error(err.message || 'An error occurred in PvP WebSocket.');
        };

        // Bind events
        pvpSocket.on('challengeReceived', handleChallengeReceived);
        pvpSocket.on('challengeCancelled', handleChallengeCancelled);
        pvpSocket.on('challengePending', handleChallengePending);
        pvpSocket.on('challengeExpired', handleChallengeExpired);
        pvpSocket.on('challengeRejected', handleChallengeRejected);
        pvpSocket.on('battleStarted', handleBattleStarted);
        pvpSocket.on('error', handleSocketError);

        return () => {
            pvpSocket.off('challengeReceived', handleChallengeReceived);
            pvpSocket.off('challengeCancelled', handleChallengeCancelled);
            pvpSocket.off('challengePending', handleChallengePending);
            pvpSocket.off('challengeExpired', handleChallengeExpired);
            pvpSocket.off('challengeRejected', handleChallengeRejected);
            pvpSocket.off('battleStarted', handleBattleStarted);
            pvpSocket.off('error', handleSocketError);
        };
    }, [token, user, navigate]);

    // Countdown Timer for incoming challenge popup
    useEffect(() => {
        if (!incomingChallenge) return;

        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setIncomingChallenge(null);
                    setChallengerProfile(null);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [incomingChallenge]);

    const sendChallenge = (receiverId: number, assessmentId: number) => {
        console.log(`Sending challenge to receiverId: ${receiverId}, assessmentId: ${assessmentId}`);
        setLastChallengedUserId(receiverId);
        pvpSocket.emit('requestChallenge', { receiverId, assessmentId });
    };

    const approveChallenge = (challengeId: number) => {
        console.log(`Approving challenge: ${challengeId}`);
        pvpSocket.emit('approveChallenge', { challengeId });
        setIncomingChallenge(null);
        setChallengerProfile(null);
    };

    const rejectChallenge = (challengeId: number) => {
        console.log(`Rejecting challenge: ${challengeId}`);
        pvpSocket.emit('rejectChallenge', { challengeId });
        setIncomingChallenge(null);
        setChallengerProfile(null);
    };

    const cancelChallenge = (challengeId: number) => {
        console.log(`Cancelling challenge: ${challengeId}`);
        pvpSocket.emit('cancelChallenge', { challengeId });
        setOutgoingChallenge(null);
    };

    return (
        <PvpContext.Provider value={{ sendChallenge, approveChallenge, rejectChallenge, cancelChallenge, isConnected }}>
            {children}

            {/* Global Challenge Invitation Popup Overlay */}
            {incomingChallenge && (
                <div style={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 20px 45px rgba(0, 0, 0, 0.12)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 16,
                    padding: 20,
                    width: 360,
                    zIndex: 9999,
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #EF4444, #B91C1C)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Swords size={18} color="#fff" />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1E293B' }}>
                                    Battle Challenge!
                                </h4>
                                <p style={{ margin: 0, fontSize: 11, color: '#64748B' }}>
                                    Real-time PvP Quiz Match
                                </p>
                            </div>
                        </div>
                        <div style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#EF4444',
                            background: '#FEE2E2',
                            padding: '4px 8px',
                            borderRadius: 12
                        }}>
                            {countdown}s
                        </div>
                    </div>

                    <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                        <strong style={{ color: '#1E293B' }}>
                            {challengerProfile?.fullName || 'Someone'}
                        </strong> has challenged you to a live battle!
                    </p>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            onClick={() => rejectChallenge(incomingChallenge.challengeId)}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                                padding: '8px 12px',
                                border: '1px solid #E2E8F0',
                                borderRadius: 10,
                                background: '#FFF',
                                color: '#64748B',
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <X size={14} /> Decline
                        </button>
                        <button
                            onClick={() => approveChallenge(incomingChallenge.challengeId)}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                                padding: '8px 12px',
                                border: 'none',
                                borderRadius: 10,
                                background: '#EF4444',
                                color: '#FFF',
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Play size={14} fill="#fff" /> Accept
                        </button>
                    </div>
                </div>
            )}

            {/* Global Outgoing Challenge Popup Overlay */}
            {outgoingChallenge && (
                <div style={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 20px 45px rgba(0, 0, 0, 0.12)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 16,
                    padding: 20,
                    width: 360,
                    zIndex: 9999,
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Swords size={18} color="#fff" />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1E293B' }}>
                                    Waiting for Opponent...
                                </h4>
                                <p style={{ margin: 0, fontSize: 11, color: '#64748B' }}>
                                    Challenge Sent
                                </p>
                            </div>
                        </div>
                        <div style={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            border: '2px solid #3B82F6',
                            borderTopColor: 'transparent',
                            animation: 'spin 1s linear infinite'
                        }} />
                    </div>

                    <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                        Waiting for <strong style={{ color: '#1E293B' }}>Opponent</strong> to accept your challenge.
                    </p>

                    <button
                        onClick={() => cancelChallenge(outgoingChallenge.challengeId)}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            padding: '8px 12px',
                            border: '1px solid #E2E8F0',
                            borderRadius: 10,
                            background: '#FFF',
                            color: '#EF4444',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <X size={14} /> Cancel Request
                    </button>
                    <style>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            )}
        </PvpContext.Provider>
    );
}

export function usePvp() {
    const context = useContext(PvpContext);
    if (!context) {
        return {
            sendChallenge: () => { },
            approveChallenge: () => { },
            rejectChallenge: () => { },
            cancelChallenge: () => { },
            isConnected: false,
        };
    }
    return context;
}
