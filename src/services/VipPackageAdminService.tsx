// src/services/admin/vipPackage.service.ts
import axiosInstance from "../lib/axios";
import { AdminVipPackage, CreateVipPackageDTO } from "../types/admin";

const VipPackageAdminService = {
  /**
   * GET /api/admin/vip-packages
   * Lấy danh sách toàn bộ các gói VIP để quản lý
   */
  getAllPackages: async (): Promise<AdminVipPackage[]> => {
    const res = await axiosInstance.get("/admin/vip-packages");
    return res.data;
  },

  /**
   * POST /api/admin/vip-packages
   * Thêm mới một gói VIP
   */
  createPackage: async (data: CreateVipPackageDTO): Promise<AdminVipPackage> => {
    const res = await axiosInstance.post("/admin/vip-packages", data);
    return res.data;
  },

  /**
   * PUT /api/admin/vip-packages/{id}
   * Cập nhật thông tin gói VIP theo ID
   */
  updatePackage: async (id: number, data: Partial<CreateVipPackageDTO>): Promise<AdminVipPackage> => {
    const res = await axiosInstance.put(`/admin/vip-packages/${id}`, data);
    return res.data;
  },

  /**
   * DELETE /api/admin/vip-packages/{id}
   * Xóa gói VIP khỏi hệ thống
   */
  deletePackage: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/admin/vip-packages/${id}`);
  },

  /**
   * GET /api/admin/vip-packages/{id}
   * Lấy chi tiết 1 gói (nếu BE có hỗ trợ endpoint này lẻ)
   */
  getPackageById: async (id: number): Promise<AdminVipPackage> => {
    const res = await axiosInstance.get(`/admin/vip-packages/${id}`);
    return res.data;
  }
};

export default VipPackageAdminService;