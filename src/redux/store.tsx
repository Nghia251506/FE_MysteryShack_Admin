import { configureStore } from '@reduxjs/toolkit';
import tarotCardReducer from './tarotCardSlice';

export const store = configureStore({
  reducer: {
    tarotCard: tarotCardReducer,
    // Thêm các slice khác ở đây sau này (auth, zodiac, history...)
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,  // Tắt check nếu có Date hoặc function
    }),
});

// Type cho dispatch và state
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;