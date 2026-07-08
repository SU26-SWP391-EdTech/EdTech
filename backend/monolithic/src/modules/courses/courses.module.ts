import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CoursesController } from './controllers/courses.controller';
import { TagsController } from './controllers/tags.controller';
import { CoursesService } from './services/courses.service';
import { TagsService } from './services/tags.service';
import { CoursesRepository } from './repositories/courses.repository';
import { TagsRepository } from './repositories/tags.repository';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { User } from '../users/entities/user.entity';
import { Tag } from './entities/tag.entity';
import { CourseTag } from './entities/course-tag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, User, Tag, CourseTag]), // Đăng ký Entity với TypeORM
  ],
  controllers: [
    CoursesController, // Khai báo Controller
    TagsController,
  ],
  providers: [
    CoursesService,    // Khai báo Service
    TagsService,
    CoursesRepository,
    TagsRepository,
    CloudinaryService, // Đăng ký Custom Repository như một Provider
  ],
  exports: [
    CoursesService,    // Export nếu các module khác cần sử dụng
    CoursesRepository
  ],
})
export class CoursesModule { }
