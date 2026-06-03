import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Đọc .env từ thư mục cha
  const env = loadEnv(mode, '../', '');
  return {
    plugins: [react()],
    envDir: '../', // Cho phép frontend client đọc file .env từ thư mục cha
    server: {
      proxy: {
        '/auth': {
          target: env.VITE_API_URL,
          changeOrigin: true,
        },
      },
    },
  };
})
