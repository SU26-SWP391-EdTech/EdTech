import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PvpMatch } from './entities/pvp-match.entity';
import { ChallengeRequest } from './entities/challenge-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PvpMatch, ChallengeRequest])]
})
export class PvpModule { }
