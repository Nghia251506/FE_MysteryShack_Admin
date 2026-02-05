import axios from '@/lib/axios';
import { User } from '../types/user';

const API_URL = '/users';

export const UserService = {
  // GET /api/users/admin/getall - Lấy danh sách tất cả (thường dùng cho Admin)
  getAllReader: async (): Promise<User[]> => {
    const response = await axios.get(`${API_URL}/admin/getall`);
    return response.data;
  },

  // GET /api/users/admin/{id} - Lấy chi tiết user cho Admin (là cái ông vừa gọi bị lỗi 500 đấy)
  getCustomerByIdAdmin: async (id: number): Promise<User> => {
    const response = await axios.get(`${API_URL}/admin/${id}`);
    return response.data;
  },

  // GET /api/users - Lấy danh sách user chung
  getAllUsers: async (params: {
    keyword?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: string;
  } = {}) => {
    const response = await axios.get(API_URL, { params });
    return response.data; // Trả về cả Object phân trang
  },

  // GET /api/users/{id} - Chi tiết user (thông tin cá nhân)
  getUserById: async (id: number): Promise<User> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // PUT /api/users/{id} - Cập nhật thông tin User
  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    const response = await axios.put(`${API_URL}/${id}`, userData);
    return response.data;
  },

  // PATCH /api/users/{id}/toggle-status - Khóa/Mở khóa User (Dùng cái này thay vì cái PUT)
  toggleStatus: async (id: number): Promise<User> => {
    const response = await axios.patch(`${API_URL}/${id}/toggle-status`);
    return response.data;
  },

  // PATCH /api/users/booking-info/{id} - Cập nhật thông tin đặt lịch
  updateBookingInfo: async (id: number, bookingData: any): Promise<User> => {
    const response = await axios.patch(`${API_URL}/booking-info/${id}`, bookingData);
    return response.data;
  }
};