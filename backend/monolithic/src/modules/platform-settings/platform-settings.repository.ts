import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PlatformSetting } from "./entities/platform-setting.entity";
import { UpdatePlatformSettingDto } from "./dto/update-platform-setting.dto";
import { CreatePlatformSettingDto } from "./dto/create-platform-setting.dto";

@Injectable()
export class PlatformSettingsRepository {
    constructor(
        @InjectRepository(PlatformSetting)
        private readonly repository: Repository<PlatformSetting>
    ) {}

    public async createSetting(data: CreatePlatformSettingDto): Promise<PlatformSetting>{
        const existing = await this.getPlatformSetting();
        if (existing) {
            throw new ConflictException('Platform setting already exists');
        }

        const created = await this.repository.create({
            platformName: data.platformName,
            platformEmail: data.platformEmail,
            logoUrl: data.logoUrl,
            bannerUrl: data.bannerUrl,
            description: data.description
        })
        return created as PlatformSetting;
    }

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