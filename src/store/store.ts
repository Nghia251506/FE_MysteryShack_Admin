import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
// Import thêm các reducer khác tại đây (VD: readerReducer, userReducer...)
import userReducer from "./features/userSlice"
import adminSubReducer from "./features/adminSubscriptionSlice";
import dashboardReducer from "./features/dashboardSlice";
import vippackageReducer from "./features/vipPackageSlice"
import sessionReducer from "./features/sessionSlice"
import adminDisputeReducer from "./features/adminDisputeSlice"
import interpretationReducer from "./features/interpretationSlice"
export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    adminSub: adminSubReducer,
    dashboard: dashboardReducer,
    adminVipPackage: vippackageReducer,
    sessions: sessionReducer,
    adminDisputes: adminDisputeReducer,
    interpretation: interpretationReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Export Type để dùng cho TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;