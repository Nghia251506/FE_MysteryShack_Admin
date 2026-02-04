import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/authService';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';

// 1. Thêm isAuthenticated vào Interface
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean; // <--- THÊM DÒNG NÀY
  loading: boolean;
  error: string | null;
}

interface LoginResponse {
  user: User;
  token: string;
}

const getInitialState = (): AuthState => {
  if (typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem('accessToken');
      const user = localStorage.getItem('currentUser');
      return {
        user: user ? JSON.parse(user) : null,
        token: token || null,
        // 2. Tính toán trạng thái đăng nhập từ token
        isAuthenticated: !!token,
        loading: false,
        error: null,
      };
    } catch (e) {
      console.error("Lỗi parse auth storage:", e);
    }
  }
  return { user: null, token: null, isAuthenticated: false, loading: false, error: null };
};

const initialState: AuthState = getInitialState();

export const loginUser = createAsyncThunk<AuthResponse, LoginRequest, { rejectValue: string }>(
  'auth/login',
  async (credentials, thunkAPI) => {
    try {
      const response = await authService.login(credentials);
      // Giả sử AuthService.login trả về dữ liệu đúng kiểu AuthResponse
      return response; 
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Đăng nhập thất bại');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterRequest, thunkAPI) => {
    try {
      await authService.register(data);
      const loginResponse = await authService.login({
        username: data.username,
        passwordHash: data.passwordHash // <--- Fix lỗi type password -> passwordHash
      });
      return {
        user: loginResponse.user,
        token: loginResponse.token
      };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Đăng ký thất bại';
      return thunkAPI.rejectWithValue(message);
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

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: any; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true; // <--- Cập nhật thành true
      state.loading = false;
      state.error = null;

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', action.payload.token);
        localStorage.setItem('currentUser', JSON.stringify(action.payload.user));
      }
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false; // <--- Cập nhật thành false
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');
      }
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        // Merge dữ liệu cũ và mới để tránh mất các trường khác
        state.user = { ...state.user, ...action.payload };
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentUser', JSON.stringify(state.user));
        }
      }
    },

    // Thêm một action chuyên để đồng bộ lại toàn bộ từ Server
    syncUserFromStorage: (state) => {
      if (typeof window !== 'undefined') {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
          state.user = JSON.parse(userJson);
          state.isAuthenticated = !!localStorage.getItem('accessToken');
        }
      }
    },

    resetError: (state) => {
      state.error = null;
    }

  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true; // <--- True khi login xong
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', action.payload.token);
          localStorage.setItem('currentUser', JSON.stringify(action.payload.user));
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user; // Nên cập nhật user luôn sau khi đăng ký thành công
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

      // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    });
  },
});

export const { logout, updateUser, resetError, loginSuccess } = authSlice.actions;
export default authSlice.reducer;