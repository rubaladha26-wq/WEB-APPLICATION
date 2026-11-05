import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/invoices', { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchInvoiceById = createAsyncThunk(
  'invoices/fetchInvoiceById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/invoices/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createInvoice = createAsyncThunk(
  'invoices/createInvoice',
  async (invoiceData, { rejectWithValue }) => {
    try {
      const res = await api.post('/invoices', invoiceData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateInvoice = createAsyncThunk(
  'invoices/updateInvoice',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/invoices/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteInvoice = createAsyncThunk(
  'invoices/deleteInvoice',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/invoices/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const emailInvoice = createAsyncThunk(
  'invoices/emailInvoice',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.post(`/invoices/${id}/send`);
      return { id, message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState: {
    invoices: [],
    currentInvoice: null,
    payments: [],
    loading: false,
    error: null,
    total: 0,
    totalPages: 1,
    currentPage: 1,
  },
  reducers: {
    clearCurrentInvoice: (state) => {
      state.currentInvoice = null;
      state.payments = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Invoices
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload.data;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Invoice
      .addCase(fetchInvoiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvoice = action.payload.invoice;
        state.payments = action.payload.payments;
      })
      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Invoice
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.invoices.unshift(action.payload);
        state.total += 1;
      })
      // Update Invoice
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.currentInvoice = action.payload;
        const index = state.invoices.findIndex((inv) => inv._id === action.payload._id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      // Delete Invoice
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.invoices = state.invoices.filter((inv) => inv._id !== action.payload);
        state.total -= 1;
      });
  },
});

export const { clearCurrentInvoice } = invoiceSlice.actions;
export default invoiceSlice.reducer;

