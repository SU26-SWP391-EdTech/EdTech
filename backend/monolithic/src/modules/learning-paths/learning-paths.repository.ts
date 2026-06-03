import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningPath } from './entities/learning-path.entity';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { User } from 'src/modules/users/entities/user.entity';
import { LearningPathCourse } from './entities/learning-path-course.entity';

@Injectable()
export class LearningPathsRepository {
  constructor(
    @InjectRepository(LearningPath)
    private readonly learningPathRepo: Repository<LearningPath>,

    @InjectRepository(LearningPathCourse)
    private readonly learningPathCourseRepo: Repository<LearningPathCourse>,
  ) {}

  async createLearningPath(
    createLearningPathDto: CreateLearningPathDto,
    slug: string,
    user: User,
  ): Promise<LearningPath> {
    const learningPath = this.learningPathRepo.create({
      ...createLearningPathDto,
      slug,
      edittedBy: user,
    });

    return await this.learningPathRepo.save(learningPath);
  }

  public async getLearningPathById(id: number): Promise<LearningPath | null> {
    return this.learningPathRepo.findOne({
      where: { learningPathId: id },
      // relations: ['learningPathCourses'],
    });
  }

  // Check if the Course is included in the Learning Path.
  public async isCourseInLearningPath(
    learningPathId: number,
    courseId: number,
  ): Promise<boolean> {
    return await this.learningPathCourseRepo.exists({
      where: { learningPathId, courseId },
    });
  }

  async addCourse(
    learningPath: LearningPath,
    course: any,
    position: number,
    user: User,
  ): Promise<LearningPathCourse> {
    const learningPathCourse = this.learningPathCourseRepo.create({
      learningPath,
      course,
      learningPathId: learningPath.learningPathId,
      courseId: course.courseId,
      position,
      edittedBy: user,
    });

    return await this.learningPathCourseRepo.save(learningPathCourse);
  }
}
