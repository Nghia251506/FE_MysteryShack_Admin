// src/services/admin/vipPackage.service.ts
import { VipPackageSummary } from "@/types/vipPackage";
import axiosInstance from "../lib/axios";
import { AdminVipPackage, CreateVipPackageDTO } from "../types/admin";

const VipPackageService = {
    // Lấy tất cả gói (kể cả gói đã ẩn) cho Admin
    getAllPackages: async (): Promise<AdminVipPackage[]> => {
        const res = await axiosInstance.get("/admin/vip-packages");
        return res.data;
    },

    // Tạo gói mới
    createPackage: async (data: CreateVipPackageDTO): Promise<AdminVipPackage> => {
        const res = await axiosInstance.post("/admin/vip-packages", data);
        return res.data;
    },

    // Cập nhật gói
    updatePackage: async (id: number, data: Partial<CreateVipPackageDTO>): Promise<AdminVipPackage> => {
        const res = await axiosInstance.put(`/admin/vip-packages/${id}`, data);
        return res.data;
    },

    // Xóa hoặc Ẩn gói (Tùy BE ông thiết kế là Hard Delete hay Soft Delete)
    deletePackage: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/admin/vip-packages/${id}`);
    },

    getSummary: async (): Promise<VipPackageSummary> => {
        const res = await axiosInstance.get("/admin/vip-packages/summary");
        return res.data;
    },

    
    toggleStatus: async (id: number): Promise<AdminVipPackage> => {
        const res = await axiosInstance.patch(`/admin/vip-packages/${id}/status`);
        return res.data;
    }
};

export default VipPackageService;