export interface TarotCard {
  id: number;
  cardNumber: number;
  nameEn: string;
  nameVi?: string;  // Optional
  arcana: 'MAJOR' | 'MINOR';
  suit?: string;  // Optional, chỉ cho MINOR
  imageUrl?: string;  // Optional
  uprightMeaning?: string;  // Optional
  reversedMeaning?: string;  // Optional
  description?: string;  // Optional
  keywords: string[];  // Mảng string
  active: boolean;
  createdDate: string;  // ISO date string
  updatedDate: string;  // ISO date string
}

// Type cho Create TarotCard (dùng khi thêm mới)
export interface CreateTarotCardDto {
  cardNumber: number;
  nameEn: string;
  nameVi?: string;
  arcana: 'MAJOR' | 'MINOR';
  suit?: string;
  imageUrl?: string;
  uprightMeaning?: string;
  reversedMeaning?: string;
  description?: string;
  keywords: string[];
}

// Type cho Update TarotCard (các field optional)
export interface UpdateTarotCardDto {
  cardNumber?: number;
  nameEn?: string;
  nameVi?: string;
  arcana?: 'MAJOR' | 'MINOR';
  suit?: string;
  imageUrl?: string;
  uprightMeaning?: string;
  reversedMeaning?: string;
  description?: string;
  keywords?: string[];
  isActive?: boolean;
}

// Type cho Response từ backend (ví dụ: { success: true, message: string, data: TarotCard[] })
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// Type cho Pagination (nếu backend trả page)
export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}