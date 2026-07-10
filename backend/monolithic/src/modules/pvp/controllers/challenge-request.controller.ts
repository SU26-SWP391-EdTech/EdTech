import { Controller, Post, Get, Param, Body, Req, UseGuards, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ChallengeRequestService } from '../services/challenge-request.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RoleEnum } from 'src/common/enums/role.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayloadUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Challenge Requests')
@ApiBearerAuth()
@Controller('challenge_request')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChallengeRequestController {
  constructor(private readonly challengeRequestService: ChallengeRequestService) { }

  @Post()
  @Roles(RoleEnum.LEARNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find or create a matchmaking challenge request' })
  @ApiResponse({ status: 200, description: 'Matched or created a challenge request successfully' })
  async findMatch(
    @CurrentUser()
    user: JwtPayloadUser,

    @Body('assessmentId', ParseIntPipe)
    assessmentId: number,
  ) {
    return this.challengeRequestService.findOrCreateChallenge(user.userId, assessmentId);
  }

  @Get(':challengeId')
  @Roles(RoleEnum.LEARNER)
  @ApiOperation({ summary: 'Get status of a challenge request' })
  @ApiResponse({ status: 200, description: 'Challenge request status returned successfully' })
  @ApiResponse({ status: 404, description: 'Challenge request not found' })
  async getStatus(
    @CurrentUser()
    user: JwtPayloadUser,

    @Param('challengeId', ParseIntPipe)
    challengeId: number,
  ) {
    return this.challengeRequestService.getChallengeStatus(challengeId, user.userId);
  }

  @Post(':challengeId/cancel')
  @Roles(RoleEnum.LEARNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a pending challenge request' })
  @ApiResponse({ status: 200, description: 'Challenge request cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel the request (unauthorized or not pending)' })
  @ApiResponse({ status: 404, description: 'Challenge request not found' })
  async cancelMatch(
    @CurrentUser()
    user: JwtPayloadUser,

    @Param('challengeId', ParseIntPipe)
    challengeId: number,
  ) {
    return this.challengeRequestService.cancelChallenge(challengeId, user.userId);
  }
}
