import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LearningPathFollow } from "./entities/learning-path-follow.entity";
import { Repository } from "typeorm";

@Injectable()
export class LearningPathFollowRepository{
    constructor(
        @InjectRepository(LearningPathFollow)
        private readonly learningPathFollowRepo: Repository<LearningPathFollow>,
    ){}

    async followLearningPath(learningPathId: number, userId: number) : Promise<LearningPathFollow>{
        const learningPathFollow = this.learningPathFollowRepo.create({learningPathId, userId});
        return await this.learningPathFollowRepo.save(learningPathFollow);
    }

    async viewLearningPathFollower(
        learningPathId: number,
      ) {
        return await this.learningPathFollowRepo
          .createQueryBuilder('follow')
          .innerJoin('follow.user', 'user')
          .innerJoin('follow.learningPath', 'lp')
          .where('lp.learningPathId = :learningPathId', {
            learningPathId,
          })
          .select([
            'lp.learningPathId AS learningPathId',
            'lp.title AS title',
            'user.userId AS userId',
            'user.username AS username',
            'follow.followedAt AS followedAt',
          ])
          .getRawMany();
      }

      async findFollowingLearningPaths(userId: number) {
        return await this.learningPathFollowRepo
          .createQueryBuilder('follow')
          .innerJoin('follow.learningPath', 'lp')
          .where('follow.userId = :userId', { userId })
          .select([
            'lp.learningPathId AS learningPathId',
            'lp.title AS title',
            'lp.description AS description',
            'lp.thumbnailUrl AS thumbnailUrl',
            'follow.followedAt AS followedAt',
          ])
          .orderBy('follow.followedAt', 'DESC')
          .getRawMany();
      }

      public async findFollow(
        learningPathId: number,
        userId: number,
      ): Promise<LearningPathFollow | null> {
        return await this.learningPathFollowRepo.findOne({
          where: {
            learningPathId,
            userId,
          },
        });
      }

      public async deleteFollow(
        learningPathId: number,
        userId: number,
      ): Promise<void> {
        await this.learningPathFollowRepo.delete({
          learningPathId,
          userId,
        });
      }
}