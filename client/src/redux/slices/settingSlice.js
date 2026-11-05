import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/settings');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (settingsData, { rejectWithValue }) => {
    try {
      const res = await api.put('/settings', settingsData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchAuditLogs = createAsyncThunk(
  'settings/fetchAuditLogs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/settings/audit-logs', { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const settingSlice = createSlice({
  name: 'settings',
  initialState: {
    settings: null,
    auditLogs: [],
    auditTotal: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Settings
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      // Fetch Audit Logs
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.auditLogs = action.payload.data;
        state.auditTotal = action.payload.total;
      });
  },
});

export default settingSlice.reducer;

