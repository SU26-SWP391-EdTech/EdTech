import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Course])]
})
export class CoursesModule {}
