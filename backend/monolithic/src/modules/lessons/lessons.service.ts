import {
  BadRequestException,
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

@Injectable()
export class LessonsService {
  constructor(
    private readonly lessonsRepo: LessonsRepository,

    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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
      const uploadedVideo = await this.cloudinaryService.uploadImage(file);
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
