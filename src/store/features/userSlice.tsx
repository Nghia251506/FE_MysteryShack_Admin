import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types/user";
import { UserService } from "../../services/userService";

interface UserState {
  users: User[]; // Danh sách tất cả reader cho Admin
  selectedUser: User | null; // Chi tiết 1 user khi cần xem/sửa
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
};

// Thunk để lấy danh sách Reader
export const fetchAllReaders = createAsyncThunk(
  "users/fetchAllReaders",
  async (_, { rejectWithValue }) => {
    try {
      const data = await UserService.getAllReader();
      console.log(data);
      return data; // Lưu ý: Nếu API trả về mảng, data sẽ là User[]
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể lấy danh sách người dùng",
      );
    }
  },
);

// Thunk để lấy chi tiết 1 User
export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (id: number, { rejectWithValue }) => {
    try {
      const data = await UserService.getUserById(id);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Không thể lấy thông tin người dùng",
      );
    }
  },
);

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
      // Xử lý fetchAllReaders
      .addCase(fetchAllReaders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAllReaders.fulfilled,
        (state, action: PayloadAction<any[]>) => {
          state.loading = false;
          state.users = action.payload.map((item: any) => ({
            id: item.id.toString(),
            fullName: item.fullName || "N/A",
            email: item.email || "N/A",
            account: item.username, // Khớp username của BE
            phone: item.phone || "N/A",
            dob: item.birthDate ? item.birthDate.split("T")[0] : "N/A", // Cắt lấy ngày yyyy-MM-dd
            joinDate: item.createdAt ? item.createdAt.split("T")[0] : "N/A",
            address: item.bio || "Chưa cập nhật",
            elo: item.eloScore || 0,
            rating: item.reputation || 0,
            avatar:
              item.profilePicture ||
              `https://ui-avatars.com/api/?name=${item.fullName}`,
            // Logic Status: Nếu bị Block thì Locked, nếu không Active thì Offline/Pending...
            status: item.isBlocked
              ? "Locked"
              : item.active
                ? "Active"
                : "Offline",

            // Các trường FE cần nhưng BE chưa có thì để mặc định để không bị lỗi undefined
            specialty: [],
            completedSessions: 0,
            totalPurchases: 0,
            acceptanceRate: 100,
          }));
        },
      )
      .addCase(fetchAllReaders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Xử lý fetchUserById
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchUserById.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          state.selectedUser = action.payload;
        },
      )
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;
