import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('edtech_auth_token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use((response) => response, (error) => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('edtech_auth_token');
        localStorage.removeItem('edtech_auth_user');
        
        // Chỉ chuyển hướng nếu người dùng KHÔNG ở trang login hoặc register
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
})

export default api;