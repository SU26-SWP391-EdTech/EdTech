import { Injectable, NotFoundException } from '@nestjs/common';
import { Course } from './entities/course.entity';
import { CoursesRepository } from './courses.repository';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { SearchCourseDto } from './dto/search-course.dto';

@Injectable()
export class CoursesService {
    constructor(
        private readonly coursesRepository: CoursesRepository,
    ) { }

    async create(createCourseDto: CreateCourseDto, userId: number): Promise<Course> {
        return this.coursesRepository.createCourse({
            ...createCourseDto,
            user: { userId } as any,
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

    async update(id: number, updateCourseDto: UpdateCourseDto): Promise<Course> {
        const course = await this.findOne(id);
        const { ...otherUpdates } = updateCourseDto;
        Object.assign(course, otherUpdates);

        return this.coursesRepository.saveCourse(course);
    }

    async remove(id: number): Promise<{ message: string }> {
        const course = await this.findOne(id);
        const message = await this.coursesRepository.removeCourse(course);
        return { message };
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
