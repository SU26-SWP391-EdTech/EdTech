import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CourseProvidersService } from './course-providers.service';
import { CreateCourseProviderDto } from './dto/create-course-provider.dto';
import { UpdateCourseProviderDto } from './dto/update-course-provider.dto';

@Controller('course-providers')
export class CourseProvidersController {
  constructor(private readonly courseProvidersService: CourseProvidersService) {}

  @Post()
  create(@Body() createCourseProviderDto: CreateCourseProviderDto) {
    return this.courseProvidersService.create(createCourseProviderDto);
  }

  @Get()
  findAll() {
    return this.courseProvidersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseProvidersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseProviderDto: UpdateCourseProviderDto) {
    return this.courseProvidersService.update(+id, updateCourseProviderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseProvidersService.remove(+id);
  }
}
