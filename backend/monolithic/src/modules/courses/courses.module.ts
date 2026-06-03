import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CoursesRepository } from './courses.repository';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { User } from '../users/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Course, User]), // Đăng ký Entity với TypeORM
    ],
    controllers: [
        CoursesController, // Khai báo Controller
    ],
    providers: [
        CoursesService,    // Khai báo Service
        CoursesRepository,
        CloudinaryService, // Đăng ký Custom Repository như một Provider
    ],
    exports: [
        CoursesService,    // Export nếu các module khác cần sử dụng
        CoursesRepository
    ],
})
export class CoursesModule { }
