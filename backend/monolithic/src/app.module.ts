import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { CoursesModule } from './modules/courses/courses.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { LearnersModule } from './modules/learners/learners.module';
import { LearningPathsModule } from './modules/learning-paths/learning-paths.module';
import { PlatformSettingsModule } from './modules/platform-settings/platform-settings.module';
import { AuthModule } from './modules/auth/auth.module';
import { CommonModule } from './common/common.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { MailModule } from './modules/mail/mail.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),

    // In 1 minute: Maximum 5 requests per user (or IP address)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 5,
      },
    ]),

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
    PlatformSettingsModule,
    AuthModule,
    MailModule,
    UsersModule,
    RolesModule,
    EnrollmentsModule,
    CoursesModule,
    LessonsModule,
    LearnersModule,
    LearningPathsModule,
    AuthModule,
    MailModule,
    CloudinaryModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
