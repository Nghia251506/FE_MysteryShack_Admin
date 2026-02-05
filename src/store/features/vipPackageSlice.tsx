import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import VipPackageService from '../../services/VipPackageService';
import { AdminVipPackage, CreateVipPackageDTO } from '@/types/admin';
import { VipPackageSummary } from '@/types/vipPackage';

interface VipPackageState {
    packages: AdminVipPackage[];
    summary: VipPackageSummary | null;
    loading: boolean;
    error: string | null;
}

const initialState: VipPackageState = {
    packages: [],
    summary: null,
    loading: false,
    error: null,
};

// --- ASYNC THUNKS (THỰC THI SERVICE) ---

// 1. Lấy danh sách gói
export const fetchAllVipPackages = createAsyncThunk(
    'adminVipPackage/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await VipPackageService.getAllPackages();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Không thể lấy danh sách gói');
        }
    }
);

// 2. Lấy thống kê summary
export const fetchVipSummary = createAsyncThunk(
    'adminVipPackage/fetchSummary',
    async (_, { rejectWithValue }) => {
        try {
            return await VipPackageService.getSummary();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Không thể lấy thống kê');
        }
    }
);

// 3. Toggle trạng thái (Active/Inactive)
export const toggleVipStatus = createAsyncThunk(
    'adminVipPackage/toggleStatus',
    async (id: number, { rejectWithValue }) => {
        try {
            return await VipPackageService.toggleStatus(id);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi cập nhật trạng thái');
        }
    }
);

// 4. Tạo gói mới
export const createVipPackage = createAsyncThunk(
    'adminVipPackage/create',
    async (data: CreateVipPackageDTO, { rejectWithValue, dispatch }) => {
        try {
            const result = await VipPackageService.createPackage(data);
            dispatch(fetchVipSummary()); // Cập nhật lại summary sau khi thêm mới
            return result;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi tạo gói mới');
        }
    }
);

// 5. Xóa gói
export const deleteVipPackage = createAsyncThunk(
    'adminVipPackage/delete',
    async (id: number, { rejectWithValue, dispatch }) => {
        try {
            await VipPackageService.deletePackage(id);
            dispatch(fetchVipSummary()); // Cập nhật lại summary sau khi xóa
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi xóa gói');
        }
    }
);

// --- SLICE (LƯU STATE) ---

const vipPackageSlice = createSlice({
    name: 'adminVipPackage',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Xử lý fetchAll
            .addCase(fetchAllVipPackages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllVipPackages.fulfilled, (state, action: PayloadAction<AdminVipPackage[]>) => {
                state.loading = false;
                state.packages = action.payload;
            })
            .addCase(fetchAllVipPackages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Xử lý Summary
            .addCase(fetchVipSummary.fulfilled, (state, action: PayloadAction<VipPackageSummary>) => {
                state.summary = action.payload;
            })

            // Xử lý Toggle Status (Cập nhật trực tiếp vào mảng packages để UI đổi màu ngay)
            .addCase(toggleVipStatus.fulfilled, (state, action: PayloadAction<AdminVipPackage>) => {
                const index = state.packages.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.packages[index] = action.payload;
                }
            })

            // Xử lý Create
            .addCase(createVipPackage.fulfilled, (state, action: PayloadAction<AdminVipPackage>) => {
                state.packages.unshift(action.payload); // Thêm vào đầu danh sách
            })

            // Xử lý Delete
            .addCase(deleteVipPackage.fulfilled, (state, action: PayloadAction<number>) => {
                state.packages = state.packages.filter(p => p.id !== action.payload);
            });
    },
});

export const { clearError } = vipPackageSlice.actions;
export default vipPackageSlice.reducer;