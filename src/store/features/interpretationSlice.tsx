import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { interpretationService } from '../../services/interpretationService';
import { InterpretationResponseDto } from '../../types/interpretation';

// store/features/interpretationSlice.ts
export const fetchInterpretationDetailThunk = createAsyncThunk(
    'interpretation/fetchDetail',
    async (sessionId: number, { rejectWithValue }) => {
        try {
            const data = await interpretationService.getDetailBySessionId(sessionId);
            console.log("--- DATA TỪ SERVICE TRẢ VỀ:", data); // Thêm dòng này
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const interpretationSlice = createSlice({
    name: 'interpretation',
    initialState: {
        selectedDetail: null as InterpretationResponseDto | null,
        loading: false,
        error: null as string | null
    },
    reducers: {
        clearSelectedDetail: (state) => {
            state.selectedDetail = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchInterpretationDetailThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInterpretationDetailThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedDetail = action.payload;
            })
            .addCase(fetchInterpretationDetailThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.selectedDetail = null;
            });
    }
});

export const { clearSelectedDetail } = interpretationSlice.actions;
export default interpretationSlice.reducer;