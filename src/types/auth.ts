// Dữ liệu User trả về sau khi Login thành công
export interface User {
  isActive: boolean;
  profilePicture: string;
  id: number;
  username: string;
  email: string;
  fullName: string;
  birthDate?: string; // <--- THÊM DÒNG NÀY: Để lưu và hiển thị ở trang Profile
  role: 'CUSTOMER' | 'READER' | 'ADMIN';
  token?: string; // JWT Token
}

// Payload gửi lên khi Đăng nhập
export interface LoginRequest {
  username: string;
  passwordHash: string; 
}

// Payload gửi lên khi Đăng ký
export interface RegisterRequest {
  username: string;
  passwordHash: string;
  email: string;
  fullName: string;
  birthDate: string; // <--- THÊM DÒNG NÀY: Để fix lỗi gạch đỏ ở trang Register
  role: 'CUSTOMER' | 'READER';
}

// Response chuẩn từ Auth API
export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}