# PvP WebSocket - Battle Event Implementation Specification

## Objective

Implement all remaining WebSocket battle events for the PvP module.

The Challenge lifecycle has already been completed.

Do NOT modify any existing Challenge implementation unless it is necessary for Battle integration.

Please read all of entities in module pvp to know the relation of these entity

Follow the file and folder logic structure and code logic in these file and folder in @backend/monolithic/src/modules/pvp/ 

---

# Existing Architecture

The project already follows the following architecture:

```
Gateway
    ↓
Service
    ↓
Repository
    ↓
Database
```

Realtime notification architecture

```
Gateway
    ↓
ChallengeService / BattleService
    ↓
SocketService
    ↓
ConnectionManager
    ↓
Socket.IO
```

The following classes already exist.

- PvpGateway
- ChallengeRequestService
- BattleService
- SocketService
- ConnectionManager
- ChallengeRequestRepository
- PvpMatchRepository

Use existing architecture.

Do NOT introduce new architecture.

---

# Existing Socket Events

Challenge events are already implemented.

Only implement the remaining events.

```ts
export const SocketEvents = {

    REQUEST_CHALLENGE,

    APPROVE_CHALLENGE,

    REJECT_CHALLENGE,

    CANCEL_CHALLENGE,

    CHALLENGE_RECEIVED,

    CHALLENGE_PENDING,

    CHALLENGE_APPROVED,

    CHALLENGE_REJECTED,

    CHALLENGE_CANCELLED,

    CHALLENGE_EXPIRED,

    BATTLE_STARTED,

    QUESTION,

    NEXT_QUESTION,

    SCORE_UPDATED,

    GAME_OVER,

    MATCH_RESULT,

    OPPONENT_LEFT,

    SUBMIT_ANSWER,

    LEAVE_BATTLE,

    ERROR
}
```

---

# Scope

Implement ONLY Battle related events.

Do NOT change Challenge logic.

---

# Event 1

## BATTLE_STARTED

Trigger

Server only.

When

Challenge is approved.

Responsibilities

- Create PvP Match
- Create Battle Room
- Load questions
- Join both players into room
- Notify both players

Emit

```
battleStarted
```

Payload

```ts
{
    matchId:number,
    assessmentId:number,
    roomId:string,
    totalQuestions:number
}
```

---

# Event 2

QUESTION

Server only.

Purpose

Send current question.

Payload

```ts
{
    matchId,
    questionIndex,
    question
}
```

Question must NOT contain answer.

Never expose correct option.

---

# Event 3

SUBMIT_ANSWER

Client -> Server

Payload

```ts
{
    matchId:number,
    questionId:number,
    optionId:number
}
```

Responsibilities

BattleService should

- validate match
- validate player
- validate question
- validate option
- check duplicate answer
- calculate score
- persist answer history

After processing

Emit

```
scoreUpdated
```

---

# Event 4

SCORE_UPDATED

Server -> Client

Broadcast to both players.

Payload

```ts
{
    player1Score,
    player2Score
}
```

---

# Event 5

NEXT_QUESTION

Server only.

Trigger

When

- both players answered

OR

- question timeout

Responsibilities

Increment current question.

Emit QUESTION.

If no remaining question

Emit GAME_OVER.

---

# Event 6

GAME_OVER

Server only.

Responsibilities

Finish battle.

Update

PvpMatch

- status
- winner
- scores

Emit

```
gameOver
```

Payload

```ts
{
    matchId,
    winnerId,
    player1Score,
    player2Score
}
```

---

# Event 7

MATCH_RESULT

Server only.

Emit detailed battle summary.

Payload

```ts
{
    winner,
    loser,
    totalQuestions,
    correctAnswers,
    accuracy,
    battleDuration
}
```

---

# Event 8

LEAVE_BATTLE

Client -> Server

Payload

```ts
{
    matchId
}
```

Responsibilities

Determine whether player voluntarily leaves.

If player leaves

Opponent wins immediately.

Update

PvpMatch

Emit

```
opponentLeft
```

then

```
gameOver
```

---

# Event 9

OPPONENT_LEFT

Server only.

Payload

```ts
{
    matchId,
    playerId
}
```

---

# Event 10

ERROR

Server only.

Emit whenever business validation fails.

Payload

```ts
{
    code,
    message
}
```

Examples

MATCH_NOT_FOUND

PLAYER_NOT_IN_MATCH

QUESTION_NOT_FOUND

INVALID_OPTION

DUPLICATE_SUBMISSION

MATCH_FINISHED

QUESTION_TIMEOUT

---

# Room Management

Every accepted challenge creates one room.

Room name

```
match_<matchId>
```

Both players join room.

All battle events should broadcast to room instead of individual sockets.

---

# BattleService Responsibilities

BattleService is responsible for

- create battle
- load questions
- current question
- score calculation
- answer validation
- next question
- finish match
- leave match

Gateway should NEVER contain business logic.

---

# SocketService Responsibilities

SocketService is responsible for

- emitToUser()
- emitToUsers()
- emitToRoom()
- broadcast()

No business logic.

---

# Repository Responsibilities

Repositories only interact with database.

Business logic must stay inside BattleService.

---

# Gateway Responsibilities

Gateway should only

- receive websocket event
- authenticate user
- call service

Never access repository directly.

Never calculate score.

Never query database directly.

---

# Coding Rules

Follow existing coding style.

Use async/await.

Use Dependency Injection.

Use DTO validation.

Throw NestJS Exceptions.

Do not duplicate existing logic.

Reuse existing services whenever possible.

---

# Deliverables

Implement

- DTOs
- Gateway events
- BattleService
- Repository methods if required
- SocketService calls
- Room management
- Score synchronization
- Match completion

The final implementation should allow two learners to complete a realtime PvP battle entirely through WebSocket.