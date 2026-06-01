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
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { RoleName } from 'src/common/constants/role.constants';

@Controller('lessons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LessonsController {
    constructor(private readonly lessonsService: LessonsService) { }


    @Post()
    @Roles(RoleName.COURSE_PROVIDER)
    async create(@Body() createLessonDto: CreateLessonDto) {
        return await this.lessonsService.create(createLessonDto);
    }

    @Get('course/:courseId')
    async findAllByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
        return await this.lessonsService.findAllByCourse(courseId);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.lessonsService.findOne(id);
    }


    @Patch(':id')
    @Roles(RoleName.COURSE_PROVIDER)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateLessonDto: UpdateLessonDto,
    ) {
        return await this.lessonsService.update(id, updateLessonDto);
    }

    @Delete(':id')
    @Roles(RoleName.COURSE_PROVIDER)
    async remove(@Param('id', ParseIntPipe) id: number) {
        return await this.lessonsService.remove(id);
    }
}
