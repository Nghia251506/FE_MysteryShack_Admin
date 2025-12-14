import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getAllCards, 
  getCardById, 
  createCard, 
  updateCard, 
  softDeleteCard, 
  deleteCard
} from '../services/TarotCardService';
import {TarotCard,
  CreateTarotCardDto,
  UpdateTarotCardDto,
  PaginatedResponse} from "../types/TarotCardTypes";

// State interface
interface TarotCardState {
  cards: TarotCard[];
  currentCard: TarotCard | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

// Initial state
const initialState: TarotCardState = {
  cards: [],
  currentCard: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 0,
    totalPages: 0,
    totalItems: 0,
  },
};

// Async Thunks
export const fetchAllCards = createAsyncThunk(
  'tarotCard/fetchAll',
  async ({ page = 0, size = 20, sort = 'cardNumber,asc' }: { page?: number; size?: number; sort?: string }) => {
    const response = await getAllCards(page, size, sort);
    return response;
  }
);

export const fetchCardById = createAsyncThunk(
  'tarotCard/fetchById',
  async (id: number) => {
    const response = await getCardById(id);
    return response;
  }
);

export const createTarotCard = createAsyncThunk(
  'tarotCard/create',
  async (dto: CreateTarotCardDto) => {
    const response = await createCard(dto);
    return response;
  }
);

export const updateTarotCard = createAsyncThunk(
  'tarotCard/update',
  async ({ id, dto }: { id: number; dto: UpdateTarotCardDto }) => {
    const response = await updateCard(id, dto);
    return response;
  }
);

export const softDeleteTarotCard = createAsyncThunk(
  'tarotCard/softDelete',
  async (id: number) => {
    await softDeleteCard(id);
    return id;
  }
);

export const hardDeleteTarotCard = createAsyncThunk(
  'tarotCard/hardDelete',
  async (id: number) => {
    await deleteCard(id);
    return id;
  }
);

// Slice
const tarotCardSlice = createSlice({
  name: 'tarotCard',
  initialState,
  reducers: {
    clearCurrentCard: (state) => {
      state.currentCard = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchAllCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCards.fulfilled, (state, action: PayloadAction<PaginatedResponse<TarotCard>>) => {
        state.loading = false;
        state.cards = action.payload.data;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalItems: action.payload.totalItems,
        };
      })
      .addCase(fetchAllCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi lấy danh sách lá bài';
      });

    // Fetch by ID
    builder
      .addCase(fetchCardById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCardById.fulfilled, (state, action: PayloadAction<TarotCard>) => {
        state.loading = false;
        state.currentCard = action.payload;
      })
      .addCase(fetchCardById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi lấy lá bài';
      });

    // Create
    builder
      .addCase(createTarotCard.fulfilled, (state, action: PayloadAction<TarotCard>) => {
        state.cards.unshift(action.payload);  // thêm vào đầu danh sách
      });

    // Update
    builder
      .addCase(updateTarotCard.fulfilled, (state, action: PayloadAction<TarotCard>) => {
        const index = state.cards.findIndex(card => card.id === action.payload.id);
        if (index !== -1) {
          state.cards[index] = action.payload;
        }
        state.currentCard = action.payload;
      });

    // Soft delete
    builder
      .addCase(softDeleteTarotCard.fulfilled, (state, action: PayloadAction<number>) => {
        const index = state.cards.findIndex(card => card.id === action.payload);
        if (index !== -1) {
          state.cards[index].isActive = false;
        }
      });

    // Hard delete
    builder
      .addCase(hardDeleteTarotCard.fulfilled, (state, action: PayloadAction<number>) => {
        state.cards = state.cards.filter(card => card.id !== action.payload);
      });
  },
});

export const { clearCurrentCard, clearError } = tarotCardSlice.actions;
export default tarotCardSlice.reducer;