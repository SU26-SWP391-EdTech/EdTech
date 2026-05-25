import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { CoursesModule } from './modules/courses/courses.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { LearnersModule } from './modules/learners/learners.module';
import { CourseProvidersModule } from './modules/course-providers/course-providers.module';
import { LearningPathsModule } from './modules/learning-paths/learning-paths.module';
import { OrganizationMemberProfilesModule } from './modules/organization-member-profiles/organization-member-profiles.module';
import { OrganizationRegistrationApplicationModule } from './modules/organization-registration-application/organization-registration-application.module';
import { JoinOrganizationApplicationModule } from './modules/join-organization-application/join-organization-application.module';
import { AuthModule } from './modules/auth/auth.module';
import { CommonModule } from './common/common.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { OrganizationsModule } from './modules/organizations/organizations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    CommonModule,
     // modules
    UsersModule,
    RolesModule,
    EnrollmentsModule,
    CoursesModule,
    LessonsModule,
    OrganizationsModule,
    LearnersModule,
    CourseProvidersModule,
    LearningPathsModule,
    OrganizationMemberProfilesModule,
    OrganizationRegistrationApplicationModule,
    JoinOrganizationApplicationModule,   
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
