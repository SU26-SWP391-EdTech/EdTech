import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CourseStatus } from 'src/common/enums/course.enum';
import { Course } from './entities/course.entity';
import { CoursesRepository } from './courses.repository';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { SearchCourseDto } from './dto/search-course.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CoursesService {
  constructor(
    private readonly coursesRepository: CoursesRepository,
    private cloudinaryService: CloudinaryService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

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
      const uploaded = await this.cloudinaryService.uploadFile(file);
      createCourseDto.thumbnailUrl = uploaded.secure_url;
    }

    return this.coursesRepository.createCourse({
      ...createCourseDto,
      user: courseProvider,
    });
  }

  async findAll(): Promise<Course[]> {
    return this.coursesRepository.findAllCourses();
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.coursesRepository.findCourseById(id);

    if (!course) {
      throw new NotFoundException(`Not found course with ID ${id}`);
    }

    return course;
  }

  async update(
    id: number,
    updateCourseDto: UpdateCourseDto,
    currentUserId: number,
  ): Promise<Course> {
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

    Object.assign(course, updateCourseDto);

    return this.coursesRepository.saveCourse(course);
  }

  async remove(id: number): Promise<{ message: string }> {
    const course = await this.findOne(id);
    const message = await this.coursesRepository.removeCourse(course);
    return { message };
  }

  public async approveCourse(id: number, reviewerId: number): Promise<Course> {
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

    course.status = CourseStatus.APPROVED;
    course.reviewedBy = reviewer;

    return this.coursesRepository.saveCourse(course);
  }

  public async rejectCourse(id: number, reviewerId: number): Promise<Course> {
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

    return this.coursesRepository.saveCourse(course);
  }
  // ==================== Search & Filter ====================

  async search(dto: SearchCourseDto) {
    const { data, total } = await this.coursesRepository.searchCourses(dto);

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
}
