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

export async function getPlatformSettingsStatus(): Promise<{ configured: boolean }> {
  const res = await api.get('/platform-settings/status');
  return res.data;
}

export async function getPlatformSettings(): Promise<PlatformSetting> {
  const res = await api.get('/platform-settings');
  return res.data;
}

export async function createPlatformSettings(formData: FormData | any): Promise<PlatformSetting> {
  const isFormData = formData instanceof FormData;
  const res = await api.post('/platform-settings', formData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
  return res.data;
}

export async function updatePlatformSettings(formData: FormData | any): Promise<PlatformSetting> {
  const isFormData = formData instanceof FormData;
  const res = await api.put('/platform-settings', formData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
  return res.data;
}