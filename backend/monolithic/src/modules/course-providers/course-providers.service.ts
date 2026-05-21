import { Injectable } from '@nestjs/common';
import { CreateCourseProviderDto } from './dto/create-course-provider.dto';
import { UpdateCourseProviderDto } from './dto/update-course-provider.dto';

@Injectable()
export class CourseProvidersService {
  create(createCourseProviderDto: CreateCourseProviderDto) {
    return 'This action adds a new courseProvider';
  }

  findAll() {
    return `This action returns all courseProviders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} courseProvider`;
  }

  update(id: number, updateCourseProviderDto: UpdateCourseProviderDto) {
    return `This action updates a #${id} courseProvider`;
  }

  remove(id: number) {
    return `This action removes a #${id} courseProvider`;
  }
}
