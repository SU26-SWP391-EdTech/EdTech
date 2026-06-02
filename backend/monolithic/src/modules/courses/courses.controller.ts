import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, Req, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { SearchCourseDto } from './dto/search-course.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RoleEnum } from 'src/common/enums/role.enum';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';

@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    @Post()
    @UseInterceptors(FileInterceptor('thumbnailUrl'))
    create(@Req() req, @Body() createCourseDto: CreateCourseDto, @UploadedFile() file?: Express.Multer.File) {
        return this.coursesService.create(createCourseDto, req.user.id, file);
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

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleEnum.ACADEMIC_MANAGER)
    @Patch(':id/approve')
    public async approveCourse(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        return this.coursesService.approveCourse(id, req.user.userId);
    }

}
