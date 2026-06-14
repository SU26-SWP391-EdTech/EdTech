import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformSetting } from './entities/platform-setting.entity';
import { PlatformSettingsController } from './platform-settings.controller';
import { PlatformSettingsService } from './platform-settings.service';
import { PlatformSettingsRepository } from './platform-settings.repository';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
    imports: [TypeOrmModule.forFeature([PlatformSetting])],
    controllers: [PlatformSettingsController],
    providers: [
        PlatformSettingsService, 
        PlatformSettingsRepository,
        CloudinaryService
    ],
    exports: [
        PlatformSettingsService, 
        PlatformSettingsRepository,
        CloudinaryService
    ],
})
export class PlatformSettingsModule { }
