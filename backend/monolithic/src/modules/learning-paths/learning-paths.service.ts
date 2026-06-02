import { Injectable } from '@nestjs/common';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { User } from 'src/modules/users/entities/user.entity';
import { LearningPathsRepository } from './learning-paths.repository';
import { LearningPath } from './entities/learning-path.entity';

@Injectable()
export class LearningPathsService {
  constructor(private readonly learningPathsRepository: LearningPathsRepository) {}

  async create(createLearningPathDto: CreateLearningPathDto, user: User): Promise<LearningPath> {
    const slug = this.generateSlug(createLearningPathDto.title);
    
    // In a real application, you should check if the slug already exists and handle collisions
    // e.g., append a random string or number to make it unique.
    
    return await this.learningPathsRepository.createLearningPath(createLearningPathDto, slug, user);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD') // Normalize to NFD Unicode form (separates base characters from accents)
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with hyphens
      .replace(/(^-|-$)+/g, ''); // Remove leading and trailing hyphens
  }
}
