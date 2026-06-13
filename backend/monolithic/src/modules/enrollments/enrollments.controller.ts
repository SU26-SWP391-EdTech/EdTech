import { Controller, Post, Body, Get, Param, ParseIntPipe, UseGuards, Patch } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollCourseDto } from './dto/enroll-course.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayloadUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Enrollments')
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
    constructor(private readonly enrollmentsService: EnrollmentsService) { }
    //enroll course
    @Post('enroll/:id')
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @ApiOperation({ summary: 'Enroll current user in a course' })
    @ApiResponse({ status: 201, description: 'Enrollment created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid request data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Course not found' })
    async enroll(@CurrentUser() user: JwtPayloadUser, @Param('id', ParseIntPipe) id: number) {
        return await this.enrollmentsService.enrollCourse(user.userId, id);
    }
    //get my enrollments
    @Get('myenrollments')
    @ApiOperation({ summary: 'Get current user enrollments' })
    @ApiResponse({ status: 200, description: 'Enrollments returned successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getMyEnrollments(@CurrentUser() user: JwtPayloadUser) {
        return await this.enrollmentsService.getMyEnrollments(user.userId);
    }
    //get enrollment detail
    @Get('course/:courseId')
    @ApiOperation({ summary: 'Get enrollment detail by course' })
    @ApiResponse({ status: 200, description: 'Enrollment detail returned successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Enrollment or course not found' })
    async getEnrollmentDetail(
        @CurrentUser() user: JwtPayloadUser,
        @Param('courseId', ParseIntPipe) courseId: number,
    ) {
        return await this.enrollmentsService.getEnrollmentDetail(user.userId, courseId);
    }

}
