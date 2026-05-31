import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { SearchCourseDto } from './dto/search-course.dto';

@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    @Post()
    create(@Body() createCourseDto: CreateCourseDto) {
        // Trong thực tế, sau khi tích hợp Authentication, userId sẽ được lấy từ JWT Token
        // Ví dụ: @Req() req -> userId = req.user.id
        // Tạm thời mình hardcode userId = 1 để test chức năng tạo khóa học
        const mockUserId = 1;
        return this.coursesService.create(createCourseDto, mockUserId);
    }

    // Endpoint: GET /courses (Ví dụ: GET /courses?search=javascript&page=1&limit=5)
    @Get()
    async search(@Query() query: SearchCourseDto) {
        return this.coursesService.search(query);
    }

    // Endpoint: GET /courses/:id
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.coursesService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCourseDto: UpdateCourseDto,
    ) {
        return this.coursesService.update(id, updateCourseDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.coursesService.remove(id);
    }
}
