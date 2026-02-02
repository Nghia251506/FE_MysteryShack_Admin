import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/authService';
import { LoginRequest, RegisterRequest, User, AuthResponse } from '@/types/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('currentUser') || 'null'),
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,
};

// --- Async Thunks ---

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      return response;
    } catch (error: any) {
      // --- XỬ LÝ LỖI MỚI (FIX LỖI FONT & MESSAGE) ---
      
      // Trường hợp 1: Sai tài khoản/mật khẩu (Thường trả về 401 hoặc 400)
      if (error.response && (error.response.status === 401 || error.response.status === 400)) {
        return rejectWithValue('Sai tên đăng nhập hoặc mật khẩu. Vui lòng thử lại!');
      }

      // Trường hợp 2: Lỗi Server (500)
      if (error.response && error.response.status >= 500) {
        return rejectWithValue('Lỗi hệ thống. Vui lòng thử lại sau!');
      }

      // Trường hợp 3: Các lỗi khác (Mạng, CORS...)
      return rejectWithValue(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authService.register(credentials);
      // Không lưu token để user phải tự login lại
      return response;
    } catch (error: any) {
      // Xử lý lỗi đăng ký (ví dụ trùng username)
      if (error.response && error.response.status === 409) {
         return rejectWithValue('Tên đăng nhập hoặc Email đã tồn tại!');
      }
      return rejectWithValue(error.response?.data?.message || 'Đăng ký thất bại');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('currentUser');
    }
  }
);

// --- Slice ---

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; // Hiển thị message tiếng Việt đã custom ở trên
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    });
  },
});

export const { resetError } = authSlice.actions;
export default authSlice.reducer;