import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CoursesRepository } from './courses.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([Course]), // Đăng ký Entity với TypeORM
    ],
    controllers: [
        CoursesController, // Khai báo Controller
    ],
    providers: [
        CoursesService,    // Khai báo Service
        CoursesRepository, // Đăng ký Custom Repository như một Provider
    ],
    exports: [
        CoursesService,    // Export nếu các module khác cần sử dụng
    ],
})
export class CoursesModule { }
