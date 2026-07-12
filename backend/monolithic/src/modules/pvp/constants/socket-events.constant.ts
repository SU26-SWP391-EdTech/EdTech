export const SocketEvents = {
    // Challenge (Client -> Server)

  
    REQUEST_CHALLENGE: 'requestChallenge',
  
    APPROVE_CHALLENGE: 'approveChallenge',
  
    REJECT_CHALLENGE: 'rejectChallenge',
  
    CANCEL_CHALLENGE: 'cancelChallenge',
  
    // Challenge (Server -> Client)
  
    CHALLENGE_RECEIVED: 'challengeReceived',
  
    CHALLENGE_PENDING: 'challengePending',
  
    CHALLENGE_APPROVED: 'challengeApproved',
  
    CHALLENGE_REJECTED: 'challengeRejected',
  
    CHALLENGE_CANCELLED: 'challengeCancelled',
  
    CHALLENGE_EXPIRED: 'challengeExpired',
  
    // Battle (Server -> Client)
  
    BATTLE_STARTED: 'battleStarted',
  
    QUESTION: 'question',
  
    NEXT_QUESTION: 'nextQuestion',
  
    SCORE_UPDATED: 'scoreUpdated',
  
    GAME_OVER: 'gameOver',
  
    MATCH_RESULT: 'matchResult',
  
    OPPONENT_LEFT: 'opponentLeft',

    // Battle (Client -> Server)
  
    SUBMIT_ANSWER: 'submitAnswer',
  
    LEAVE_BATTLE: 'leaveBattle',
  
    // Common
    // Dùng để giúp frontend xử lý lỗi realtime một cách thống nhất.
    ERROR: 'error',
  } as const;