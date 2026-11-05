import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchPayments = createAsyncThunk(
  'payments/fetchPayments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/payments', { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const recordPayment = createAsyncThunk(
  'payments/recordPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const res = await api.post('/payments', paymentData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const paymentSlice = createSlice({
  name: 'payments',
  initialState: {
    payments: [],
    loading: false,
    error: null,
    total: 0,
    totalPages: 1,
    currentPage: 1,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Payments
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.data;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Record Payment
      .addCase(recordPayment.fulfilled, (state, action) => {
        state.payments.unshift(action.payload);
        state.total += 1;
      });
  },
});

export default paymentSlice.reducer;

