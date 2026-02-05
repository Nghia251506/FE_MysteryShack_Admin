/**
 * 1. Định nghĩa các gói VIP (VIP Management)
 */
export interface AdminVipPackage {
  benefits: string;
  status: string;
  id: number;
  name: string;
  price: number;
  durationDays: number;
  maxJobsPerDay: number;
  description: string;
  active: boolean; // Dùng để ẩn/hiện gói trên trang Pricing của Reader
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 2. Lịch sử giao dịch thanh toán (Payment History)
 * Dùng để hiển thị bảng doanh thu, check var VNPay
 */
export interface AdminTransaction {
  id: number;
  orderId: string;       // Mã đơn hàng của hệ thống mình (TxnRef)
  vnpayTranNo: string;   // Mã giao dịch từ VNPay trả về
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  readerName: string;    // Tên người mua
  packageName: string;   // Tên gói đã mua
  paymentDate: string;   // Ngày thanh toán
  bankCode?: string;     // Ngân hàng (NCB, VCB,...)
}

/**
 * 3. Quản lý trạng thái Reader Subscription
 * Để Admin biết Reader nào đang dùng gói nào, còn hạn không
 */
export interface AdminReaderSubscription {
  id: number;
  readerId: number;
  username: string;
  packageName: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED';
  remainingJobsToday: number; // Số job còn lại trong ngày (nếu cần quản lý)
}

/**
 * 4. DTO cho việc Tạo mới/Cập nhật gói
 */
export type CreateVipPackageDTO = Omit<AdminVipPackage, 'id' | 'createdAt' | 'updatedAt'>;