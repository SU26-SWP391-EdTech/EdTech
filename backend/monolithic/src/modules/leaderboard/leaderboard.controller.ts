import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { CreateLeaderboardRuleDto } from './dto/create-leaderboard-rule.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { RoleEnum } from 'src/common/enums/role.enum';
import { UpdateLeaderboardRuleDto } from './dto/update-leaderboard-rule.dto';

@ApiTags('LeaderboardRule')
@Controller('leaderboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Roles(RoleEnum.ACADEMIC_MANAGER)
  @Post('course/:courseId')
  @ApiOperation({
    summary: 'Create leaderboard rule for a course',
  })
  @ApiParam({
    name: 'courseId',
    type: Number,
    description: 'ID of the course',
    example: 1,
  })
  @ApiBody({
    type: CreateLeaderboardRuleDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Leaderboard rule created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Leaderboard rule already exists for this course',
  })
  @ApiBearerAuth()
  async createLeaderboardRule(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: CreateLeaderboardRuleDto,
  ) {
    return await this.leaderboardService.createLeaderboardRule(courseId, dto);
  }

  @Roles(RoleEnum.ACADEMIC_MANAGER, RoleEnum.COURSE_PROVIDER)
  @Get('courses/:courseId/leaderboard-rule')
  @ApiOperation({ summary: 'Get leaderboard rule' })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard rule retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Leaderboard rule not found',
  })
  async getLeaderboardRule(@Param('courseId', ParseIntPipe) courseId: number) {
    return await this.leaderboardService.getLeaderboardRule(courseId);
  }

  @Roles(RoleEnum.ACADEMIC_MANAGER)
  @Patch('courses/:courseId/leaderboard-rule')
  @ApiOperation({ summary: 'Update leaderboard rule' })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard rule updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Leaderboard rule not found',
  })
  async updateLeaderboardRule(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: UpdateLeaderboardRuleDto,
  ) {
    return await this.leaderboardService.updateLeaderboardRule(courseId, dto);
  }

  @Get('course/:courseId')
  @Roles(RoleEnum.LEARNER, RoleEnum.ACADEMIC_MANAGER, RoleEnum.ADMIN, RoleEnum.COURSE_PROVIDER)
  @ApiOperation({
    summary: 'Get leaderboard for a specific course',
  })
  @ApiParam({
    name: 'courseId',
    type: Number,
    description: 'ID of the course',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Course leaderboard retrieved successfully',
  })
  @ApiBearerAuth()
  async getCourseLeaderboard(@Param('courseId', ParseIntPipe) courseId: number) {
    return await this.leaderboardService.getCourseLeaderboard(courseId);
  }

  @Get()
  @Roles(RoleEnum.LEARNER, RoleEnum.ACADEMIC_MANAGER, RoleEnum.ADMIN, RoleEnum.COURSE_PROVIDER)
  @ApiOperation({
    summary: 'Get overall leaderboard',
  })
  @ApiResponse({
    status: 200,
    description: 'Overall leaderboard retrieved successfully',
  })
  @ApiBearerAuth()
  async getLeaderboard() {
    return await this.leaderboardService.getLeaderboard();
  }
}
