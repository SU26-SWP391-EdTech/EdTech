import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonsRepository } from './lessons.repository';
import { Course } from '../courses/entities/course.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from './entities/lesson.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { EnrollmentStatus } from 'src/common/enums/enrollment.enum';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { EnrollmentsRepository } from '../enrollments/enrollments.repository';
import { RoleEnum } from 'src/common/enums/role.enum';

@Injectable()
export class LessonsService {
  constructor(
    private readonly lessonsRepo: LessonsRepository,

    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    private readonly cloudinaryService: CloudinaryService,
    @InjectRepository(Enrollment)
    private readonly enrollmentsRepo: Repository<Enrollment>,
  ) { }

  async create(
    id: number,
    dto: CreateLessonDto,
    file?: Express.Multer.File,
  ): Promise<Lesson> {
    const { ...lessonData } = dto;

    // check course exist
    const course = await this.courseRepo.findOne({
      where: { courseId: id },
    });

    if (!course) {
      throw new NotFoundException(`Not found course with ID ${id}`);
    }

    if (file) {
      const uploadedVideo = await this.cloudinaryService.uploadVideo(file);
      lessonData.videoUrl = uploadedVideo.secure_url;
    }

    return await this.lessonsRepo.createLesson({
      ...lessonData,
      course,
    });
  }

  async findAllByCourse(courseId: number): Promise<Lesson[]> {
    const course = await this.courseRepo.findOne({ where: { courseId } });
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

    const lesson = await this.lessonRepo.findOne({
      where: {
        lessonId,
      },
      relations: {
        course: {
          user: {
            role: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException(
        `Lesson with ID ${lessonId} not found`,
      );
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

    const course = await this.courseRepo.findOne({
      where: { courseId: courseId },
    });
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

    Object.assign(lesson, dto);

    return await this.lessonsRepo.save(lesson);
  }

  async remove(id: number): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);
    await this.lessonsRepo.delete(id);
    return {
      success: true,
      message: `Lesson with ID ${id} has been deleted successfully`,
    };
  }
}
