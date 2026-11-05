import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import invoiceReducer from './slices/invoiceSlice';
import customerReducer from './slices/customerSlice';
import productReducer from './slices/productSlice';
import paymentReducer from './slices/paymentSlice';
import reportReducer from './slices/reportSlice';
import notificationReducer from './slices/notificationSlice';
import settingReducer from './slices/settingSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    invoices: invoiceReducer,
    customers: customerReducer,
    products: productReducer,
    payments: paymentReducer,
    reports: reportReducer,
    notifications: notificationReducer,
    settings: settingReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;

