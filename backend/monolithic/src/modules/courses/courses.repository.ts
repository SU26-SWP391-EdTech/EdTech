import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { SearchCourseDto } from './dto/search-course.dto';

@Injectable()
export class CoursesRepository extends Repository<Course> {
    constructor(private dataSource: DataSource) {
        super(Course, dataSource.createEntityManager());
    }

    // ==================== CRUD Operations ====================

    public async createCourse(data: Partial<Course>): Promise<Course> {
        const course = this.create(data);
        return await this.save(course);
    }

    public async findAllCourses(): Promise<Course[]> {
        return await this.find({
            relations: ['user'],
        });
    }

    public async findCourseById(id: number): Promise<Course | null> {
        return await this.findOne({
            where: { courseId: id },
            relations: ['user', 'lessons'],
        });
    }

    public async saveCourse(course: Course): Promise<Course> {
        return await this.save(course);
    }

    public async removeCourse(course: Course): Promise<string> {
        await this.remove(course);
        return `Course ID ${course.courseId} has been deleted`;
    }

    // ==================== Search & Filter ====================

    async searchCourses(dto: SearchCourseDto): Promise<{ data: Course[]; total: number }> {
        const {
            search,
            status,
            language,
            minDuration,
            maxDuration,
            sortBy = 'createdAt',
            sortOrder = 'DESC',
        } = dto;

        // Tạo QueryBuilder với tên alias là 'course'
        const queryBuilder = this.createQueryBuilder('course');

        // Nạp thêm các quan hệ cần hiển thị (ví dụ: thông tin người tạo, tổ chức)
        queryBuilder
            .leftJoin('course.user', 'user')
            .addSelect(['user.userId', 'user.fullName', 'user.avatar'])

        // 1. Tìm kiếm text động theo Title hoặc Description (không phân biệt chữ hoa chữ thường)
        if (search) {
            queryBuilder.andWhere(
                '(LOWER(course.title) LIKE LOWER(:search) OR LOWER(course.description) LIKE LOWER(:search))',
                { search: `%${search}%` },
            );
        }

        // 2. Lọc chính xác theo Status
        if (status) {
            queryBuilder.andWhere('course.status = :status', { status });
        }

        // 3. Lọc theo ngôn ngữ
        if (language) {
            queryBuilder.andWhere('LOWER(course.language) = LOWER(:language)', { language });
        }

        // 4. Lọc theo khoảng thời lượng (min - max duration)
        if (minDuration !== undefined) {
            queryBuilder.andWhere('course.duration >= :minDuration', { minDuration });
        }
        if (maxDuration !== undefined) {
            queryBuilder.andWhere('course.duration <= :maxDuration', { maxDuration });
        }

        // 5. Sắp xếp động
        // Đảm bảo tránh lỗi SQL Injection bằng cách kiểm tra thuộc tính hợp lệ trước khi order
        const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'duration', 'enrollmentCount'];
        const actualSortBy = allowedSortFields.includes(sortBy) ? `course.${sortBy}` : 'course.createdAt';
        queryBuilder.orderBy(actualSortBy, sortOrder);

        // Thực thi câu lệnh SQL và trả về cả dữ liệu cùng tổng số dòng thỏa mãn (phục vụ phân trang frontend)
        const [data, total] = await queryBuilder.getManyAndCount();

        return { data, total };
    }

    async findDetail(id: number): Promise<Course | null> {
        return this.createQueryBuilder('course')
            .leftJoin('course.user', 'user')
            .addSelect(['user.userId', 'user.fullName', 'user.email', 'user.avatar'])
            .leftJoinAndSelect('course.lessons', 'lessons')
            .where('course.courseId = :id', { id })
            .getOne();
    }
}
