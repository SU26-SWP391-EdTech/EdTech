import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { RoleEnum } from 'src/common/enums/role.enum';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Assessments')
@Controller('assessment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) { }

  @Post()
  @Roles(RoleEnum.COURSE_PROVIDER)
  @ApiOperation({ summary: 'Create a new assessment' })
  @ApiBody({ type: CreateAssessmentDto })
  @ApiResponse({ status: 201, description: 'Assessment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Course or Lesson not found' })
  async create(@Body() createAssessmentDto: CreateAssessmentDto) {
    return await this.assessmentService.createService(createAssessmentDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assessment detail by ID' })
  @ApiResponse({ status: 200, description: 'Assessment details retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Assessment not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.assessmentService.findOneService(id);
  }
}
