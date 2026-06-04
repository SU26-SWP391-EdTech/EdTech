import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { User } from 'src/modules/users/entities/user.entity';
import { LearningPathsRepository } from './learning-paths.repository';
import { LearningPath } from './entities/learning-path.entity';
import { AddCourseToLearningPathDto } from './dto/add-course-to-learning-path.dto';
import { LearningPathCourse } from './entities/learning-path-course.entity';
import { CoursesRepository } from '../courses/courses.repository';

@Injectable()
export class LearningPathsService {
  constructor(
    private readonly learningPathsRepository: LearningPathsRepository,
    private readonly courseRepository: CoursesRepository,
  ) {}

  async create(
    createLearningPathDto: CreateLearningPathDto,
    user: User,
  ): Promise<LearningPath> {
    const slug = this.generateSlug(createLearningPathDto.title);

    // In a real application, you should check if the slug already exists and handle collisions
    // e.g., append a random string or number to make it unique.

    return await this.learningPathsRepository.createLearningPath(
      createLearningPathDto,
      slug,
      user,
    );
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

  public async addCourse(
    learningPathId: number,
    dto: AddCourseToLearningPathDto,
    user: User,
  ): Promise<LearningPathCourse> {
    const { courseId, position } = dto;

    const learningPath =
      await this.learningPathsRepository.getLearningPathById(learningPathId);

    if (!learningPath) {
      throw new NotFoundException('Learning path not found');
    }

    const course = await this.courseRepository.findCourseById(courseId);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // 3. Check duplicate
    const existed = await this.learningPathsRepository.isCourseInLearningPath(
      learningPathId,
      courseId,
    );

    if (existed) {
      throw new ConflictException('Course already exists in learning path');
    }

    // 4. Call repository (đúng method bạn đưa)
    return await this.learningPathsRepository.addCourse(
      learningPath,
      course,
      position,
      user,
    );
  }

  public async removeCourse(
    learningPathId: number,
    courseId: number,
  ): Promise<{ message: string }> {
    const learningPath =
      await this.learningPathsRepository.getLearningPathById(learningPathId);

    if (!learningPath) {
      throw new NotFoundException('Learning path not found');
    }

    const course = await this.courseRepository.findCourseById(courseId);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const existed = await this.learningPathsRepository.isCourseInLearningPath(
      learningPathId,
      courseId,
    );

    if (!existed) {
      throw new NotFoundException('Course not found in learning path');
    }

    await this.learningPathsRepository.removeCourse(learningPathId, courseId);

    return { message: 'Course removed from learning path successfully' };
  }

  public async getCoursesInLearningPath(
    learningPathId: number,
  ): Promise<LearningPathCourse[]> {
    const learningPath =
      await this.learningPathsRepository.getLearningPathById(learningPathId);

    if (!learningPath) {
      throw new NotFoundException('Learning path not found');
    }

    return await this.learningPathsRepository.getCoursesByLearningPathId(
      learningPathId,
    );
  }
}
