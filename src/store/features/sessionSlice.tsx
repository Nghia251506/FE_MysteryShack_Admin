import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ReadingSession, PageResponse } from '../../types/readingSession';
import { sessionService } from '../../services/sessionService';

interface SessionState {
  pageData: PageResponse<ReadingSession> | null;
  loading: boolean;
  error: string | null;
  currentTab: string;
  currentPage: number;
}

const initialState: SessionState = {
  pageData: null,
  loading: false,
  error: null,
  currentTab: 'live',
  currentPage: 0,
};

// Thunk để gọi API
export const fetchSessionsThunk = createAsyncThunk(
  'sessions/fetchAll',
  async ({ tab, page, size }: { tab: string; page: number; size: number }, { rejectWithValue }) => {
    try {
      const response = await sessionService.getAllSessions(tab, page, size);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi lấy dữ liệu');
    }
  }
);

const sessionSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    setTab: (state, action: PayloadAction<string>) => {
      state.currentTab = action.payload;
      state.currentPage = 0; // Reset về trang đầu khi đổi tab
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessionsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessionsThunk.fulfilled, (state, action: PayloadAction<PageResponse<ReadingSession>>) => {
        state.loading = false;
        state.pageData = action.payload;
      })
      .addCase(fetchSessionsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setTab, setPage } = sessionSlice.actions;
export default sessionSlice.reducer;