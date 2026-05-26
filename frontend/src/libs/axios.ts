import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

const apiBaseUrl =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? '' : 'http://localhost:5002');

export const instance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url as string | undefined;
      const isAuthRoute =
        url?.includes('/auth/login') || url?.includes('/auth/register');
      if (!isAuthRoute) {
        useAuthStore.getState().clearAuth();
      }
    }
    return Promise.reject(error);
  },
);
