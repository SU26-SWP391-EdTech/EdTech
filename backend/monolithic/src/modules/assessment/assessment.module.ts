import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assessment } from './entities/assessment.entity';
import { AssessmentSession } from './entities/assessment-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assessment, AssessmentSession])
  ]
})
export class AssessmentModule { }
