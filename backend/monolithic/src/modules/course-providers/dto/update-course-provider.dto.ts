import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseProviderDto } from './create-course-provider.dto';

export class UpdateCourseProviderDto extends PartialType(CreateCourseProviderDto) {}
