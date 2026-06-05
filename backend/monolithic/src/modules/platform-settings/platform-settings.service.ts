import { Injectable } from "@nestjs/common";
import { PlatformSettingsRepository } from "./platform-settings.repository";
import { PlatformSetting } from "./entities/platform-setting.entity";
import { UpdatePlatformSettingDto } from "./dto/update-platform-setting.dto";

@Injectable()
export class PlatformSettingsService {
    constructor(private readonly platformSettingsRepository: PlatformSettingsRepository) {}

    public async getSettings(): Promise<PlatformSetting> {
        let setting = await this.platformSettingsRepository.getPlatformSetting();
        if (!setting) {
            setting = await this.platformSettingsRepository.createDefaultSetting();
        }
        return setting;
    }

    public async updateSettings(updateDto: UpdatePlatformSettingDto): Promise<PlatformSetting> {
        let setting = await this.platformSettingsRepository.getPlatformSetting();
        if (!setting) {
            setting = await this.platformSettingsRepository.createDefaultSetting();
        }
        return this.platformSettingsRepository.updatePlatformSetting(setting.settingId, updateDto);
    }
}