import { Injectable } from "@nestjs/common";
import { Learner } from "./entities/learner.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class LearnerRepository {
    constructor(
        @InjectRepository(Learner)
        private readonly repo: Repository<Learner>
    ) {}
    
    public async findLeanerById(userId: number): Promise<Learner | null> {
        return await this.repo.findOneBy({
            userId
        })
    }

    public async saveLearner(learner: Learner): Promise<Learner> {
        return await this.repo.save(learner);
    }
}