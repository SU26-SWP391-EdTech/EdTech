import { instance } from '../libs/axios';
import type { LoginPayload, LoginResponse, MeResponse } from '../types/auth.types';

export const authService = {
  login: async (payload: LoginPayload) => {
    const { data } = await instance.post<LoginResponse>('/auth/login', payload);
    return data;
  },

  logout: async () => {
    const { data } = await instance.post<{ success: boolean; message: string }>(
      '/auth/logout',
    );
    return data;
  },

  getMe: async () => {
    const { data } = await instance.get<MeResponse>('/auth/me');
    return data;
  },
};
