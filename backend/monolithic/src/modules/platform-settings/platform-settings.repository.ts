import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PlatformSetting } from "./entities/platform-setting.entity";
import { UpdatePlatformSettingDto } from "./dto/update-platform-setting.dto";

@Injectable()
export class PlatformSettingsRepository {
    constructor(
        @InjectRepository(PlatformSetting)
        private readonly repository: Repository<PlatformSetting>
    ) {}

    public async getPlatformSetting(): Promise<PlatformSetting | null> {
        const settings = await this.repository.find({
            take: 1,
            order: { settingId: 'ASC' }
        });
        return settings.length > 0 ? settings[0] : null;
    }

    public async createDefaultSetting(): Promise<PlatformSetting> {
        const defaultSetting = this.repository.create({
            platformName: 'EdTech Platform',
            platformEmail: 'admin@edtech.com',
            description: 'Mô tả hệ thống EdTech',
        });
        return this.repository.save(defaultSetting);
    }

    public async updatePlatformSetting(settingId: number, data: UpdatePlatformSettingDto): Promise<PlatformSetting> {
        await this.repository.update(settingId, data);
        const updated = await this.repository.findOne({ where: { settingId } });
        return updated as PlatformSetting;
    }
}