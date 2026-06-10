import { Injectable, NotFoundException } from "@nestjs/common";
import { PlatformSettingsRepository } from "./platform-settings.repository";
import { PlatformSetting } from "./entities/platform-setting.entity";
import { UpdatePlatformSettingDto } from "./dto/update-platform-setting.dto";
import { CreatePlatformSettingDto } from "./dto/create-platform-setting.dto";
import { CloudinaryService } from "../cloudinary/cloudinary.service";

@Injectable()
export class PlatformSettingsService {
    constructor(private readonly platformSettingsRepository: PlatformSettingsRepository,
        private cloudinaryService:CloudinaryService,
    ) {}

    public async createSetting(dto: CreatePlatformSettingDto, files?:{
        logoUrl?: Express.Multer.File[];
        bannerUrl?: Express.Multer.File[];
      }): Promise<PlatformSetting> 
    {
        const logoFile = files?.logoUrl?.[0];
        const bannerFile = files?.bannerUrl?.[0];

        if(logoFile){
            const uploadedLogo = this.cloudinaryService.uploadImage(logoFile);
            dto.logoUrl = (await uploadedLogo).secure_url;
        }

        if(bannerFile){
            const uploadedBanner = this.cloudinaryService.uploadImage(bannerFile);
            dto.bannerUrl = (await uploadedBanner).secure_url;
        }

        return this.platformSettingsRepository.createSetting(dto);
    }

    public async isConfigured(): Promise<boolean> {
        const setting = await this.platformSettingsRepository.getPlatformSetting();
        return setting !== null;
    }

    public async getSettings(): Promise<PlatformSetting> {
        const setting = await this.platformSettingsRepository.getPlatformSetting();
        if (!setting) {
            throw new NotFoundException('Platform setting not found');
        }
        return setting;
    }

    public async updateSettings(
        updateDto: UpdatePlatformSettingDto,
        files?: {
            logoUrl?: Express.Multer.File[];
            bannerUrl?: Express.Multer.File[];
        },
    ): Promise<PlatformSetting> {
        const setting = await this.platformSettingsRepository.getPlatformSetting();
        if (!setting) {
            throw new NotFoundException('Platform setting not found');
        }

        const logoFile = files?.logoUrl?.[0];
        const bannerFile = files?.bannerUrl?.[0];

        if (logoFile) {
            const uploadedLogo = this.cloudinaryService.uploadImage(logoFile);
            updateDto.logoUrl = (await uploadedLogo).secure_url;
        }

        if (bannerFile) {
            const uploadedBanner = this.cloudinaryService.uploadImage(bannerFile);
            updateDto.bannerUrl = (await uploadedBanner).secure_url;
        }

        return this.platformSettingsRepository.updatePlatformSetting(setting.settingId, updateDto);
    }
}