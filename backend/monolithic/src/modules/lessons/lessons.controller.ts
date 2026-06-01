import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    UseGuards,
    UploadedFile,
    UseInterceptors,
    Req,
    Query,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { RoleEnum } from 'src/common/enums/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('lessons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LessonsController {
    constructor(private readonly lessonsService: LessonsService) { }


    @Post(':id')
    @Roles(RoleEnum.COURSE_PROVIDER)
    @UseInterceptors(FileInterceptor('videoUrl'))
    async create(@Param('id', ParseIntPipe) courseId: number, @Body() createLessonDto: CreateLessonDto, @UploadedFile() file?: Express.Multer.File) {
        return await this.lessonsService.create(courseId, createLessonDto, file);
    }

    @Get('course/:courseId')
    async findAllByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
        return await this.lessonsService.findAllByCourse(courseId);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.lessonsService.findOne(id);
    }


    @Patch(':courseId')
    @Roles(RoleEnum.COURSE_PROVIDER)
    @UseInterceptors(FileInterceptor('videoUrl'))
    async update(
        @Param('courseId', ParseIntPipe) courseId: number,
        @Query('lessonId', ParseIntPipe) lessonId: number,
        @Body() updateLessonDto: UpdateLessonDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return await this.lessonsService.update(courseId, lessonId, updateLessonDto, file);
    }

    @Delete(':id')
    @Roles(RoleEnum.COURSE_PROVIDER)
    async remove(@Param('id', ParseIntPipe) id: number) {
        return await this.lessonsService.remove(id);
    }
}
