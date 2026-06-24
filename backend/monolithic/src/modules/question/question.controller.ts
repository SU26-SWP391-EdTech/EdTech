import { Body, Controller, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { CreateQuestion } from './dto/create-question.dto';
import { QuestionService } from './question.service';

@Controller('question')
export class QuestionController {
    constructor(private readonly questionService : QuestionService){}

    @Post('lesson/:lessonId/course/:courseId')
    async createQuestion(@Param('lessonId', ParseIntPipe) lessonId: number, @Param('courseId', ParseIntPipe) courseId: number, @Req() req, @Body() createQuestion:CreateQuestion){
        return await this.questionService.createQuestion(lessonId, courseId, req.user.userId, createQuestion);
    }

}
