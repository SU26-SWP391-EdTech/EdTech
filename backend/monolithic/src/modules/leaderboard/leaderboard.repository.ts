import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { LeaderboardRule } from "./entities/leaderboard-rule.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class LeaderboardRepository{
    constructor(
        @InjectRepository(LeaderboardRule)
        private readonly leaderboardRepo: Repository<LeaderboardRule>,
    ){}

    public create(data: Partial<LeaderboardRule>): LeaderboardRule {
        return this.create(data);
      }
    
      public async save(rule: LeaderboardRule): Promise<LeaderboardRule> {
        return await this.save(rule);
      }

      public async findByCourseId(
        courseId: number,
      ): Promise<LeaderboardRule | null> {
        return await this.leaderboardRepo.findOne({
          where: {
            course: {
              courseId,
            },
          },
          relations: ['course'],
        });
      }

      public async updateRule(
        rule: LeaderboardRule,
      ): Promise<LeaderboardRule> {
        return await this.save(rule);
      }
}