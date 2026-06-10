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
                        sessionStorage.removeItem('explore_cache_enrollments');
                        sessionStorage.removeItem('explore_cache_enrolled_paths');
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

                    // Kiểm tra mock users được đăng ký động trong localStorage
                    if (!mockUser) {
                        const stored = localStorage.getItem('mock_registered_users');
                        const mockUsers = stored ? JSON.parse(stored) : [];
                        const matched = mockUsers.find((u: any) => u.email === emailLower);
                        if (matched) {
                            if (!credentials.password || matched.password === credentials.password) {
                                mockUser = {
                                    userId: Math.floor(Math.random() * 100000) + 10,
                                    email: matched.email,
                                    fullName: matched.fullName,
                                    roleId: matched.roleId,
                                    roleName: matched.roleName as 'learner' | 'course provider' | 'academic manager' | 'admin',
                                    avatarUrl: null,
                                };
                                // Khởi tạo tiến trình trống cho tài khoản mới
                                sessionStorage.setItem('explore_cache_enrollments', JSON.stringify([]));
                                sessionStorage.setItem('explore_cache_enrolled_paths', JSON.stringify([]));
                            }
                        }
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
                    try {
                        await registerApi(data);
                    } catch (apiErr) {
                        console.warn("Backend API registration failed, falling back to mock registration storage.", apiErr);
                    }

                    // Lưu vào mock storage (localStorage)
                    const stored = localStorage.getItem('mock_registered_users');
                    const users = stored ? JSON.parse(stored) : [];
                    
                    const emailLower = data.email.toLowerCase().trim();
                    if (!users.some((u: any) => u.email === emailLower)) {
                        users.push({
                            email: emailLower,
                            fullName: data.fullName,
                            password: data.password,
                            roleId: data.roleId || 1,
                            roleName: data.roleId === 2 ? 'course provider' : 'learner',
                        });
                        localStorage.setItem('mock_registered_users', JSON.stringify(users));
                    }

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
                    try {
                        await verifyEmailApi(token);
                    } catch (apiErr) {
                        console.warn("Backend API email verification failed, bypassing for mock flow.", apiErr);
                    }
                } catch (err: any) {
                    const errMsg = err.response?.data?.message || 'Failed to verify email. Please try again.';
                    set({ error: errMsg });
                    throw new Error(errMsg);
                }
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
        sessionStorage.removeItem('explore_cache_enrollments');
        sessionStorage.removeItem('explore_cache_enrolled_paths');
        useAuthStore.setState({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
        });
    });
}
