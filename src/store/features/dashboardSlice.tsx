import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { dashboardService } from '@/services/dashboardService';
import { DashboardStatsDTO, SessionDashboardDTO, TopReader } from '@/types/dashboard';

// 1. Định nghĩa cấu trúc State
interface DashboardState {
  stats: DashboardStatsDTO | null;
  sessions: SessionDashboardDTO[];
  chartData: any[];
  topReaders: TopReader[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  sessions: [],
  chartData: [],
  topReaders: [],
  loading: false,
  error: null,
};

// 2. Tạo Async Thunk để fetch toàn bộ data Dashboard cùng lúc
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const [statsRes, chartRes, sessionRes, readersRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getHourlyChart(),
        dashboardService.getSessions(),
        dashboardService.getTopReaders(),
      ]);

      return {
        stats: statsRes.data,
        chartData: chartRes.data,
        sessions: sessionRes.data,
        topReaders: readersRes.data,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải dữ liệu');
    }
  }
);

// 3. Slice xử lý đồng bộ và bất đồng bộ
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // 🔥 Xử lý tin nhắn từ WebSocket để cập nhật Real-time
    updateNewSession: (state, action: PayloadAction<SessionDashboardDTO>) => {
      // Chèn phiên mới vào đầu bảng
      state.sessions = [action.payload, ...state.sessions].slice(0, 10);
      
      // Update nhanh số liệu stats để Admin thấy nhảy ngay lập tức
      if (state.stats) {
        state.stats.totalSessionsToday += 1;
        state.stats.activeSessions += 1;
      }
    },
    // Cập nhật lại danh sách sessions khi search thành công
    setSessions: (state, action: PayloadAction<SessionDashboardDTO[]>) => {
      state.sessions = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.chartData = action.payload.chartData;
        state.sessions = action.payload.sessions;
        state.topReaders = action.payload.topReaders;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateNewSession, setSessions } = dashboardSlice.actions;
export default dashboardSlice.reducer;