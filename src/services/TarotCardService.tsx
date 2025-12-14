import api from "../api/axiosClient";
import { TarotCard, CreateTarotCardDto, UpdateTarotCardDto, ApiResponse, PaginatedResponse } from '../types/TarotCardTypes';

// GET all cards (phân trang cho admin)
export const getAllCards = async (
  page: number = 0, 
  size: number = 20, 
  sort: string = 'cardNumber,asc'
): Promise<PaginatedResponse<TarotCard>> => {
  const response = await api.get<any>(`/tarot-cards/admin?page=${page}&size=${size}&sort=${sort}`);
  
  // Backend trả thẳng object có success, message, và data là mảng + pagination
  // Không có lớp ApiResponse bọc ngoài
  const raw = response.data;

  // Kiểm tra success
  if (!raw.success) {
    throw new Error(raw.message || 'Lỗi khi lấy danh sách lá bài');
  }

  console.log('Raw response from backend:', raw);

  // Trả về đúng format PaginatedResponse
  return {
    data: raw.data,              // mảng TarotCard[]
    currentPage: raw.currentPage,
    totalPages: raw.totalPages,
    totalItems: raw.totalItems,
  };
};

// GET card by ID
export const getCardById = async (id: number): Promise<TarotCard> => {
  const response = await api.get<ApiResponse<TarotCard>>(`/tarot-cards/admin/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
  return response.data.data!;
};

// CREATE new card
export const createCard = async (dto: CreateTarotCardDto): Promise<TarotCard> => {
  const response = await api.post<ApiResponse<TarotCard>>('/tarot-cards/admin', dto);
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
  return response.data.data!;
};

// UPDATE card
export const updateCard = async (id: number, dto: UpdateTarotCardDto): Promise<TarotCard> => {
  const response = await api.put<ApiResponse<TarotCard>>(`/tarot-cards/admin/${id}`, dto);
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
  return response.data.data!;
};

// DELETE soft (ẩn card)
export const softDeleteCard = async (id: number): Promise<void> => {
  const response = await api.delete<ApiResponse<void>>(`/tarot-cards/admin/soft/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
};

// DELETE hard
export const deleteCard = async (id: number): Promise<void> => {
  const response = await api.delete<ApiResponse<void>>(`/tarot-cards/admin/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
};

// (Tùy chọn) GET all active cards for public
export const getAllActiveCards = async (): Promise<TarotCard[]> => {
  const response = await api.get<ApiResponse<TarotCard[]>>('/tarot-cards/public/active');
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
  return response.data.data!;
};

// (Tùy chọn) Search active cards
export const searchActiveCards = async (query: string): Promise<TarotCard[]> => {
  const response = await api.get<ApiResponse<TarotCard[]>>(`/tarot-cards/public/search?query=${encodeURIComponent(query)}`);
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
  return response.data.data!;
};