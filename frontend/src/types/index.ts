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

// New Trading Strategy Types
export interface StrategySignal {
  id: string;
  pair: string;
  signal: 'BUY' | 'SELL' | 'HOLD' | 'READY';
  confidence: number;
  powerScore: number;
  emaTouches: number;
  session: 'ASIA' | 'LONDON' | 'NEW_YORK' | 'CLOSED';
  entryPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  riskReward: number;
  timestamp: Date;
  conditions: string[];
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface PowerScore {
  currency: string;
  score: number;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  strength: 'EXTREME' | 'STRONG' | 'MODERATE' | 'WEAK';
  lastUpdate: Date;
}

export interface EMAStatus {
  pair: string;
  h1Touches: number;
  m15Touches: number;
  alignment: 'PERFECT' | 'GOOD' | 'FAIR' | 'POOR';
  trend: 'STRONG_UP' | 'UP' | 'NEUTRAL' | 'DOWN' | 'STRONG_DOWN';
  lastUpdate: Date;
}

export interface SessionInfo {
  current: 'ASIA' | 'LONDON' | 'NEW_YORK' | 'CLOSED';
  nextAnalysis: Date;
  countdown: string;
  status: 'ACTIVE' | 'BREAK' | 'CLOSED';
}

export interface StrategyPerformance {
  totalSignals: number;
  successfulSignals: number;
  winRate: number;
  averageProfit: number;
  totalProfit: number;
  maxDrawdown: number;
  sharpeRatio: number;
  lastUpdate: Date;
}

export interface ChartDataPoint {
  date: Date;
  sentiment: number;
  confidence: number;
  priceChange?: number;
}
