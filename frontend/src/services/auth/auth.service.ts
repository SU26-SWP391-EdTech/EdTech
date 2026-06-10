import api from '../../lib/axios';

// Định nghĩa cấu trúc User nhận về từ Backend
export interface User {
    userId: number;
    email: string;
    fullName: string;
    roleId: number;
    roleName: 'learner' | 'course provider' | 'admin' | 'academic manager';
    avatarUrl: string | null;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    token: string;
    user: User;
    requiresPlatformSetup: boolean;
}

export async function login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
}

export async function register(data: { fullName: string; email: string; password: string; roleName: string }) {
    const response = await api.post('/auth/register', data);
    return response.data;
}

export async function verifyEmail(token: string) {
    const response = await api.get('/auth/verify-mail', { params: { token } });
    return response.data;
}

export async function logout() {
    const response = await api.post('/auth/logout');
    return response.data;
}
