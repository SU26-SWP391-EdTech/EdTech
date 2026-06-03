import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningPath } from './entities/learning-path.entity';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class LearningPathsRepository {
  constructor(
    @InjectRepository(LearningPath)
    private readonly repository: Repository<LearningPath>,
  ) {}

  async createLearningPath(
    createLearningPathDto: CreateLearningPathDto,
    slug: string,
    user: User,
  ): Promise<LearningPath> {
    const learningPath = this.repository.create({
      ...createLearningPathDto,
      slug,
      edittedBy: user,
    });

    return await this.repository.save(learningPath);
  }
}
