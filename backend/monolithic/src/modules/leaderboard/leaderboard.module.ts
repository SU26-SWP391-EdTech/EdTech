import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardRule } from './entities/learderboard-rule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaderboardRule])
  ]
})
export class LeaderboardModule {
}
