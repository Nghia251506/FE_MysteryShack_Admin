import axios from '../lib/axios';
import { DisputeResponse, ResolveDisputeRequest, PageResponse } from '../types/dispute';

const ADMIN_DISPUTE_URL = '/v1/admin/disputes';

export const adminDisputeService = {
  // Lấy danh sách tranh chấp phân trang
  getAll: async (status?: string, keyword?: string, page = 0, size = 5) => {
    const response = await axios.get<PageResponse<DisputeResponse>>(ADMIN_DISPUTE_URL, {
      params: { status, keyword, page, size, sort: 'createdAt,desc' }
    });
    return response.data;
  },

  // Admin xử lý (Resolve)
  resolve: async (id: number, data: ResolveDisputeRequest) => {
    const response = await axios.put<DisputeResponse>(`${ADMIN_DISPUTE_URL}/${id}/resolve`, data);
    return response.data;
  }
};