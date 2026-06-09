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

            // Action 1: Đăng nhập
            login: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    // ── MOCK LOGIN LOGIC (TRÁNH LỖI 429 VÀ ĐỘC LẬP BACKEND) ────────────────────────
                    // Kiểm tra email đăng nhập. Nếu khớp với một trong các tài khoản mock,
                    // hệ thống sẽ tự động đăng nhập và gán thông tin vai trò tương ứng mà không gọi API backend.
                    const emailLower = credentials.email.toLowerCase().trim();
                    let mockUser = null;

                    if (emailLower === 'learner@edtech.com') {
                        mockUser = {
                            userId: 1,
                            email: 'learner@edtech.com',
                            fullName: 'Nguyễn Văn Learner',
                            roleId: 1,
                            roleName: 'learner' as const,
                            avatarUrl: null,
                        };
                    } else if (emailLower === 'provider@edtech.com') {
                        mockUser = {
                            userId: 2,
                            email: 'provider@edtech.com',
                            fullName: 'Trần Thị Provider',
                            roleId: 2,
                            roleName: 'course provider' as const,
                            avatarUrl: null,
                        };
                    } else if (emailLower === 'manager@edtech.com') {
                        mockUser = {
                            userId: 3,
                            email: 'manager@edtech.com',
                            fullName: 'Lê Văn Manager',
                            roleId: 3,
                            roleName: 'academic manager' as const,
                            avatarUrl: null,
                        };
                    } else if (emailLower === 'admin@edtech.com') {
                        mockUser = {
                            userId: 4,
                            email: 'admin@edtech.com',
                            fullName: 'Phạm Hồng Admin',
                            roleId: 4,
                            roleName: 'admin' as const,
                            avatarUrl: null,
                        };
                    }

                    // Nếu khớp tài khoản mock, cập nhật trạng thái đăng nhập vào store và lưu token giả lập.
                    if (mockUser) {
                        set({
                            token: 'mock-jwt-token-xyz',
                            user: mockUser,
                            isAuthenticated: true,
                            isLoading: false,
                        });
                        return mockUser;
                    }

                    // ── FALLBACK BACKEND API ────────────────────────────────────────────────────────
                    // Nếu không phải là tài khoản mock, hệ thống sẽ tiến hành gửi request thật lên backend.

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
                // ── BACKEND API LOGOUT (TẠM THỜI COMMENT LẠI KHI DÙNG MOCKDATA) ──────────────────
                /*
                try {
                    await logoutApi();
                } catch (e) {
                    console.error('Failed to logout from backend:', e);
                }
                */

                // ── MOCK LOGOUT LOGIC (HỖ TRỢ CHẠY MOCKDATA ĐỘC LẬP VÀ TRÁNH LỖI PHẢI BẤM 2 LẦN) ─
                // Clear state lập tức và đồng bộ ở Client để UI chuyển hướng ngay về trang login,
                // không bị treo/đợi phản hồi từ API Backend (tránh lỗi race condition giữa route guard và store).
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null,
                });
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
