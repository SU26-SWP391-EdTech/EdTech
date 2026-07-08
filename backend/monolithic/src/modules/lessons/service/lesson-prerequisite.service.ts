import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LessonsRepository } from '../repository/lessons.repository';
import { LessonPrerequisiteRepository } from '../repository/lesson-prerequisite.repository';
import { UpdateLessonPrerequisitesDto } from '../dto/update-lesson-prerequisites.dto';
import { ProgressService } from 'src/modules/progress/progress.service';
import { Lesson } from '../entities/lesson.entity';
import { LessonPrerequisite } from '../entities/lesson-prerequisite.entity';

@Injectable()
export class LessonPrerequisiteService {
  constructor(
    private readonly lessonsRepo: LessonsRepository,
    private readonly lessonPrerequisiteRepository: LessonPrerequisiteRepository,
    private readonly dataSource: DataSource,

    @Inject(forwardRef(() => ProgressService))
    private readonly progressService: ProgressService,
  ) {}

  async createPrerequisitesService(
    targetLessonId: number,
    prerequisiteLessonIds: number[],
  ): Promise<void> {
    if (prerequisiteLessonIds.length > 0) {
      const prerequisiteEntities = prerequisiteLessonIds.map((prId) => ({
        targetLessonId,
        prerequisiteLessonId: prId,
      }));
      await this.lessonPrerequisiteRepository.createMany(prerequisiteEntities);
    }
  }

  public async updatePrerequisitesForLesson(
    targetLessonId: number,
    prerequisiteLessonIds: number[],
  ): Promise<void> {
    // Xóa tất cả các bài học tiên quyết cũ
    await this.lessonPrerequisiteRepository.deleteByTargetLessonId(
      targetLessonId,
    );

    // Thêm mới các bài học tiên quyết nếu danh sách không rỗng
    if (prerequisiteLessonIds.length > 0) {
      const prerequisiteEntities = prerequisiteLessonIds.map((prId) => ({
        targetLessonId,
        prerequisiteLessonId: prId,
      }));
      await this.lessonPrerequisiteRepository.createMany(prerequisiteEntities);
    }
  }

  public async updatePrerequisitesService(
    targetLessonId: number,
    dto: UpdateLessonPrerequisitesDto,
    userId: number,
  ) {
    const { prerequisiteLessonIds } = dto;

    // 1. Validate target lesson exists
    const targetLesson = await this.lessonsRepo.findById(targetLessonId);
    if (!targetLesson) {
      throw new NotFoundException(`Lesson with ID ${targetLessonId} not found`);
    }

    // 2. Validate course provider ownership
    const isOwner = await this.lessonsRepo.belongsToCourseProvider(
      targetLessonId,
      userId,
    );
    if (!isOwner) {
      throw new ForbiddenException(
        'You do not have permission to modify this lesson',
      );
    }

    // 3. Validate no duplicate lesson ids (also handled by class-validator @ArrayUnique)
    const uniqueIds = new Set(prerequisiteLessonIds);
    if (uniqueIds.size !== prerequisiteLessonIds.length) {
      throw new BadRequestException('Prerequisite lesson IDs must be unique');
    }

    // 4. Validate target lesson cannot be its own prerequisite
    if (uniqueIds.has(targetLessonId)) {
      throw new BadRequestException(
        'Target lesson cannot be its own prerequisite',
      );
    }

    // 5. Validate every prerequisite lesson exists
    const prerequisiteLessons = await this.lessonsRepo.findByIds(
      prerequisiteLessonIds,
    );
    if (prerequisiteLessons.length !== prerequisiteLessonIds.length) {
      throw new BadRequestException(
        'One or more prerequisite lessons do not exist',
      );
    }

    // 6. Validate every prerequisite lesson must belong to the same course as target lesson
    const targetCourseId = targetLesson.course.courseId;
    for (const lesson of prerequisiteLessons) {
      if (lesson.course.courseId !== targetCourseId) {
        throw new BadRequestException(
          `Prerequisite lesson with ID ${lesson.lessonId} does not belong to the same course as the target lesson`,
        );
      }
    }

    // 7. Validate no circular dependency
    const hasCycle = await this.hasPath(
      targetLessonId,
      new Set(prerequisiteLessonIds),
    );
    if (hasCycle) {
      throw new BadRequestException(
        'Circular dependency detected in lesson prerequisites',
      );
    }

    // Begin database transaction to update prerequisites
    await this.dataSource.transaction(async (manager) => {
      // Delete old prerequisites
      await this.lessonPrerequisiteRepository.deleteByTargetLessonId(
        targetLessonId,
        manager,
      );

      // Insert new prerequisites
      if (prerequisiteLessonIds.length > 0) {
        const prerequisiteEntities = prerequisiteLessonIds.map((prId) => ({
          targetLessonId,
          prerequisiteLessonId: prId,
        }));
        await this.lessonPrerequisiteRepository.createMany(
          prerequisiteEntities,
          manager,
        );
      }
    });

    return {
      message: 'Lesson prerequisites updated successfully.',
      lessonId: targetLessonId,
      prerequisiteLessonIds,
    };
  }

  /**
   * Helper to perform DFS traversal to detect paths between target and prerequisite lessons
   */
  private async hasPath(
    startId: number,
    targetIds: Set<number>,
    visited: Set<number> = new Set(),
  ): Promise<boolean> {
    if (targetIds.has(startId)) {
      return true;
    }
    visited.add(startId);

    const nextEdges =
      await this.lessonPrerequisiteRepository.findNextLessons(startId);
    for (const edge of nextEdges) {
      const nextId = edge.targetLessonId;
      if (!visited.has(nextId)) {
        const pathExists = await this.hasPath(nextId, targetIds, visited);
        if (pathExists) {
          return true;
        }
      }
    }

    return false;
  }

  public async checkLessonPrerequisite(
    userId: number,
    targetLessonId: number,
  ): Promise<boolean> {
    const lesson = await this.lessonsRepo.findById(targetLessonId);

    if (!lesson) {
      throw new NotFoundException('Can not find lesson By Id');
    }

    const prerequisites =
      await this.lessonPrerequisiteRepository.findByTargetLessonId(
        targetLessonId,
      );

    if (prerequisites.length === 0) {
      return true;
    }

    for (const prerequisite of prerequisites) {
      const completed = await this.progressService.isLessonCompleted(
        userId,
        prerequisite.prerequisiteLessonId,
      );

      if (!completed) {
        return false;
      }
    }

    return true;
  }

  public async getPrerequisitesByLessonIdService(targetLessonId: number): Promise<LessonPrerequisite[]> {
    const lesson = await this.lessonsRepo.findById(targetLessonId);
    if(!lesson) {
      throw new NotFoundException("Can not find lesson by id");
    }
    
    const prerequisite =
      await this.lessonPrerequisiteRepository.findByTargetLessonId(
        targetLessonId,
      );
    if (!prerequisite || prerequisite.length === 0) {
      throw new NotFoundException('Can not find prerequisite by id ' + targetLessonId);
    }

    return prerequisite;
  }
}
