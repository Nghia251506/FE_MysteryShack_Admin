import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DisputeResponse, PageResponse, ResolveDisputeRequest } from '../../types/dispute';
import { adminDisputeService } from '../../services/disputeService';

interface AdminDisputeState {
    disputePage: PageResponse<DisputeResponse> | null;
    loading: boolean;
    error: string | null;
    filterStatus: string;
    searchKeyword: string;
    currentPage: number;
    resolutionDraft: {
        disputeId: number | null;
        status: 'RESOLVED_REFUND' | 'RESOLVED_REJECT';
        adminNote: string;
    };
}

const initialState: AdminDisputeState = {
    disputePage: null,
    loading: false,
    error: null,
    filterStatus: '',
    searchKeyword: '',
    currentPage: 0,
    resolutionDraft: {
        disputeId: null,
        status: 'RESOLVED_REJECT',
        adminNote: '',
    }
};

// Thunk lấy danh sách
export const fetchAllDisputesThunk = createAsyncThunk(
    'adminDisputes/fetchAll',
    async (_, { getState, rejectWithValue }) => {
        const { adminDisputes } = getState() as any;
        try {
            return await adminDisputeService.getAll(
                adminDisputes.filterStatus,
                adminDisputes.searchKeyword,
                adminDisputes.currentPage
            );
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi tải danh sách');
        }
    }
);

// Thunk giải quyết tranh chấp
export const resolveDisputeThunk = createAsyncThunk(
    'adminDisputes/resolve',
    async ({ id, data }: { id: number; data: ResolveDisputeRequest }, { rejectWithValue, dispatch }) => {
        try {
            const result = await adminDisputeService.resolve(id, data);
            dispatch(fetchAllDisputesThunk()); // Xử lý xong thì load lại danh sách cho mới
            return result;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Xử lý thất bại');
        }
    }
);

const adminDisputeSlice = createSlice({
    name: 'adminDisputes',
    initialState,
    reducers: {
        setFilterStatus: (state, action: PayloadAction<string>) => {
            state.filterStatus = action.payload;
            state.currentPage = 0;
        },
        setSearchKeyword: (state, action: PayloadAction<string>) => {
            state.searchKeyword = action.payload;
            state.currentPage = 0;
        },
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        updateDraft: (state, action: PayloadAction<{ adminNote?: string; status?: any; disputeId?: number }>) => {
            state.resolutionDraft = { ...state.resolutionDraft, ...action.payload };
        },
        resetDraft: (state) => {
            state.resolutionDraft = initialState.resolutionDraft;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllDisputesThunk.pending, (state) => { state.loading = true; })
            .addCase(fetchAllDisputesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.disputePage = action.payload;
            })
            .addCase(fetchAllDisputesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setFilterStatus, setSearchKeyword, setCurrentPage,updateDraft, resetDraft } = adminDisputeSlice.actions;
export default adminDisputeSlice.reducer;