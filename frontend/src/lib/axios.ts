import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5002',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    try {
        const authStorage = localStorage.getItem('edtech-auth-storage');
        if (authStorage) {
            const parsed = JSON.parse(authStorage);
            const token = parsed?.state?.token;
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
    } catch (e) {
        console.error('Failed to parse auth storage from localStorage', e);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use((response) => response, (error) => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('edtech-auth-storage');

        // Phát sự kiện logout để đồng bộ với Zustand store
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('auth:logout'));
        }

        // Chỉ chuyển hướng nếu người dùng KHÔNG ở trang login, register hoặc verify-email
        const currentPath = window.location.pathname;
        if (
            currentPath !== '/login' &&
            currentPath !== '/register' &&
            currentPath !== '/verify-email'
        ) {
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
});

export default api;
