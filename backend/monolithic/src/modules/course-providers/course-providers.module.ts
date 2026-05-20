import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseProvider } from './entities/course-provider.entity';
@Module({
    imports: [TypeOrmModule.forFeature([CourseProvider])]
})
export class CourseProvidersModule {}
