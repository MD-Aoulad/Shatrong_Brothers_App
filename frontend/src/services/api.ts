import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const BIAS_API_BASE_URL = process.env.REACT_APP_BIAS_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const biasApi = axios.create({
  baseURL: `${BIAS_API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const dashboardApi = {
  getDashboard: () => api.get('/dashboard'),
  getCurrencySentiment: (currency: string) => api.get(`/sentiment/${currency}`),
  getCurrencyHistory: (currency: string, startDate: string, endDate: string) =>
    api.get(`/sentiment/${currency}/history?startDate=${startDate}&endDate=${endDate}`),
};

export const eventsApi = {
  getEvents: (currency?: string) => api.get(`/events${currency ? `/${currency}` : ''}`),
  getEvent: (id: string) => api.get(`/events/${id}`),
  getUpcomingEvents: (currency?: string) => api.get(`/events${currency ? `/${currency}` : ''}/upcoming`),
};

export const analyticsApi = {
  getPerformance: (currency: string) => api.get(`/analytics/${currency}/performance`),
  backtestStrategy: (params: any) => api.post('/analytics/strategy/backtest', params),
  getCorrelation: () => api.get('/analytics/correlation'),
};

export const biasApiClient = {
  getScorecard: (currency: string) => biasApi.get(`/scorecard/${currency}`),
  recompute: (payload: any) => biasApi.post(`/scorecard/recompute`, payload),
  getCalendar: (currency: string) => biasApi.get(`/calendar/${currency}`),
};
