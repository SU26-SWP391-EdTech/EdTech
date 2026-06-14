import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LearningPath } from './entities/learning-path.entity';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { User } from 'src/modules/users/entities/user.entity';
import { LearningPathCourse } from './entities/learning-path-course.entity';
import { UpdateLearningPathDto } from './dto/update-learning-path.dto';
import { CourseStatus } from 'src/common/enums/course.enum';

@Injectable()
export class LearningPathsRepository {
  constructor(
    @InjectRepository(LearningPath)
    private readonly learningPathRepo: Repository<LearningPath>,

    @InjectRepository(LearningPathCourse)
    private readonly learningPathCourseRepo: Repository<LearningPathCourse>,
    private readonly dataSource: DataSource,
  ) { }

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
      relations: ['learningPathCourses', 'learningPathCourses.course'],
    });
  }

  public async getAll(): Promise<LearningPath[]> {
    return this.learningPathRepo.find({
      relations: ['learningPathCourses', 'learningPathCourses.course'],
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

  public async addCourse(
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

  public async removeCourse(
    learningPathId: number,
    courseId: number,
  ): Promise<void> {
    await this.learningPathCourseRepo.delete({ learningPathId, courseId });
  }

  public async getCoursesByLearningPathId(
    learningPathId: number,
  ): Promise<LearningPathCourse[]> {
    return await this.learningPathCourseRepo.find({
      where: {
        learningPathId,
        course: {
          status: CourseStatus.APPROVED,
        }
      },
      relations: ['course'],
      order: { position: 'ASC' },
    });
  }

  public async updateLearningPath(
    learningPathId: number,
    dto: UpdateLearningPathDto,
    user: User,
  ): Promise<LearningPath> {
    return await this.learningPathRepo.save({
      learningPathId,
      ...dto,
      edittedBy: user,
    });
  }

  public async getLearningPathCourse(
    learningPathId: number,
    courseId: number,
  ): Promise<LearningPathCourse | null> {
    return this.learningPathCourseRepo.findOne({
      where: { learningPathId, courseId },
    });
  }

  public async countCoursesInLearningPath(
    learningPathId: number,
  ): Promise<number> {
    return this.learningPathCourseRepo.count({
      where: { learningPathId },
    });
  }

  public async swapCoursePosition(
    learningPathId: number,
    currentCourse: LearningPathCourse,
    newPosition: number,
    user: User,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const targetCourse = await queryRunner.manager.findOne(
        LearningPathCourse,
        {
          where: {
            learningPathId,
            position: newPosition,
          },
        },
      );

      if (!targetCourse) {
        throw new NotFoundException('Target course not found');
      }

      const oldPosition = currentCourse.position;
      const tempPosition = -1;

      // Bước 1: chuyển current sang vị trí tạm
      currentCourse.position = tempPosition;
      currentCourse.edittedBy = user;
      await queryRunner.manager.save(currentCourse);

      // Bước 2: chuyển target về vị trí cũ
      targetCourse.position = oldPosition;
      targetCourse.edittedBy = user;
      await queryRunner.manager.save(targetCourse);

      // Bước 3: chuyển current sang vị trí mới
      currentCourse.position = newPosition;
      currentCourse.edittedBy = user;
      await queryRunner.manager.save(currentCourse);

      await queryRunner.manager.update(
        LearningPath,
        { learningPathId },
        { edittedBy: user },
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
