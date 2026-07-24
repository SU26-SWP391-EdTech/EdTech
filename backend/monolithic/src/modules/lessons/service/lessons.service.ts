import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonsRepository } from '../repository/lessons.repository';
import { CreateLessonDto } from '../dto/create-lesson.dto';
import { UpdateLessonDto } from '../dto/update-lesson.dto';
import { Lesson } from '../entities/lesson.entity';
import { CloudinaryService } from 'src/modules/cloudinary/cloudinary.service';
import { EnrollmentStatus } from 'src/common/enums/enrollment.enum';
import { Enrollment } from 'src/modules/enrollments/entities/enrollment.entity';
import { RoleEnum } from 'src/common/enums/role.enum';
import { CoursesService } from 'src/modules/courses/services/courses.service';
import { LessonPrerequisiteService } from './lesson-prerequisite.service';
import { ReorderLessonsDto } from '../dto/reorder-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(
    private readonly lessonsRepo: LessonsRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly courseService: CoursesService,
    @InjectRepository(Enrollment)
    private readonly enrollmentsRepo: Repository<Enrollment>,
    private readonly lessonPrerequisiteService: LessonPrerequisiteService,
  ) { }

  public async create(
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

    const maxPosition = await this.lessonsRepo.getMaxPosition(id);

    const lesson = await this.lessonsRepo.createLesson({
      ...lessonData,
      course,
      position: (maxPosition ?? 0) + 1,
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

    prIds = Array.from(new Set(prIds)).filter(prId => prId && prId !== lesson.lessonId);

    if (prIds.length > 0) {
      await this.lessonPrerequisiteService.createPrerequisitesService(lesson.lessonId, prIds);
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

    // Allow Course Providers, Academic Managers, Admins, or Course Owner
    const isOwnerOrStaff =
      lesson.course.user?.userId === userId ||
      lesson.course.user?.role?.roleName === RoleEnum.COURSE_PROVIDER ||
      lesson.course.user?.role?.roleName === RoleEnum.ACADEMIC_MANAGER ||
      lesson.course.user?.role?.roleName === RoleEnum.ADMIN;

    if (isOwnerOrStaff) {
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
    currentUserId?: number,
  ): Promise<Lesson> {
    const lesson = await this.findOne(lessonId);

    if (!lesson) throw new NotFoundException('Lesson not exist');

    if (!currentUserId) {
      throw new ForbiddenException('Authenticated course owner is required');
    }
    const course = await this.courseService.validateCourseOwner(currentUserId, courseId);

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
      prIds = Array.from(new Set(prIds)).filter(prId => prId && prId !== lessonId);
      await this.lessonPrerequisiteService.updatePrerequisitesForLesson(lessonId, prIds);
    }

    await this.lessonsRepo.save(lesson);
    return await this.findOne(lessonId);
  }

  async remove(id: number): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);
    try {
      await this.lessonsRepo.delete(id);
      return {
        success: true,
        message: `Lesson with ID ${id} has been deleted successfully`,
      };
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED' || error.message.includes('foreign key constraint')) {
        throw new BadRequestException('Cannot delete this lesson because it contains Quizzes/Assessments, or students have already started learning it. Please remove all Quizzes inside this lesson first, or unpublish the course.');
      }
      throw error;
    }
  }

  public async findLessonByIdService(lessonId: number): Promise<Lesson> {
    const lesson = await this.lessonsRepo.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }
    return lesson;
  }

  public async reorderLessons(lessonId: number, reorderLessonsDto: ReorderLessonsDto, userId: number): Promise<Lesson[]> {
    const lesson = await this.findOne(lessonId);
    const course = await this.courseService.validateCourseOwner(userId, lesson.course.courseId);
    if (!course) {
      throw new NotFoundException(`Not found course with ID ${lesson.course.courseId}`);
    }
    const { lessonIds } = reorderLessonsDto;
    const allLessons = await this.lessonsRepo.findByCourseId(lesson.course.courseId);
    const lessonIdsSet = new Set(lessonIds);
    const validLessons = allLessons.filter(l => lessonIdsSet.has(l.lessonId));
    validLessons.sort((a, b) => lessonIds.indexOf(a.lessonId) - lessonIds.indexOf(b.lessonId));

    // Bước 1: Gán position âm tạm thời để tránh vi phạm unique constraint (course_id, position)
    // trong quá trình MySQL update tuần tự từng record.
    await this.lessonsRepo.saveMany(
      validLessons.map((l, i) => ({ ...l, position: -(i + 1) } as Lesson))
    );

    // Bước 2: Gán position thực
    validLessons.forEach((l, index) => {
      l.position = index + 1;
    });
    await this.lessonsRepo.saveMany(validLessons);
    return validLessons;
  }
}
