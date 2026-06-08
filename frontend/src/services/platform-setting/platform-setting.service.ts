import api from '../../lib/axios';

export interface PlatformSetting {
    settingId: number;
    platformName: string;
    platformEmail: string;
    logoUrl: string | null;
    bannerUrl: string | null;
    description: string | null;
    createdAt: string;
}

export interface UpdatePlatformSettingDto {
    platformName?: string;
    platformEmail?: string;
    logoUrl?: string;
    bannerUrl?: string;
    description?: string;
}

// 1. Lấy thông tin cấu hình hệ thống (Yêu cầu quyền Admin)
export async function getPlatformSettings(): Promise<PlatformSetting> {
    const response = await api.get('/platform-settings');
    return response.data;
}

// 2. Cập nhật thông tin cấu hình hệ thống (Yêu cầu quyền Admin)
export async function updatePlatformSettings(data: UpdatePlatformSettingDto): Promise<PlatformSetting> {
    const response = await api.put('/platform-settings', data);
    return response.data;
}
