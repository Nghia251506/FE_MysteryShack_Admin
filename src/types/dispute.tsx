export interface DisputeResponse {
  id: number;
  sessionId: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  readerId: number;
  readerName: string;
  reason: string;
  evidenceImages: string[];
  status: 'PENDING' | 'RESOLVED_REFUND' | 'RESOLVED_REJECT';
  amount: number;
  topicName: string;
  questionContent: string;
  adminNote: string;
  createdAt: string;
  resolvedAt: string | null;
}

export interface ResolveDisputeRequest {
  status: 'RESOLVED_REFUND' | 'RESOLVED_REJECT';
  adminNote: string;
}

// Re-use lại cái PageResponse đã viết từ trước
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
}