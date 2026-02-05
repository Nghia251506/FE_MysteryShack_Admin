export enum InterpretationStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  // Thêm các status khác nếu BE của ông có
}

export interface ReaderInfo {
  id: number;
  fullName: string;
  profilePicture: string;
}

export interface SelectedCardDto {
  cardNumber: number;
  cardId: number;
  nameVi: string;
  imageUrl: string;
  reversed: boolean;
}

export interface InterpretationResponseDto {
  id: number;
  interpretation1: string; // Thường là luận giải lá 1
  interpretation2: string; // Luận giải lá 2
  interpretation3: string; // Luận giải lá 3
  advice: string;          // Lời khuyên tổng thể
  qrPayment: string;
  status: InterpretationStatus;
  sessionId: number;
  
  // Thông tin mở rộng
  reader: ReaderInfo;
  questionContent: string;
  amount: number;
  selectedCards: SelectedCardDto[];
}