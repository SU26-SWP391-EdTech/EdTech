import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Learner } from './entities/learner.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Learner])]
})
export class LearnersModule {}
