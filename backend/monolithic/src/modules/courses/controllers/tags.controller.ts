import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { RoleEnum } from 'src/common/enums/role.enum';
import {
  BrowseCoursesByTagDto,
  CreateTagDto,
} from '../dto/course-tags.dto';
import { TagsService } from '../services/tags.service';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({ status: 200, description: 'Tags returned successfully' })
  findAll() {
    return this.tagsService.findAll();
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search tags' })
  @ApiResponse({ status: 200, description: 'Tags returned successfully' })
  search(@Query('keyword') keyword?: string) {
    return this.tagsService.search(keyword);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.ACADEMIC_MANAGER)
  @Post()
  @ApiOperation({ summary: 'Create a tag' })
  @ApiResponse({ status: 201, description: 'Tag created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or duplicate tag name' })
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @Public()
  @Get(':id/courses')
  @ApiOperation({ summary: 'Browse approved courses by tag' })
  @ApiResponse({ status: 200, description: 'Courses returned successfully' })
  browseCourses(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: BrowseCoursesByTagDto,
  ) {
    return this.tagsService.browseCourses(id, query);
  }
}
