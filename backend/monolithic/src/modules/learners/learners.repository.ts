import { InjectRepository } from "@nestjs/typeorm";
import { Learner } from "./entities/learner.entity";
import { Repository } from "typeorm";

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
}