import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // --- CẤU HÌNH SERVER PROXY (QUAN TRỌNG) ---
  server: {
    port: 5173, // Port chạy Frontend
    proxy: {
      '/api': {
        // ⚠️ LƯU Ý: Thay 'http://localhost:8080' bằng địa chỉ Backend thật của bạn
        // Nếu Backend chạy port 3000 thì sửa thành 'http://localhost:3000'
        // Nếu Backend chạy port 5000 thì sửa thành 'http://localhost:5000'
        target: (import.meta as any).env.VITE_API_URL, 
        changeOrigin: true,
        secure: false,
      },
    },
  },

  define: {
    // Thay thế biến global bằng window để các thư viện cũ không bị crash
    global: 'window',
  },
});