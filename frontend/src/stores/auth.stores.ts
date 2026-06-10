import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as loginApi, register as registerApi, verifyEmail as verifyEmailApi, logout as logoutApi } from '../services/auth/auth.service';
import type { User } from '../services/auth/auth.service';

export type { User };

// Định nghĩa State và các Action trong Store
interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    requiresPlatformSetup: boolean;

    login: (credentials: { email: string; password: string }) => Promise<User>;
    register: (data: { fullName: string; email: string; password: string; roleName: string }) => Promise<void>;
    verifyEmail: (token: string) => Promise<void>;
    logout: () => Promise<void>;
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
                    const { token, user } = data;

                    set({
                        token,
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    return user;
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

            // Action 3: Đăng xuất
            logout: async () => {
                try {
                    await logoutApi();
                } catch (e) {
                    console.error('Failed to logout from backend:', e);
                } finally {
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        error: null,
                    });
                }
            },
        }),
        {
            name: 'edtech-auth-storage', // Tên key lưu trữ trong localStorage
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

// Lắng nghe sự kiện logout từ axios interceptor (khi gặp lỗi 401)
if (typeof window !== 'undefined') {
    window.addEventListener('auth:logout', () => {
        useAuthStore.setState({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
        });
    });
}
