import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseProvider } from './entities/course-provider-profile.entity';
import { User } from '../users/entities/user.entity';
import { CourseProviderController } from './course-providers.controller';
import { CourseProviderService } from './course-providers.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UsersService } from '../users/users.service';
import { Role } from '../roles/entities/role.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CourseProvider, User, Role])],
    controllers: [CourseProviderController],
    providers: [CourseProviderService, CloudinaryService, UsersService],
})
export class CourseProvidersModule {}