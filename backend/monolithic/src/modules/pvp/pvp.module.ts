import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PvpMatch } from './entities/pvp-match.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PvpMatch])]
})
export class PvpModule { }
