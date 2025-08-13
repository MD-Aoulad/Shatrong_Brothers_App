export type Currency = 'EUR' | 'USD' | 'JPY' | 'GBP' | 'CAD';

export type Sentiment = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export type Trend = 'STRENGTHENING' | 'WEAKENING' | 'STABLE';

export type Impact = 'HIGH' | 'MEDIUM' | 'LOW';

export type EventType = 'CPI' | 'GDP' | 'INTEREST_RATE' | 'EMPLOYMENT' | 'RETAIL_SALES' | 'POLITICAL' | 'NEWS' | 'CENTRAL_BANK';

export interface EconomicEvent {
  id: string;
  currency: Currency;
  eventType: EventType;
  title: string;
  description: string;
  date: Date;
  actualValue?: number;
  expectedValue?: number;
  previousValue?: number;
  impact: Impact;
  sentiment: Sentiment;
  confidenceScore: number;
  priceImpact?: number;
  source: string;
  url?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CurrencySentiment {
  id: string;
  currency: Currency;
  currentSentiment: Sentiment;
  confidenceScore: number;
  trend: Trend;
  lastUpdated: Date;
  recentEvents: EconomicEvent[];
}

export interface SentimentHistory {
  date: Date;
  sentiment: Sentiment;
  confidenceScore: number;
  priceChange?: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  defaultCurrencies: Currency[];
  alertSettings: AlertSettings;
  timezone: string;
}

export interface AlertSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  sentimentThreshold: number;
  eventTypes: EventType[];
}

export interface DashboardData {
  currencySentiments: CurrencySentiment[];
  recentEvents: EconomicEvent[];
  marketStatus: string;
  activeAlerts: number;
}

export interface ChartDataPoint {
  date: Date;
  sentiment: number;
  confidence: number;
  priceChange?: number;
}
