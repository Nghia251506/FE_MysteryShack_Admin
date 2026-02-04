import axios from 'axios';

// --- QUAN TRỌNG: Để '/api' để request đi qua Proxy trong vite.config.ts ---
const BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:8080/api'; 

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Request Interceptor: Gắn Token vào Header nếu có
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Xử lý lỗi 401 (Hết phiên đăng nhập)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Nếu Backend trả về 401 -> Xóa token để user đăng nhập lại
      localStorage.removeItem('accessToken');
      localStorage.removeItem('currentUser');
      // window.location.href = '/login'; // (Tùy chọn) Tự động chuyển trang
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;