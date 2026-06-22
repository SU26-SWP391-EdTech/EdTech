import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { QuestionOption } from './entities/question-option.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Question, QuestionOption])]
})
export class QuestionModule { }
