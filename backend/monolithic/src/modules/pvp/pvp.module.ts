import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PvpMatch } from './entities/pvp-match.entity';
import { ChallengeRequest } from './entities/challenge-request.entity';
import { ChallengeRequestRepository } from './repository/challenge-request.repository';
import { ChallengeRequestService } from './service/challenge-request.service';
import { ChallengeRequestController } from './controller/challenge-request.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PvpMatch, ChallengeRequest])],
  controllers: [ChallengeRequestController],
  providers: [
    ChallengeRequestRepository,
    ChallengeRequestService,
  ],
  exports: [
    ChallengeRequestService,
  ],
})
export class PvpModule { }
