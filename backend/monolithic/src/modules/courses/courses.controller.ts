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
import { Public } from 'src/common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleEnum.COURSE_PROVIDER)
    @Post()
    @Roles(RoleEnum.COURSE_PROVIDER)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @UseInterceptors(FileInterceptor('thumbnailUrl'))
    @ApiOperation({ summary: 'Create a course' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: CreateCourseDto })
    @ApiResponse({ status: 201, description: 'Course created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid request data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    create(@Req() req, @Body() createCourseDto: CreateCourseDto, @UploadedFile() file?: Express.Multer.File) {
        return this.coursesService.create(createCourseDto, req.user.userId, file);
    }

    @Roles(RoleEnum.ACADEMIC_MANAGER, RoleEnum.COURSE_PROVIDER, RoleEnum.ADMIN)
    @Get()
    @ApiOperation({ summary: 'Get all courses' })
    @ApiResponse({ status: 200, description: 'All Courses returned successfully' })
    async findAllCourse(){
        return this.coursesService.findAll();
    }

    // Endpoint: GET /courses (Ví dụ: GET /courses?search=javascript&page=1&limit=5)

    @Public()
    @Get('search')
    @ApiOperation({ summary: 'Search courses' })
    @ApiResponse({ status: 200, description: 'Courses returned successfully' })
    async search(@Query() query: SearchCourseDto) {
        return this.coursesService.search(query);
    }

    // Endpoint: GET /courses/:id
    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Get course detail' })
    @ApiResponse({ status: 200, description: 'Course returned successfully' })
    @ApiResponse({ status: 404, description: 'Course not found' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.coursesService.findOne(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Patch(':id')
    @Roles(RoleEnum.COURSE_PROVIDER, RoleEnum.ACADEMIC_MANAGER)
    @UseInterceptors(FileInterceptor('thumbnailUrl'))
    @ApiOperation({ summary: 'Update a course' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: UpdateCourseDto })
    @ApiResponse({ status: 200, description: 'Course updated successfully' })
    @ApiResponse({ status: 400, description: 'Invalid request data' })
    @ApiResponse({ status: 404, description: 'Course not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCourseDto: UpdateCourseDto,
        @Req() req,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.coursesService.update(id, updateCourseDto, req.user.userId, file);
    }

    @Delete(':id')
    @Roles(RoleEnum.COURSE_PROVIDER, RoleEnum.ACADEMIC_MANAGER)
    @ApiOperation({ summary: 'Delete a course' })
    @ApiResponse({ status: 200, description: 'Course deleted successfully' })
    @ApiResponse({ status: 404, description: 'Course not found' })
    remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('userId') userId: number) {
        return this.coursesService.remove(id, userId);
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
