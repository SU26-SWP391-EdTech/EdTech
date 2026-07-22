import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LearnerStreakService } from '../services/learner-streak.service';

@ApiTags('Learner Streak')
@Controller('learner-streak')
export class LearnerStreakController {
  constructor(
    private readonly learnerStreakService: LearnerStreakService,
  ) {}

  @Get(':userId')
  @ApiOperation({
    summary: 'Get current streak of a learner',
    description:
      'Returns the learner’s current streak based on completed eligible assessments.',
  })
  @ApiParam({
    name: 'userId',
    type: Number,
    description: 'Learner ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Current streak retrieved successfully.',
    schema: {
      example: 7,
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Learner not found.',
    schema: {
      example: {
        statusCode: 404,
        message: 'Learner 1 not found',
        error: 'Not Found',
      },
    },
  })
  async getCurrentStreak(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.learnerStreakService.getCurrentStreak(userId);
  }
}