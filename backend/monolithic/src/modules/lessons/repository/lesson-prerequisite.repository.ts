import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { LessonPrerequisite } from '../entities/lesson-prerequisite.entity';

@Injectable()
export class LessonPrerequisiteRepository {
  constructor(
    @InjectRepository(LessonPrerequisite)
    private readonly repo: Repository<LessonPrerequisite>,
  ) {}

  private getRepo(manager?: EntityManager): Repository<LessonPrerequisite> {
    return manager ? manager.getRepository(LessonPrerequisite) : this.repo;
  }

  public async deleteByTargetLessonId(targetLessonId: number, manager?: EntityManager): Promise<void> {
    await this.getRepo(manager).delete({ targetLessonId });
  }

  public async createMany(prerequisites: Partial<LessonPrerequisite>[], manager?: EntityManager): Promise<LessonPrerequisite[]> {
    const repo = this.getRepo(manager);
    const entities = repo.create(prerequisites);
    return await repo.save(entities);
  }

  public async findNextLessons(prerequisiteLessonId: number, manager?: EntityManager): Promise<LessonPrerequisite[]> {
    return await this.getRepo(manager).find({
      where: { prerequisiteLessonId },
    });
  }

  public async findByTargetLessonId(targetLessonId: number, manager?: EntityManager): Promise<LessonPrerequisite[]> {
    return await this.getRepo(manager).find({
      where: { targetLessonId },
      }
    );
  }
  
}
