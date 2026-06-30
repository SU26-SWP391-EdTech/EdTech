import {
  BadRequestException,
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
import { UpdateLearningPathDto } from './dto/update-learning-path.dto';
import { UpdateCoursePositionDto } from './dto/update-course-position.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CourseStatus } from 'src/common/enums/course.enum';
import { LearningPathFollowRepository } from './learning-path-follow.repository';
import { LearningPathFollowingResponseDto } from './dto/learning-path-following-response.dto';

@Injectable()
export class LearningPathsService {
  constructor(
    private readonly learningPathsRepository: LearningPathsRepository,
    private readonly courseRepository: CoursesRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly learningPathFollowRepo: LearningPathFollowRepository,
  ) { }

  async create(
    createLearningPathDto: CreateLearningPathDto,
    user: User,
  ): Promise<LearningPath> {
    if (createLearningPathDto.bannerUrl && createLearningPathDto.bannerUrl.startsWith('data:image/')) {
      const upload = await this.cloudinaryService.uploadBase64(createLearningPathDto.bannerUrl);
      createLearningPathDto.bannerUrl = upload.secure_url;
    }

    const slug = createLearningPathDto.slug || this.generateSlug(createLearningPathDto.title);

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

  public async addCourse(learningPathId: number, dto: AddCourseToLearningPathDto, user: User,): Promise<LearningPathCourse> {
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

    if (course?.status !== CourseStatus.APPROVED) {
      throw new BadRequestException('Course is not approved');
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

    const arrLeaningPathCourse: LearningPathCourse[] = await this.learningPathsRepository.getCoursesByLearningPathId(learningPathId);

    if (arrLeaningPathCourse.length === 0) {
      throw new NotFoundException('Learning path has no courses were approved');
    }

    return arrLeaningPathCourse;
  }

  public async getAll(): Promise<LearningPath[]> {
    return await this.learningPathsRepository.getAll();
  }

  public async getLearningPathById(id: number): Promise<LearningPath> {
    const learningPath = await this.learningPathsRepository.getLearningPathById(id);
    if (!learningPath) {
      throw new NotFoundException('Learning path not found');
    }
    return learningPath;
  }

  public async updateLearningPath(user: User, learningPathId: number, dto: UpdateLearningPathDto): Promise<LearningPath> {
    const learningPath = await this.learningPathsRepository.getLearningPathById(learningPathId);

    if (!learningPath) {
      throw new NotFoundException('Learning path not found');
    }

    if (dto.bannerUrl && dto.bannerUrl.startsWith('data:image/')) {
      const upload = await this.cloudinaryService.uploadBase64(dto.bannerUrl);
      dto.bannerUrl = upload.secure_url;
    }

    const updateDto = { ...dto };
    if (updateDto.title && !updateDto.slug) {
      updateDto.slug = this.generateSlug(updateDto.title);
    }

    const updateLearningPath = await this.learningPathsRepository.updateLearningPath(learningPathId, updateDto, user);
    return updateLearningPath;
  }

  public async updateCoursePosition(user: User, learningPathId: number, courseId: number, dto: UpdateCoursePositionDto): Promise<object> {
    const { newPosition } = dto;

    const learningPath: LearningPath | null = await this.learningPathsRepository.getLearningPathById(learningPathId);
    if (!learningPath) {
      throw new NotFoundException('Learning path not found');
    }

    const currentCourseNode: LearningPathCourse | null = await this.learningPathsRepository.getLearningPathCourse(learningPathId, courseId);

    if (!currentCourseNode) {
      throw new NotFoundException('Course not found in learning path');
    }

    const currentPosition: number = currentCourseNode.position;

    if (currentPosition === newPosition) {
      throw new ConflictException('Course position is already the same');
    }

    const countNodeInPath: number = await this.learningPathsRepository.countCoursesInLearningPath(learningPathId);
    if (newPosition < 1 || newPosition > countNodeInPath) {
      throw new BadRequestException('Invalid position');
    }

    await this.learningPathsRepository.swapCoursePosition(learningPathId, currentCourseNode, newPosition, user);

    return ({
      message: 'Course position updated successfully'
    })
  }

  public async delete(id: number): Promise<{ message: string }> {
    const learningPath = await this.learningPathsRepository.getLearningPathById(id);
    if (!learningPath) {
      throw new NotFoundException('Learning path not found');
    }
    await this.learningPathsRepository.delete(id);
    return { message: 'Learning path deleted successfully' };
  }

  public async followLearningPathService(learningPathId: number, userId: number){
    return await this.learningPathFollowRepo.followLearningPath(learningPathId, userId);
  }

  public async viewLearningPathFollower(learningPathId: number){
    return await this.learningPathFollowRepo.viewLearningPathFollower(learningPathId);
  }

  async getMyFollowingLearningPaths(
    userId: number,
  ): Promise<LearningPathFollowingResponseDto[]> {
  
    const learningPaths =
      await this.learningPathFollowRepo.findFollowingLearningPaths(
        userId,
      );
  
    return learningPaths.map(
      lp => new LearningPathFollowingResponseDto(lp),
    );
  }

  async unfollowLearningPath(
    learningPathId: number,
    userId: number,
  ): Promise<void> {
  
    const follow =
      await this.learningPathFollowRepo.findFollow(
        learningPathId,
        userId,
      );
  
    if (!follow) {
      throw new NotFoundException(
        'You are not following this learning path',
      );
    }
  
    await this.learningPathFollowRepo.deleteFollow(
      learningPathId,
      userId,
    );
  }
}
