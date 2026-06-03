import { create } from 'zustand';
import api from '../services/api';

// Định nghĩa cấu trúc User nhận về từ Backend
export interface User {
    userId: number;
    email: string;
    fullName: string;
    roleId: number;
    roleName: 'learner' | 'course provider' | 'admin' | 'academic manager';
    avatarUrl: string | null;
}

// Định nghĩa State và các Action trong Store
interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (credentials: { email: string; password: string }) => Promise<User>;
    register: (data: { fullName: string; email: string; password: string; roleName: string }) => Promise<void>;
    logout: () => void;
    hydrate: () => void; // Khôi phục phiên làm việc khi tải lại trang (F5)
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    // Action 1: Đăng nhập
    login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/auth/login', credentials);
            const { token, user } = response.data;

            // Lưu trữ token và user vào localStorage
            localStorage.setItem('edtech_auth_token', token);
            localStorage.setItem('edtech_auth_user', JSON.stringify(user));

            set({
                token,
                user,
                isAuthenticated: true,
                isLoading: false,
            });

            return user;
        } catch (err: any) {
            const errMsg = err.response?.data?.message || 'Email hoặc mật khẩu không chính xác';
            set({ error: errMsg, isLoading: false });
            throw new Error(errMsg);
        }
    },

    // Action 2: Đăng ký tài khoản mới
    register: async (data) => {
        set({ isLoading: true, error: null });
        try {
            await api.post('/auth/register', data);
            set({ isLoading: false });
        } catch (err: any) {
            const errMsg = err.response?.data?.message || 'Đăng ký thất bại. Email có thể đã tồn tại.';
            set({ error: errMsg, isLoading: false });
            throw new Error(errMsg);
        }
    },

    // Action 3: Đăng xuất
    logout: () => {
        localStorage.removeItem('edtech_auth_token');
        localStorage.removeItem('edtech_auth_user');
        set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
        });
    },

    // Action 4: Tự động khôi phục Session khi F5
    hydrate: () => {
        const token = localStorage.getItem('edtech_auth_token');
        const userJson = localStorage.getItem('edtech_auth_user');

        if (token && userJson) {
            try {
                const user = JSON.parse(userJson);
                set({
                    token,
                    user,
                    isAuthenticated: true,
                });
            } catch (e) {
                localStorage.removeItem('edtech_auth_token');
                localStorage.removeItem('edtech_auth_user');
            }
        }
    },
}));

// Tự động khôi phục session khi ứng dụng tải
useAuthStore.getState().hydrate();

