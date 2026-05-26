import { create } from 'zustand';
import { authService } from '../services/auth.service';
import type { AuthUser, LoginPayload } from '../types/auth.types';

const AUTH_KEY = 'auth';

interface StoredAuth {
  user: AuthUser;
  token: string;
  rememberMe: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  rememberMe: boolean;
  login: (payload: LoginPayload, rememberMe: boolean) => Promise<AuthUser>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  clearAuth: () => void;
}

const readStorage = (): StoredAuth | null => {
  const raw =
    localStorage.getItem(AUTH_KEY) ?? sessionStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
};

const writeStorage = (data: StoredAuth | null) => {
  localStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_KEY);
  if (!data) return;

  const storage = data.rememberMe ? localStorage : sessionStorage;
  storage.setItem(AUTH_KEY, JSON.stringify(data));
};

export const getPostLoginPath = (roleName: string) => {
  if (roleName === 'admin') return '/admin';
  return '/admin';
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  rememberMe: false,

  login: async (payload, rememberMe) => {
    set({ isLoading: true });
    try {
      const data = await authService.login(payload);
      writeStorage({
        user: data.user,
        token: data.token,
        rememberMe,
      });
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        rememberMe,
        isLoading: false,
      });
      return data.user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      get().clearAuth();
    }
  },

  hydrate: async () => {
    const stored = readStorage();
    if (!stored?.token) return;

    set({
      user: stored.user,
      token: stored.token,
      isAuthenticated: true,
      rememberMe: stored.rememberMe,
    });

    try {
      const data = await authService.getMe();
      set({ user: data.user });
    } catch {
      get().clearAuth();
    }
  },

  clearAuth: () => {
    writeStorage(null);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      rememberMe: false,
    });
  },
}));
