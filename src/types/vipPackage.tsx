export interface VipPackage {
  id: number;
  name: string;
  price: number;
  durationDays: number;
  benefits: string;
  maxJobsPerDay: number;
  status: 'Active' | 'Inactive';
  soldCount: number;
}
export interface VipPackageSummary {
  totalPackages: number;
  activePackages: number;
  totalSoldCount: number;
  totalRevenue: number;
}
export type CreateVipPackageRequest = Omit<VipPackage, 'id' | 'soldCount'>;