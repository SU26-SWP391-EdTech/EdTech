import { Controller, Post, Body, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollCourseDto } from './dto/enroll-course.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayloadUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
    constructor(private readonly enrollmentsService: EnrollmentsService) { }
    //enroll course
    @Post('enroll')
    async enroll(@CurrentUser() user: JwtPayloadUser, @Body() dto: EnrollCourseDto) {
        return await this.enrollmentsService.enrollCourse(user.userId, dto);
    }
    //get my enrollments
    @Get('my')
    async getMyEnrollments(@CurrentUser() user: JwtPayloadUser) {
        return await this.enrollmentsService.getMyEnrollments(user.userId);
    }
    //get enrollment detail
    @Get('course/:courseId')
    async getEnrollmentDetail(
        @CurrentUser() user: JwtPayloadUser,
        @Param('courseId', ParseIntPipe) courseId: number,
    ) {
        return await this.enrollmentsService.getEnrollmentDetail(user.userId, courseId);
    }
}
