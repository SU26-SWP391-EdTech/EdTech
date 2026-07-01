import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PvpMatch } from './entities/pvp-match.entity';
import { ChallengeRequest } from './entities/challenge-request.entity';
import { PvpGateway } from './gateway/pvp.gateway';
import { ConnectionManager } from './manager/connection.manager';

@Module({
  imports: [TypeOrmModule.forFeature([PvpMatch, ChallengeRequest])],
  providers: [
    PvpGateway,
    ConnectionManager,
  ],
  exports: [
    ConnectionManager
  ]
})
export class PvpModule { }
