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
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    @Post()
    @UseInterceptors(FileInterceptor('thumbnailUrl'))
    @ApiOperation({ summary: 'Create a course' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: CreateCourseDto })
    @ApiResponse({ status: 201, description: 'Course created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid request data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    create(@Req() req, @Body() createCourseDto: CreateCourseDto, @UploadedFile() file?: Express.Multer.File) {
        return this.coursesService.create(createCourseDto, req.user.id, file);
    }

    // Endpoint: GET /courses (Ví dụ: GET /courses?search=javascript&page=1&limit=5)
    @Get()
    @ApiOperation({ summary: 'Search courses' })
    @ApiResponse({ status: 200, description: 'Courses returned successfully' })
    async search(@Query() query: SearchCourseDto) {
        return this.coursesService.search(query);
    }

    // Endpoint: GET /courses/:id
    @Get(':id')
    @ApiOperation({ summary: 'Get course detail' })
    @ApiResponse({ status: 200, description: 'Course returned successfully' })
    @ApiResponse({ status: 404, description: 'Course not found' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.coursesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a course' })
    @ApiResponse({ status: 200, description: 'Course updated successfully' })
    @ApiResponse({ status: 400, description: 'Invalid request data' })
    @ApiResponse({ status: 404, description: 'Course not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCourseDto: UpdateCourseDto,
    ) {
        return this.coursesService.update(id, updateCourseDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a course' })
    @ApiResponse({ status: 200, description: 'Course deleted successfully' })
    @ApiResponse({ status: 404, description: 'Course not found' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.coursesService.remove(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleEnum.ACADEMIC_MANAGER)
    @Patch(':id/approve')
    @ApiOperation({ summary: 'Approve a course' })
    @ApiResponse({ status: 200, description: 'Course approved successfully' })
    @ApiResponse({ status: 400, description: 'Course is not in pending status or missing lessons' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - requires Academic Manager role' })
    @ApiResponse({ status: 404, description: 'Course or Reviewer not found' })
    public async approveCourse(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        return this.coursesService.approveCourse(id, req.user.userId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleEnum.ACADEMIC_MANAGER)
    @Patch(':id/reject')
    @ApiOperation({ summary: 'Reject a course' })
    @ApiResponse({ status: 200, description: 'Course rejected successfully' })
    @ApiResponse({ status: 400, description: 'Course is not in pending status' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - requires Academic Manager role' })
    @ApiResponse({ status: 404, description: 'Course or Reviewer not found' })
    public async rejectCourse(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        return this.coursesService.rejectCourse(id, req.user.userId);
    }

}
