import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { LearningPathsService } from './learning-paths.service';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { RoleEnum } from 'src/common/enums/role.enum';

@Controller('learning-paths')
export class LearningPathsController {
  constructor(private readonly learningPathsService: LearningPathsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.COURSE_PROVIDER)
  @Post()
  async create(
    @Body() createLearningPathDto: CreateLearningPathDto,
    @Req() req: any,
  ) {
    // req.user is attached by JwtAuthGuard
    return this.learningPathsService.create(createLearningPathDto, req.user);
  }
}
