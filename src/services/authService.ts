import axios from "@/lib/axios"; 
import { LoginRequest, AuthResponse } from "@/types/auth";

export const authService = {
  // 1. Đăng nhập
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    // Backend Java/Node chuẩn luôn chờ key là 'password'
    const payload = {
        username: data.username,
        password: data.passwordHash // Map từ biến của bạn sang key chuẩn
    };
    
    // Gọi API
    const response = await axios.post(`/auth/login`, payload);
    return response.data; 
  },

  // 2. Đăng ký
  register: async (data: any): Promise<AuthResponse> => {
    // Tạo payload sạch sẽ, gửi đúng key 'password'
    const payload = {
      username: data.username,
      password: data.password, // Lấy trực tiếp pass từ form register
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      birthDate: data.birthDate,
      role: "ADMIN"
    };

    const response = await axios.post(`/auth/register`, payload);
    return response.data;
  },

  // 3. Đăng xuất
  logout: async () => {
    return await axios.post(`/auth/logout`);
  }
};