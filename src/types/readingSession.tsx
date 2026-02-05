// Định nghĩa DTO cho lá bài được chọn
interface SelectedCard {
    cardNumber: number;
    cardId: number;
    nameVi: string;
    imageUrl: string;
    reversed: boolean;
}

// Định nghĩa thông tin User (Customer/Reader)
interface UserSummary {
    id: number;
    fullName: string;
    email: string;
    profilePicture?: string;
    birthDate?: Date;
    // Thêm các field khác tùy vào DTO bên Java của ông
}

export interface ReadingSession {
    disputeReason: string;
    disputeEvidences: any;
    id: number;
    customer?: UserSummary;
    reader?: UserSummary;
    question?: {
        id: number;
        questionText: string; // Tùy vào TopicQuestion entity của ông
        topic?: {
            id: number;
            name: String;
        }
    };

    // Dữ liệu lá bài (đã qua Converter JSON)
    selectedCards: SelectedCard[];

    // Trạng thái và Thời gian (Instant trong Java sang string/ISO date trong TS)
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DISPUTED' | string;
    fullName?: string;
    birthDate?: string; // LocalDate sang string (YYYY-MM-DD)
    isRated: boolean;

    // Các mốc thời gian (Instant)
    acceptedAt?: string;
    matchedAt?: string;
    submitedAt?: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;

    // Tiền tệ và tính toán
    amount: number;
    responseTime?: number;

    // IDs của các reader đã từ chối
    rejectedReaderIds: number[];
}

// Interface hỗ trợ Phân trang từ Spring Boot Page<ReadingSession>
export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number; // Số trang hiện tại
    last: boolean;
    first: boolean;
    empty: boolean;
}