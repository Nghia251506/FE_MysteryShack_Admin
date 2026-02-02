export interface User {
  id: string | number;
  username: string;
  email: string;
  fullName?: string;
  role: 'ADMIN' | 'READER' | 'USER' | 'CUSTOMER';
  avatar?: string;
  phone?: string;
  birthDate?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  passwordHash: string; // <-- Đã đổi thành passwordHash
}

export interface RegisterRequest {
  username: string;
  email: string;
  passwordHash: string; // <-- Đã đổi thành passwordHash
  fullName: string;
  phone: string;
  birthDate: string;
  role: string;
}