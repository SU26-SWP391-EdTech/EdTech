import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformSetting } from './entities/platform-setting.entity';
import { PlatformSettingsController } from './platform-settings.controller';
import { PlatformSettingsService } from './platform-settings.service';
import { PlatformSettingsRepository } from './platform-settings.repository';

@Module({
    imports: [TypeOrmModule.forFeature([PlatformSetting])],
    controllers: [PlatformSettingsController],
    providers: [
        PlatformSettingsService, 
        PlatformSettingsRepository
    ],
    exports: [
        PlatformSettingsService, 
        PlatformSettingsRepository
    ],
})
export class PlatformSettingsModule { }
