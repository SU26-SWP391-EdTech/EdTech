import { Module } from '@nestjs/common';
import { LearnersService } from './learners.service';
import { LearnersController } from './learners.controller';

@Module({
  controllers: [LearnersController],
  providers: [LearnersService],
})
export class LearnersModule {}
