import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChallengeStatus } from 'src/common/enums/challenge-status.enum';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { ChallengeRequest } from '../entities/challenge-request.entity';

@Injectable()
export class ChallengeRequestRepository {
    constructor(
      private readonly dataSource: DataSource,
      @InjectRepository(ChallengeRequest)
      private readonly challengeRepo: Repository<ChallengeRequest>,
    ) {}

    get manager(): EntityManager {
      return this.challengeRepo.manager;
    }

    public async findPendingChallenge(
        player1Id: number,
        player2Id: number,
      ): Promise<ChallengeRequest | null> {
        const thirtyFiveSecondsAgo = new Date(Date.now() - 35000);
        return await this.challengeRepo
          .createQueryBuilder('challenge')
          .where(
            '((challenge.challengerId = :player1Id AND challenge.receiverId = :player2Id) OR (challenge.challengerId = :player2Id AND challenge.receiverId = :player1Id))',
            { player1Id, player2Id }
          )
          .andWhere('challenge.status = :status', { status: ChallengeStatus.PENDING })
          .andWhere('challenge.createdAt >= :time', { time: thirtyFiveSecondsAgo })
          .getOne();
      }

      public async create(
        data: Partial<ChallengeRequest>,
      ): Promise<ChallengeRequest> {
        const challenge = this.challengeRepo.create(data);
    
        return await this.challengeRepo.save(challenge);
      }

      public async approveChallenge(
        challengeId: number
      ){
        await this.challengeRepo.update(
            challengeId,
            {
                status: ChallengeStatus.APPROVED,
                respondedAt: new Date(),
            }
        )
      };
      
      public async rejectChallenge(
        challengeId: number
      ){
        await this.challengeRepo.update(
            challengeId,
            {
                status: ChallengeStatus.REJECTED,
                respondedAt: new Date(),
            }
        )
      };

      public async findById(challengeId: number) : Promise<ChallengeRequest>{
        const challenge = await this.challengeRepo.findOne({
          where: {
            challengeId,
          }
        })

        if(!challenge){
          throw new NotFoundException(`Not found challenge with ID: ${challengeId}`);
        }

        return challenge;
      }

      public async expireChallenge(challengeId: number) {
        await this.challengeRepo.update(
          challengeId,
          {
              status: ChallengeStatus.EXPIRED,
              respondedAt: new Date(),
          }
      )
      }

      public async cancelChallenge(
        challengeId: number
      ): Promise<void> {
        await this.challengeRepo.update(
          challengeId,
          {
            status: ChallengeStatus.CANCELLED,
            respondedAt: new Date(),
          },
        );
      }
}
