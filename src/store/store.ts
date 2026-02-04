import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
// Import thêm các reducer khác tại đây (VD: readerReducer, userReducer...)
import userReducer from "./features/userSlice"
export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Export Type để dùng cho TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;