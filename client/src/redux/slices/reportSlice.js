import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchDashboardStats = createAsyncThunk(
  'reports/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/reports/dashboard');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  'reports/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/reports/analytics');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState: {
    dashboard: null,
    analytics: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default reportSlice.reducer;

