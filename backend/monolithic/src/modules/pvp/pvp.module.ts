import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PvpMatch } from './entities/pvp-match.entity';
import { ChallengeRequest } from './entities/challenge-request.entity';
import { ChallengeRequestRepository } from './repositories/challenge-request.repository';
import { ChallengeRequestService } from './services/challenge-request.service';
import { ChallengeRequestController } from './controllers/challenge-request.controller';
import { PvpGateway } from './gateway/pvp.gateway';
import { ConnectionManager } from './manager/connection.manager';
import { PvpController } from './controllers/pvp.controller';
import { BattleService } from './services/battle.service';
import { PvpRepository } from './repositories/pvp.repository';


@Module({
  imports: [TypeOrmModule.forFeature([PvpMatch, ChallengeRequest])],
  controllers: [ChallengeRequestController, PvpController],
  providers: [
    ChallengeRequestRepository,
    ChallengeRequestService,
    PvpGateway,
    ConnectionManager,
    BattleService,
    PvpRepository,
  ],
  exports: [
    ChallengeRequestService,
    ConnectionManager,
    BattleService,
  ],
})
export class PvpModule { }
