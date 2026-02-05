import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types/user";
import { UserService } from "../../services/userService";

interface UserState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
  currentPage: 0,
  pageSize: 10,
  totalElements: 0,
  totalPages: 0,
};

// --- THUNKS ---

export const fetchAllCustomers = createAsyncThunk(
  "users/fetchAllCustomers",
  async (params: any, { rejectWithValue }) => {
    try {
      // params truyền từ component vào: { keyword: 'abc', page: 0, size: 10 }
      return await UserService.getAllUsers(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Lỗi lấy danh sách");
    }
  }
);

export const fetchAllReaders = createAsyncThunk(
  "users/fetchAllReaders",
  async (_, { rejectWithValue }) => {
    try {
      return await UserService.getAllReader();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Không thể lấy danh sách reader");
    }
  }
);

export const fetchCustomerByIdAdmin = createAsyncThunk(
  "users/fetchCustomerByIdAdmin",
  async (id: number, { rejectWithValue }) => {
    try {
      return await UserService.getCustomerByIdAdmin(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Lỗi lấy chi tiết người dùng");
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  "users/toggleUserStatus",
  async (id: number, { rejectWithValue }) => {
    try {
      return await UserService.toggleStatus(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Lỗi khi thay đổi trạng thái");
    }
  }
);

export const updateUserInfo = createAsyncThunk(
  "users/updateUserInfo",
  async ({ id, data }: { id: number; data: Partial<User> }, { rejectWithValue }) => {
    try {
      return await UserService.updateUser(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Cập nhật thất bại");
    }
  }
);

// --- SLICE ---

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 1. PHẢI ĐỂ CÁC .addCase LÊN ĐẦU
      .addCase(fetchAllCustomers.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;

        // Lấy content từ Object phân trang (Swagger image_969c5f.png)
        const { content, totalElements, totalPages, number } = action.payload;

        // Map dữ liệu cẩn thận để khớp với Interface
        state.users = content.map((item: any) => {
          // Logic xác định trạng thái ưu tiên: 
          // 1. Nếu bị blocked -> Locked
          // 2. Nếu chưa verified -> Inactive
          // 3. Nếu đang active -> Active
          // 4. Các trường hợp còn lại -> Offline hoặc Pending
          let statusText = "Active";
          if (item.blocked) {
            statusText = "Locked";
          } else if (!item.verified) {
            statusText = "Unverified";
          } else if (!item.active) {
            statusText = "Inactive";
          }

          return {
            ...item,
            id: item.id.toString(),
            status: statusText, // Trạng thái tính toán từ bộ cờ của BE
            // Map thêm các trường nếu cần hiển thị
            isBusy: item.busy || false,
          };
        });

        state.totalElements = totalElements;
        state.totalPages = totalPages;
        state.currentPage = number;
      })
      .addCase(fetchAllReaders.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const rawData = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);

        state.users = rawData.map((item: any) => ({
          ...item,
          id: item.id,
          account: item.username,
          address: item.bio || "Chưa cập nhật",
          status: item.isBlocked ? "Locked" : (item.active ? "Active" : "Offline"),
          avatar: item.profilePicture || `https://ui-avatars.com/api/?name=${item.fullName}`,
        })) as unknown as User[];
      })
      .addCase(fetchCustomerByIdAdmin.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action: PayloadAction<any>) => {
        const updatedUser = action.payload;
        const index = state.users.findIndex((u) => u.id === updatedUser.id);
        if (index !== -1) {
          const user = state.users[index] as any;
          user.active = updatedUser.active;
          user.isBlocked = updatedUser.isBlocked;
          user.status = updatedUser.isBlocked ? "Locked" : (updatedUser.active ? "Active" : "Offline");
        }
      })

      // 2. CÁC .addMatcher PHẢI ĐỂ XUỐNG CUỐI CÙNG
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: any) => {
          state.loading = false;
          state.error = action.payload || "Đã xảy ra lỗi";
        }
      );
  },
});

export const { clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;