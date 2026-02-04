import axios from '@/lib/axios';
import { User } from '../types/user';

const API_URL = '/users';

export const UserService = {
  // Lấy Reader ngẫu nhiên (có hỗ trợ loại trừ người cũ)
  getAllReader: async (): Promise<User> => {
    const response = await axios.get(`${API_URL}/admin/getall`);
    return response.data;
  },

  // Lấy chi tiết 1 User
  getUserById: async (id: number): Promise<User> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  }
};