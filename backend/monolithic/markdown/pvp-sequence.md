# PvP Battle Flow

```text
Player A
    │
    │ requestChallenge
    ▼
PvpGateway
    │
    ▼
ChallengeRequestService
    │
    ├── Validate Learner
    ├── Validate Assessment
    ├── Validate Receiver
    ├── Check Duplicate Challenge
    ├── Create ChallengeRequest (PENDING)
    │
    ▼
SocketService
    │
    ├── emit challengeReceived → Player B
    └── emit challengePending → Player A

──────────────────────────────────────────────

Player B
    │
    │ approveChallenge
    ▼
PvpGateway
    │
    ▼
ChallengeRequestService
    │
    ├── Validate Challenge
    ├── Update Status = APPROVED
    │
    ▼
BattleService
    │
    ├── Create PvpMatch
    ├── Create Battle Room
    ├── Join Player A
    ├── Join Player B
    ├── Load Question List
    │
    ▼
SocketService
    │
    ├── emit battleStarted
    └── emit question #1

──────────────────────────────────────────────

Player A
    │
    │ submitAnswer
    ▼
PvpGateway
    │
    ▼
BattleService
    │
    ├── Validate Match
    ├── Validate Player
    ├── Validate Question
    ├── Validate Option
    ├── Save Answer
    ├── Calculate Score
    │
    ▼
SocketService
    │
    └── emit scoreUpdated

──────────────────────────────────────────────

Player B
    │
    │ submitAnswer
    ▼
PvpGateway
    │
    ▼
BattleService
    │
    ├── Validate Match
    ├── Validate Player
    ├── Validate Question
    ├── Validate Option
    ├── Save Answer
    ├── Calculate Score
    │
    ▼
SocketService
    │
    └── emit scoreUpdated

──────────────────────────────────────────────

BattleService
    │
    ├── Both players answered?
    │
    ├── YES
    │      │
    │      ├── Next Question Exists?
    │      │
    │      ├── YES
    │      │      │
    │      │      └── emit nextQuestion
    │      │             │
    │      │             └── emit question
    │      │
    │      └── NO
    │             │
    │             ├── Calculate Winner
    │             ├── Update PvpMatch
    │             ├── Update Scores
    │             ├── Save Winner
    │             │
    │             └── emit gameOver
    │
    └── NO
           │
           └── Wait Opponent

──────────────────────────────────────────────

Player Leave

Player
    │
    │ leaveBattle
    ▼
PvpGateway
    │
    ▼
BattleService
    │
    ├── Update Match
    ├── Opponent Wins
    │
    ▼
SocketService
    │
    ├── emit opponentLeft
    └── emit gameOver

──────────────────────────────────────────────

Reject Challenge

Player B
    │
    │ rejectChallenge
    ▼
PvpGateway
    │
    ▼
ChallengeRequestService
    │
    ├── Update Status = REJECTED
    │
    ▼
SocketService
    │
    └── emit challengeRejected

──────────────────────────────────────────────

Cancel Challenge

Player A
    │
    │ cancelChallenge
    ▼
PvpGateway
    │
    ▼
ChallengeRequestService
    │
    ├── Update Status = CANCELLED
    │
    ▼
SocketService
    │
    └── emit challengeCancelled

──────────────────────────────────────────────

Challenge Timeout

ChallengeRequestService
    │
    ├── 30 seconds
    ├── Status == PENDING
    ├── Update Status = EXPIRED
    │
    ▼
SocketService
    │
    └── emit challengeExpired
```