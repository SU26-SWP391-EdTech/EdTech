import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformSetting } from './entities/platform-setting.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PlatformSetting])]
})
export class PlatformSettingsModule {
}
