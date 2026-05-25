import { Injectable, NotFoundException } from '@nestjs/common';
import { CoursesRepository } from './courses.repository';
import { SearchCourseDto } from './dto/search-course.dto';

@Injectable()
export class CoursesService {
    constructor(
        private readonly coursesRepository: CoursesRepository,
    ) { }

    async search(dto: SearchCourseDto) {
        const { data, total } = await this.coursesRepository.searchCourses(dto);

        return {
            statusCode: 200,
            message: 'Lấy danh sách khóa học thành công',
            data: {
                items: data,
                meta: {
                    total: total,
                    count: data.length,
                },
            },
        };
    }

    async findOne(id: number) {
        const course = await this.coursesRepository.findDetail(id);


        if (!course) {
            throw new NotFoundException(`Không tìm thấy khóa học với ID ${id}`);
        }

        return course;
    }
}
