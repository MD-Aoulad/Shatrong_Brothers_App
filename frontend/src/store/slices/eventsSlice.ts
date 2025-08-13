import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { EconomicEvent } from '../../types';
import { api } from '../../services/api';

interface EventsState {
  events: EconomicEvent[];
  loading: boolean;
  error: string | null;
}

const initialState: EventsState = {
  events: [],
  loading: false,
  error: null,
};

export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (currency?: string) => {
    const url = currency ? `/events/${currency}` : '/events';
    const response = await api.get(url);
    return response.data;
  }
);

export const fetchUpcomingEvents = createAsyncThunk(
  'events/fetchUpcoming',
  async (currency?: string) => {
    const url = currency ? `/events/${currency}/upcoming` : '/events/upcoming';
    const response = await api.get(url);
    return response.data;
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    addEvent: (state, action: PayloadAction<EconomicEvent>) => {
      state.events.unshift(action.payload);
    },
    updateEvent: (state, action: PayloadAction<EconomicEvent>) => {
      const index = state.events.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = action.payload;
      }
    },
    removeEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter((e) => e.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch events';
      })
      .addCase(fetchUpcomingEvents.fulfilled, (state, action) => {
        state.events = action.payload;
      });
  },
});

export const { addEvent, updateEvent, removeEvent } = eventsSlice.actions;
export default eventsSlice.reducer;
