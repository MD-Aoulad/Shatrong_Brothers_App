import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './slices/dashboardSlice';
import currencyReducer from './slices/currencySlice';
import eventsReducer from './slices/eventsSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    currency: currencyReducer,
    events: eventsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
