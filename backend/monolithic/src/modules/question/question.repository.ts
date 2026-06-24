import { Injectable } from "@nestjs/common";
import { Question } from "./entities/question.entity";
import { Repository } from "typeorm";

@Injectable()
export class QuestionRepository extends Repository<Question>{
    public async createQuestion(data : Partial<Question>) : Promise<Question> {
        const question = this.create(data);
        return await this.save(question);
    }
}