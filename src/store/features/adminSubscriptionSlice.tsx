import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import VipPackageAdminService from '../../services/VipPackageService';
import AdminPaymentService from '../../services/AdminPaymentService';
import { AdminVipPackage, AdminTransaction, CreateVipPackageDTO } from '../../types/admin';

interface AdminSubState {
    packages: AdminVipPackage[];
    transactions: AdminTransaction[];
    totalTransactions: number;
    loading: boolean;
    error: string | null;
}

const initialState: AdminSubState = {
    packages: [],
    transactions: [],
    totalTransactions: 0,
    loading: false,
    error: null,
};

// --- THUNKS CHO VIP PACKAGES ---

export const fetchAdminPackages = createAsyncThunk(
    'adminSub/fetchPackages',
    async (_, { rejectWithValue }) => {
        try {
            return await VipPackageAdminService.getAllPackages();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách gói');
        }
    }
);

export const addVipPackage = createAsyncThunk(
    'adminSub/addPackage',
    async (data: CreateVipPackageDTO, { rejectWithValue }) => {
        try {
            return await VipPackageAdminService.createPackage(data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tạo gói mới');
        }
    }
);

export const updateVipPackage = createAsyncThunk(
    'adminSub/updatePackage',
    async ({ id, data }: { id: number; data: Partial<CreateVipPackageDTO> }, { rejectWithValue }) => {
        try {
            return await VipPackageAdminService.updatePackage(id, data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Cập nhật thất bại');
        }
    }
);

export const removeVipPackage = createAsyncThunk(
    'adminSub/removePackage',
    async (id: number, { rejectWithValue }) => {
        try {
            await VipPackageAdminService.deletePackage(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Xóa gói thất bại');
        }
    }
);

// --- THUNKS CHO PAYMENTS ---

export const fetchAdminTransactions = createAsyncThunk(
    'adminSub/fetchTransactions',
    async (params: any, { rejectWithValue }) => {
        try {
            return await AdminPaymentService.getTransactions(params);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Không thể tải lịch sử giao dịch');
        }
    }
);

// --- SLICE ---

const adminSubSlice = createSlice({
    name: 'adminSub',
    initialState,
    reducers: {
        clearAdminError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Packages
            .addCase(fetchAdminPackages.pending, (state) => { state.loading = true; })
            .addCase(fetchAdminPackages.fulfilled, (state, action) => {
                state.loading = false;
                state.packages = action.payload;
            })
            .addCase(fetchAdminPackages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Add Package
            .addCase(addVipPackage.fulfilled, (state, action) => {
                state.packages.push(action.payload);
            })

            // Update Package
            .addCase(updateVipPackage.fulfilled, (state, action) => {
                const index = state.packages.findIndex(p => p.id === action.payload.id);
                if (index !== -1) state.packages[index] = action.payload;
            })

            // Remove Package
            .addCase(removeVipPackage.fulfilled, (state, action) => {
                state.packages = state.packages.filter(p => p.id !== action.payload);
            })

            // Fetch Transactions
            .addCase(fetchAdminTransactions.fulfilled, (state, action: PayloadAction<any>) => {
                state.loading = false;
                // Bóc tách mảng content từ Page object của Spring Boot
                state.transactions = action.payload.content || [];
                state.totalTransactions = action.payload.totalElements || 0;
            })
            .addCase(fetchAdminTransactions.rejected, (state, action) => {
                state.loading = false;
                // Fix lỗi "Type unknown" ở Ảnh 1 bằng cách ép kiểu (as string)
                state.error = (action.payload as string) || "Đã có lỗi xảy ra";
            });
    },
});

export const { clearAdminError } = adminSubSlice.actions;
export default adminSubSlice.reducer;