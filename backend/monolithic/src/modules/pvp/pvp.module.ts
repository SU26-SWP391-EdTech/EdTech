import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PvpMatch } from './entities/pvp-match.entity';
import { ChallengeRequest } from './entities/challenge-request.entity';
import { PvpGateway } from './gateway/pvp.gateway';
import { ConnectionManager } from './manager/connection.manager';
import { BattleSessionManager } from './manager/battle-session.manager';
import { RoomManager } from './manager/room.manager';
import { BattleService } from './services/battle.service';
import { ChallengeRequestService } from './services/challenge-request.service';
import { SocketService } from './services/socket.service';
import { MatchRepository } from './repositories/match.repository';
import { ChallengeRequestRepository } from './repositories/challenge-request.repository';
import { AssessmentModule } from '../assessment/assessment.module';
import { LearnersModule } from '../learners/learners.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PvpMatch, ChallengeRequest]),
    AssessmentModule,
    LearnersModule,
    EnrollmentsModule,
    AuthModule,
  ],
  providers: [
    PvpGateway,
    ConnectionManager,
    BattleSessionManager,
    RoomManager,
    SocketService,
    ChallengeRequestService,
    ChallengeRequestRepository,
    BattleService,
    MatchRepository,
  ],
  exports: [
    ConnectionManager,
    BattleService,
    SocketService,
  ],
  controllers: []
})
export class PvpModule { }
