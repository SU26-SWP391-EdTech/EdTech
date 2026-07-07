import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PvpMatch } from './entities/pvp-match.entity';
import { ChallengeRequest } from './entities/challenge-request.entity';
import { PvpGateway } from './gateway/pvp.gateway';
import { ConnectionManager } from './manager/connection.manager';
import { PvpController } from './controllers/pvp.controller';
import { BattleService } from './services/battle.service';
import { PvpRepository } from './repositories/pvp.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PvpMatch, ChallengeRequest])],
  providers: [
    PvpGateway,
    ConnectionManager,
    BattleService,
    PvpRepository,
  ],
  exports: [
    ConnectionManager,
    BattleService,
  ],
  controllers: [PvpController]
})
export class PvpModule { }
