export interface User {
  createdAt: string | number | Date;
  isBlocked: boolean;
  id: number;
  username: string;
  fullName: string;
  profilePicture?: string;
  role: 'CUSTOMER' | 'READER' | 'ADMIN'| 'SUPPERADMIN';
  eloScore: number;
  rating?: number;
  verified?: boolean;
  active: boolean;
  qrCode: string;
  email: string;
  name?: string;
  bio?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  specialties?: string[];
  totalSessions?: number;
  totalRevenue?: number;
  experienceYears?: number;
}

export interface MatchingRequest {
  excludeIds: number[];
  currentCustomerId: number;
}

export interface UserUpdateDto{
  fullName?: string;
  profilePicture?: string;
  bio?: string;
  qrCode?: string;
  phone?: string;
}