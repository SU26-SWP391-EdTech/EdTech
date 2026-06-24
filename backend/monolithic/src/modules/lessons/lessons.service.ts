import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonsRepository } from './lessons.repository';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from './entities/lesson.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { EnrollmentStatus } from 'src/common/enums/enrollment.enum';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { RoleEnum } from 'src/common/enums/role.enum';
import { CoursesService } from '../courses/courses.service';

import { LessonPrerequisite } from './entities/lesson-prerequisite.entity';

@Injectable()
export class LessonsService {
  constructor(
    private readonly lessonsRepo: LessonsRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly courseService: CoursesService,
    @InjectRepository(Enrollment)
    private readonly enrollmentsRepo: Repository<Enrollment>,
    @InjectRepository(LessonPrerequisite)
    private readonly lessonPrerequisiteRepo: Repository<LessonPrerequisite>,
  ) { }

  async create(
    id: number,
    dto: CreateLessonDto,
    file?: Express.Multer.File,
  ): Promise<Lesson> {
    const { prerequisiteLessonIds, clearPrerequisites, ...lessonData } = dto;

    // check course exist
    const course = await this.courseService.findCourseByIdService(id);

    if (!course) {
      throw new NotFoundException(`Not found course with ID ${id}`);
    }

    if (file) {
      const uploadedVideo = await this.cloudinaryService.uploadVideo(file);
      lessonData.videoUrl = uploadedVideo.secure_url;
    }

    // Tự động tính toán vị trí (position) của bài học mới
    const allLessons = await this.lessonsRepo.findByCourseId(id);
    const count = allLessons.length;
    const match = dto.title.match(/^\[Order:(\d+)\]/);
    const position = match ? parseInt(match[1], 10) : count + 1;

    const lesson = await this.lessonsRepo.createLesson({
      ...lessonData,
      course,
      position,
    });

    // Lưu các bài học tiên quyết
    let prIds: number[] = [];
    if (prerequisiteLessonIds) {
      if (typeof prerequisiteLessonIds === 'string') {
        try {
          const parsed = JSON.parse(prerequisiteLessonIds);
          if (Array.isArray(parsed)) {
            prIds = parsed.map(Number);
          } else {
            prIds = String(prerequisiteLessonIds).split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
          }
        } catch {
          prIds = String(prerequisiteLessonIds).split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
        }
      } else if (Array.isArray(prerequisiteLessonIds)) {
        prIds = prerequisiteLessonIds.map(Number);
      }
    }

    if (prIds.length > 0) {
      const prerequisiteEntities = prIds.map(prId => {
        const item = new LessonPrerequisite();
        item.targetLessonId = lesson.lessonId;
        item.prerequisiteLessonId = prId;
        return item;
      });
      await this.lessonPrerequisiteRepo.save(prerequisiteEntities);
    }

    return await this.findOne(lesson.lessonId);
  }

  async findAllByCourse(courseId: number): Promise<Lesson[]> {
    const course = await this.courseService.findCourseByIdService(courseId);
    if (!course) {
      throw new NotFoundException(`Not found course with ID ${courseId}`);
    }

    return await this.lessonsRepo.findByCourseId(courseId);
  }

  async findOne(id: number): Promise<Lesson> {
    const lesson = await this.lessonsRepo.findById(id);

    if (!lesson) {
      throw new NotFoundException(`Not found lesson with ID ${id}`);
    }

    return lesson;
  }


  async findLesson(
    lessonId: number,
    userId: number,
  ): Promise<Lesson> {

    const lesson = await this.lessonsRepo.findById(lessonId);

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    // Instructor sở hữu course
    if (
      lesson.course.user.userId === userId &&
      lesson.course.user.role.roleName === RoleEnum.COURSE_PROVIDER
    ) {
      return lesson;
    }

    const enrollment = await this.enrollmentsRepo.findOne({
      where: {
        user: {
          userId,
        },
        course: {
          courseId: lesson.course.courseId,
        },
        status: EnrollmentStatus.ACTIVE,
      },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        'You must enroll in this course before accessing lessons',
      );
    }

    return lesson;
  }

  async update(
    courseId: number,
    lessonId: number,
    dto: UpdateLessonDto,
    file?: Express.Multer.File,
  ): Promise<Lesson> {
    const lesson = await this.findOne(lessonId);

    if (!lesson) throw new NotFoundException('Lesson not exist');

    const course = await this.courseService.findCourseByIdService(courseId);

    if (!course) {
      throw new NotFoundException(`Not found course with ID ${courseId}`);
    }

    if (lesson.course.courseId !== courseId) {
      throw new BadRequestException('Lesson does not belong to this course');
    }

    if (file) {
      const uploadedVideo = await this.cloudinaryService.uploadVideo(file);
      dto.videoUrl = uploadedVideo.secure_url;
    }

    const { prerequisiteLessonIds, clearPrerequisites, ...updateData } = dto;

    Object.assign(lesson, updateData);

    // If title has order prefix, update position accordingly
    if (dto.title) {
      const match = dto.title.match(/^\[Order:(\d+)\]/);
      if (match) {
        lesson.position = parseInt(match[1], 10);
      }
    }

    // Sửa đổi các bài học tiên quyết nếu được cung cấp
    let prIds: number[] = [];
    let shouldUpdatePrerequisites = false;

    if (prerequisiteLessonIds !== undefined) {
      shouldUpdatePrerequisites = true;
      if (typeof prerequisiteLessonIds === 'string') {
        try {
          const parsed = JSON.parse(prerequisiteLessonIds);
          if (Array.isArray(parsed)) {
            prIds = parsed.map(Number);
          } else {
            prIds = String(prerequisiteLessonIds).split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
          }
        } catch {
          prIds = String(prerequisiteLessonIds).split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
        }
      } else if (Array.isArray(prerequisiteLessonIds)) {
        prIds = prerequisiteLessonIds.map(Number);
      }
    } else if (clearPrerequisites) {
      shouldUpdatePrerequisites = true;
    }

    if (shouldUpdatePrerequisites) {
      // Xóa tất cả các bài học tiên quyết cũ
      await this.lessonPrerequisiteRepo.delete({ targetLessonId: lessonId });

      // Thêm mới các bài học tiên quyết nếu danh sách không rỗng
      if (prIds.length > 0) {
        const prerequisiteEntities = prIds.map(prId => {
          const item = new LessonPrerequisite();
          item.targetLessonId = lessonId;
          item.prerequisiteLessonId = prId;
          return item;
        });
        await this.lessonPrerequisiteRepo.save(prerequisiteEntities);
      }
    }

    await this.lessonsRepo.save(lesson);
    return await this.findOne(lessonId);
  }

  async remove(id: number): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);
    await this.lessonsRepo.delete(id);
    return {
      success: true,
      message: `Lesson with ID ${id} has been deleted successfully`,
    };
  }

  public async findLessonByIdService(lessonId: number): Promise<Lesson> {
    const lesson = await this.lessonsRepo.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }
    return lesson;
  }
}
