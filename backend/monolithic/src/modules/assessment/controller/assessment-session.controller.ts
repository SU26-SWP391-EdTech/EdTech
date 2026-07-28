import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { AssessmentSessionService } from '../service/assessment-session.service';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { RoleEnum } from 'src/common/enums/role.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

import type { JwtPayloadUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Assessment-session')
@Controller('assessment-session')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssessmentSessionController {
  constructor(
    private readonly assessmentSessionService: AssessmentSessionService,
  ) {}

  @Get(':id')
  @Roles(RoleEnum.LEARNER)
  @ApiOperation({ summary: 'Get assessment session of learner' })
  
  async getAssessmentSessionById(
    @Param('id', ParseIntPipe)
    sessionId: number,

    @CurrentUser()
    user: JwtPayloadUser,
  ) {
    return this.assessmentSessionService.findAssessSessionByUserId(
      user.userId,
      sessionId,
    );
  }
}
