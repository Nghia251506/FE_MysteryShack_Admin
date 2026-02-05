// src/services/admin/payment.service.ts
import axiosInstance from "../lib/axios";
import { AdminTransaction } from "../types/admin";

const AdminPaymentService = {
  // Lấy danh sách giao dịch (có thể thêm filter date hoặc status ở đây)
  getTransactions: async (params?: { 
    page?: number; 
    size?: number; 
    status?: string 
  }): Promise<{ content: AdminTransaction[], totalElements: number }> => {
    const res = await axiosInstance.get("/admin/payments", { params });
    // BE Spring Boot thường trả về dạng Page object (content, totalElements...)
    return res.data;
  },

  // Xem chi tiết 1 giao dịch nếu cần
  getTransactionById: async (id: number): Promise<AdminTransaction> => {
    const res = await axiosInstance.get(`/admin/payments/${id}`);
    return res.data;
  },

  // Lấy thống kê nhanh cho Dashboard (Tổng doanh thu, số đơn hôm nay...)
  getPaymentStats: async () => {
    const res = await axiosInstance.get("/admin/payments/stats");
    return res.data;
  }
};

export default AdminPaymentService;