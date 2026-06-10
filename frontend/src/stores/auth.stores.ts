import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as loginApi, register as registerApi, verifyEmail as verifyEmailApi, logout as logoutApi } from '../services/auth/auth.service';
import type { User } from '../services/auth/auth.service';

export type { User };

export interface LoginResult {
    user: User;
    requiresPlatformSetup: boolean;
}

// Định nghĩa State và các Action trong Store
interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    requiresPlatformSetup: boolean;

    login: (credentials: { email: string; password: string }) => Promise<LoginResult>;
    register: (data: { fullName: string; email: string; password: string; roleName: string }) => Promise<void>;
    verifyEmail: (token: string) => Promise<void>;
    logout: () => Promise<void>;
    clearRequiresPlatformSetup: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            requiresPlatformSetup: false,

            // Action 1: Đăng nhập
            login: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    const data = await loginApi(credentials);
                    const { token, user, requiresPlatformSetup } = data;
                    const setupRequired = requiresPlatformSetup ?? false;

                    // Clear caches when logging in
                    sessionStorage.removeItem('explore_cache_enrollments');
                    sessionStorage.removeItem('explore_cache_enrolled_paths');

                    set({
                        token,
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                        requiresPlatformSetup: setupRequired,
                    });

                    return { user, requiresPlatformSetup: setupRequired };
                } catch (err: any) {
                    const errMsg = err.response?.data?.message || 'Failed to login. Please try again.';
                    set({ error: errMsg, isLoading: false });
                    throw new Error(errMsg);
                }
            },

            // Action 2: Đăng ký tài khoản mới
            register: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    await registerApi(data);

                    // Lưu email vào sessionStorage để hiển thị trên màn hình verify email
                    sessionStorage.setItem('registered_email', data.email);

                    set({ isLoading: false });
                } catch (err: any) {
                    const errMsg = err.response?.data?.message || 'Failed to register. Please try again.';
                    set({ error: errMsg, isLoading: false });
                    throw new Error(errMsg);
                }
            },

            // Action 2.5: Xác thực email
            verifyEmail: async (token) => {
                set({ error: null });
                try {
                    await verifyEmailApi(token);
                } catch (err: any) {
                    const errMsg = err.response?.data?.message || 'Failed to verify email. Please try again.';
                    set({ error: errMsg });
                    throw new Error(errMsg);
                }
            },

            clearRequiresPlatformSetup: () => {
                set({ requiresPlatformSetup: false });
            },

            // Action 3: Đăng xuất
            logout: async () => {
                // Clear state lập tức và đồng bộ ở Client để UI chuyển hướng ngay về trang login
                sessionStorage.removeItem('explore_cache_enrollments');
                sessionStorage.removeItem('explore_cache_enrolled_paths');
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null,
                    requiresPlatformSetup: false,
                });
            },
        }),
        {
            name: 'edtech-auth-storage', // Tên key lưu trữ trong localStorage
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                requiresPlatformSetup: state.requiresPlatformSetup,
            }),
        }
    )
);

// Lắng nghe sự kiện logout từ axios interceptor (khi gặp lỗi 401)
if (typeof window !== 'undefined') {
    window.addEventListener('auth:logout', () => {
        sessionStorage.removeItem('explore_cache_enrollments');
        sessionStorage.removeItem('explore_cache_enrolled_paths');
        useAuthStore.setState({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
            requiresPlatformSetup: false,
        });
    });
}
