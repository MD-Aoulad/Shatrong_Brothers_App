import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DashboardData, CurrencySentiment, EconomicEvent } from '../../types';
import { api } from '../../services/api';

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async () => {
    console.log('🔍 Fetching dashboard data...');
    const response = await api.get('/dashboard');
    console.log('📊 API Response:', response.data);
    console.log('📈 Events count:', response.data.recentEvents?.length || 0);
    console.log('💰 Currencies:', response.data.currencySentiments?.map((cs: any) => cs.currency) || []);
    return response.data;
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    updateCurrencySentiment: (state, action: PayloadAction<CurrencySentiment>) => {
      if (state.data) {
        const index = state.data.currencySentiments.findIndex(
          (cs) => cs.currency === action.payload.currency
        );
        if (index !== -1) {
          state.data.currencySentiments[index] = action.payload;
        }
      }
    },
    addNewEvent: (state, action: PayloadAction<EconomicEvent>) => {
      if (state.data) {
        state.data.recentEvents.unshift(action.payload);
        if (state.data.recentEvents.length > 10) {
          state.data.recentEvents.pop();
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        console.log('✅ Dashboard data fetched successfully');
        console.log('📊 Storing data:', action.payload);
        console.log('📈 Events being stored:', action.payload.recentEvents?.length || 0);
        state.loading = false;
        state.data = action.payload;
        console.log('💾 State updated, events count:', state.data?.recentEvents?.length || 0);
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard data';
      });
  },
});

export const { updateCurrencySentiment, addNewEvent } = dashboardSlice.actions;
export default dashboardSlice.reducer;
