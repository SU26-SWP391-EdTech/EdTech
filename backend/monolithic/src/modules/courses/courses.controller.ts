import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { SearchCourseDto } from './dto/search-course.dto';

@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

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
}
