import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CurrencySentiment, SentimentHistory } from '../../types';
import { api } from '../../services/api';

interface CurrencyState {
  sentiments: CurrencySentiment[];
  history: SentimentHistory[];
  loading: boolean;
  error: string | null;
}

const initialState: CurrencyState = {
  sentiments: [],
  history: [],
  loading: false,
  error: null,
};

export const fetchCurrencySentiments = createAsyncThunk(
  'currency/fetchSentiments',
  async () => {
    const response = await api.get('/sentiment');
    return response.data;
  }
);

export const fetchCurrencyHistory = createAsyncThunk(
  'currency/fetchHistory',
  async ({ currency, startDate, endDate }: { currency: string; startDate: string; endDate: string }) => {
    const response = await api.get(`/sentiment/${currency}/history?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  }
);

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    updateSentiment: (state, action: PayloadAction<CurrencySentiment>) => {
      const index = state.sentiments.findIndex(
        (s) => s.currency === action.payload.currency
      );
      if (index !== -1) {
        state.sentiments[index] = action.payload;
      } else {
        state.sentiments.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrencySentiments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrencySentiments.fulfilled, (state, action) => {
        state.loading = false;
        state.sentiments = action.payload;
      })
      .addCase(fetchCurrencySentiments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch currency sentiments';
      })
      .addCase(fetchCurrencyHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      });
  },
});

export const { updateSentiment } = currencySlice.actions;
export default currencySlice.reducer;
