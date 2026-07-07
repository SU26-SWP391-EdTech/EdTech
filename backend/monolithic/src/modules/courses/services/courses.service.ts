import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CourseStatus } from 'src/common/enums/course.enum';
import { Course } from '../entities/course.entity';
import { CoursesRepository } from '../repositories/courses.repository';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { SearchCourseDto } from '../dto/search-course.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';
import { Lesson } from 'src/modules/lessons/entities/lesson.entity';
import { Enrollment } from 'src/modules/enrollments/entities/enrollment.entity';
import { LearningPathCourse } from 'src/modules/learning-paths/entities/learning-path-course.entity';
import { TagsService } from './tags.service';

@Injectable()
export class CoursesService {
  constructor(
    private readonly coursesRepository: CoursesRepository,
    private cloudinaryService: CloudinaryService,
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly tagsService: TagsService,
  ) { }

  //create course
  async create(
    createCourseDto: CreateCourseDto,
    userId: number,
    file?: Express.Multer.File,
  ): Promise<Course> {
    const courseProvider = await this.userRepository.findOne({
      where: {
        userId: userId,
      },
    });

    if (!courseProvider) {
      throw new NotFoundException('User not found');
    }

    if (file) {
      const uploaded = await this.cloudinaryService.uploadImage(file);
      createCourseDto.thumbnailUrl = uploaded.secure_url;
    }

    return this.coursesRepository.createCourse({
      ...createCourseDto,
      user: courseProvider,
    });
  }

  async createAndSubmitToReview(
    createCourseDto: CreateCourseDto,
    userId: number,
    file?: Express.Multer.File,
  ): Promise<Course> {
    const courseProvider = await this.userRepository.findOne({
      where: {
        userId,
      },
    });

    if (!courseProvider) {
      throw new NotFoundException('User not found');
    }

    if (file) {
      const uploaded = await this.cloudinaryService.uploadImage(file);
      createCourseDto.thumbnailUrl = uploaded.secure_url;
    }

    return this.coursesRepository.createCourse({
      ...createCourseDto,
      status: CourseStatus.PENDING,
      user: courseProvider,
    });
  }

  async findAll(): Promise<Course[]> {
    return this.coursesRepository.findAllCourses();
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.coursesRepository.findDetail(id);

    if (!course) {
      throw new NotFoundException(`Not found course with ID ${id}`);
    }

    return course;
  }

  async submitDraftToReview(userId: number, courseId: number): Promise<Course> {
    const course = await this.coursesRepository.findOne({
      where: {
        courseId,
        user: {
          userId,
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.status !== CourseStatus.DRAFT) {
      throw new BadRequestException(
        'Only draft courses can be submitted for review',
      );
    }

    return await this.coursesRepository.pendingCourse(course);
  }

  //update course

  async update(
    id: number,
    updateCourseDto: UpdateCourseDto,
    currentUserId: number,
    file?: Express.Multer.File,
  ): Promise<Course> {
    if (updateCourseDto.tags !== undefined) {
      const existingCourse = await this.coursesRepository.findOne({
        where: {
          courseId: id,
          user: {
            userId: currentUserId,
          },
        },
      });

      if (!existingCourse) {
        throw new NotFoundException(
          'Course not found or you do not own this course',
        );
      }

      if (existingCourse.status === CourseStatus.APPROVED) {
        throw new ForbiddenException(
          'Course Provider cannot edit official tags after approval',
        );
      }
    }

    const { tags, ...courseData } = updateCourseDto;
    const course = await this.coursesRepository.findOne({
      where: {
        courseId: id,
        user: {
          userId: currentUserId,
        },
      },
    });

    if (!course) {
      throw new NotFoundException(
        'Course not found or you do not own this course',
      );
    }

    if (file) {
      const uploaded = await this.cloudinaryService.uploadImage(file);
      courseData.thumbnailUrl = uploaded.secure_url;
    }

    Object.assign(course, courseData);

    return this.coursesRepository.saveCourse(course);
  }

  //remove course

  async remove(id: number, userId: number): Promise<{ message: string }> {
    const course = await this.coursesRepository.findOne({
      where: {
        courseId: id,
        user: {
          userId: userId,
        },
      },
    });

    if (!course) {
      throw new ForbiddenException(
        'Course not found or you do not own this course',
      );
    }

    await this.coursesRepository.manager.transaction(async (manager) => {
      await manager.delete(Lesson, {
        course: {
          courseId: id,
        },
      });

      await manager.delete(Enrollment, {
        course: {
          courseId: id,
        },
      });

      await manager.delete(LearningPathCourse, {
        course: {
          courseId: id,
        },
      });

      await manager.delete(Course, id);
    });

    return {
      message: `Course ID ${id} has been deleted successfully`,
    };
  }

  //approve course
  public async approveCourse(
    id: number,
    reviewerId: number,
    tags: string[] = [],
  ): Promise<Course> {
    const course = await this.coursesRepository.findCourseById(id);

    if (!course) {
      throw new NotFoundException(`Not found course with ID ${id}`);
    }

    if (course.status !== CourseStatus.PENDING) {
      throw new BadRequestException('Course is not in pending status');
    }

    if (!course.lessons || course.lessons.length === 0) {
      throw new BadRequestException(
        'Course must have at least one lesson to be approved',
      );
    }

    const reviewer = await this.userRepository.findOne({
      where: { userId: reviewerId },
    });

    if (!reviewer) {
      throw new NotFoundException('Reviewer not found');
    }

    return this.coursesRepository.manager.transaction(async (manager) => {
      course.status = CourseStatus.APPROVED;
      course.reviewedBy = reviewer;

      await manager.save(Course, course);
      await this.tagsService.setCourseTags(id, tags, manager);

      const approvedCourse = await manager
        .getRepository(Course)
        .createQueryBuilder('course')
        .leftJoin('course.user', 'user')
        .addSelect(['user.userId', 'user.fullName', 'user.email', 'user.avatar'])
        .leftJoinAndSelect('course.lessons', 'lessons')
        .leftJoinAndSelect('course.courseTag', 'courseTag')
        .leftJoinAndSelect('courseTag.tag', 'tag')
        .where('course.courseId = :id', { id })
        .orderBy('LOWER(tag.name)', 'ASC')
        .getOne();

      return approvedCourse!;
    });
  }

  public async updateCourseTags(id: number, tags: string[]): Promise<Course> {
    const course = await this.coursesRepository.findCourseById(id);

    if (!course) {
      throw new NotFoundException(`Not found course with ID ${id}`);
    }

    await this.tagsService.setCourseTags(id, tags);

    const updatedCourse = await this.coursesRepository.findDetail(id);
    return updatedCourse!;
  }

  public async removeCourseTag(
    courseId: number,
    tagId: number,
  ): Promise<{ message: string }> {
    return this.tagsService.removeTagFromCourse(courseId, tagId);
  }

  public async rejectCourse(
    id: number,
    reviewerId: number,
    reason?: string,
  ): Promise<Course> {
    const course = await this.coursesRepository.findCourseById(id);

    if (!course) {
      throw new NotFoundException(`Not found course with ID ${id}`);
    }

    if (course.status !== CourseStatus.PENDING) {
      throw new BadRequestException('Course is not in pending status');
    }

    const reviewer = await this.userRepository.findOne({
      where: { userId: reviewerId },
    });

    if (!reviewer) {
      throw new NotFoundException('Reviewer not found');
    }

    course.status = CourseStatus.REJECTED;
    course.reviewedBy = reviewer;
    if (reason) {
      course.reviewReason = reason;
    }

    return this.coursesRepository.saveCourse(course);
  }
  // ==================== Search & Filter ====================

  async search(dto: SearchCourseDto) {
    const { data, total } = await this.coursesRepository.searchCourses(dto);

    if (total == 0) {
      return {
        statusCode: 404,
        message: 'Course does not exist',
      };
    }

    return {
      statusCode: 200,
      message: 'Get course list successfully',
      data: {
        items: data,
        meta: {
          total: total,
          count: data.length,
        },
      },
    };
  }

  public async findCourseByIdService(courseId: number): Promise<Course | null> {
    const course = await this.coursesRepository.findCourseById(courseId);
    if (!course) {
      throw new NotFoundException(`Not found course with ID ${courseId}`);
    }
    return course;
  }

  async validateCourseOwner(userId: number, courseId: number): Promise<Course> {
    const course = await this.coursesRepository.findCourseById(courseId);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.user.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this course',
      );
    }

    return course;
  }
}
