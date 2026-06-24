import { Injectable } from '@nestjs/common';
import { CreateQuestion } from './dto/create-question.dto';
import { Question } from './entities/question.entity';
import { LessonsService } from '../lessons/lessons.service';

@Injectable()
export class QuestionService {
    constructor(
        private readonly lessonsService:LessonsService,
    ){}

    async createQuestion(lessonId: number, courseId: number, userId: number, createQuestion: CreateQuestion) : Promise<Question>{
        const lesson = this.lessonsService.findLesson(lessonId, userId);
    }
}
