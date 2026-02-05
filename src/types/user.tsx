export interface User {
  id: number; // Lưu ý: BE trả về number, nên để number đồng nhất
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'READER' | 'ADMIN' | 'SUPPERADMIN';
  birthDate?: string;
  profilePicture?: string;
  bio?: string;
  qrCode: string;
  eloScore: number;
  rating?: number;
  verified?: boolean;
  
  // Trạng thái từ Backend
  active: boolean;    // Khớp với Interface ông đang có
  blocked: boolean; // Field này dùng để kiểm soát khóa/mở
  
  // Các field metadata
  createdAt: string | number | Date;
  
  // Field bổ sung cho UI (Optional)
  status?: "Active" | "Locked" | "Offline"; 
  
  // Các field dành riêng cho Reader (nếu dùng chung interface)
  specialties?: string[];
  totalSessions?: number;
  totalRevenue?: number;
  experienceYears?: number;
  address?: string; // Trong UserDto ông gửi lúc nãy là bio, nhưng FE hay dùng address
}