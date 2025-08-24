import React, { useState, useEffect } from 'react';
import { useDataRefresh } from '../hooks/useDataRefresh';
import { dataRefreshApi } from '../services/api';
import './Dashboard.css';

interface CurrencyData {
  currency: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  price: number;
  change: number;
  changePercent: number;
}

interface EconomicEvent {
  id: string;
  currency: string;
  title: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  eventDate: Date;
  actualValue?: number;
  expectedValue?: number;
  previousValue?: number;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

interface CurrencyPowerScore {
  currency: string;
  totalScore: number;
  strength: 'STRONG' | 'MODERATE' | 'WEAK';
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  newsCount: number;
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
}

interface ForexDataSummary {
  totalEvents: number;
  currencies: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

const Dashboard: React.FC = () => {
  // Data refresh hook
  const { 
    isRefreshing, 
    lastRefresh, 
    refreshCount, 
    error, 
    refreshData, 
    canRefresh, 
    timeSinceLastRefresh 
  } = useDataRefresh(true); // Auto-refresh on mount

  const [currencies, setCurrencies] = useState<CurrencyData[]>([
    {
      currency: 'EUR/USD',
      sentiment: 'BULLISH',
      confidence: 85,
      price: 1.0925,
      change: 0.0025,
      changePercent: 0.23
    },
    {
      currency: 'GBP/USD',
      sentiment: 'BEARISH',
      confidence: 72,
      price: 1.2678,
      change: -0.0032,
      changePercent: -0.25
    },
    {
      currency: 'USD/JPY',
      sentiment: 'NEUTRAL',
      confidence: 45,
      price: 148.95,
      change: 0.15,
      changePercent: 0.10
    },
    {
      currency: 'USD/CHF',
      sentiment: 'BULLISH',
      confidence: 68,
      price: 0.8845,
      change: 0.0012,
      changePercent: 0.14
    }
  ]);

  const [marketStatus, setMarketStatus] = useState({
    isOpen: true,
    lastUpdate: new Date(),
    totalVolume: '2.4T',
    activePairs: 28
  });

  const [economicEvents, setEconomicEvents] = useState<EconomicEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [currencyPowerScores, setCurrencyPowerScores] = useState<CurrencyPowerScore[]>([]);
  const [isLoadingPowerScores, setIsLoadingPowerScores] = useState(false);
  const [forexDataSummary, setForexDataSummary] = useState<ForexDataSummary | null>(null);

  // Fetch comprehensive forex data from the new API
  const fetchComprehensiveForexData = async () => {
    try {
      setIsLoadingPowerScores(true);
      setIsLoadingEvents(true);
      
      const response = await fetch('http://localhost:8002/api/comprehensive');
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          // Set currency power scores
          setCurrencyPowerScores(data.data.currencyPowerScores || []);
          
          // Set economic events
          const events = data.data.events || [];
          const formattedEvents = events.slice(0, 10).map((event: any) => ({
            id: event.id,
            currency: event.currency,
            title: event.title,
            impact: event.impact,
            eventDate: new Date(event.event_date),
            actualValue: event.actual_value,
            expectedValue: event.expected_value,
            previousValue: event.previous_value,
            sentiment: event.sentiment
          }));
          setEconomicEvents(formattedEvents);
          
          // Set summary data
          setForexDataSummary(data.data.summary);
        }
      }
    } catch (error) {
      console.error('Failed to fetch comprehensive forex data:', error);
    } finally {
      setIsLoadingPowerScores(false);
      setIsLoadingEvents(false);
    }
  };

  // Fetch latest data on mount and after refresh
  useEffect(() => {
    fetchComprehensiveForexData();
  }, []);

  // Refresh data when refreshData is called
  useEffect(() => {
    if (refreshCount > 0) {
      fetchComprehensiveForexData();
    }
  }, [refreshCount]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchComprehensiveForexData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Format currency power score for display
  const formatCurrencyPowerScore = (score: CurrencyPowerScore) => {
    const strengthColor = {
      'STRONG': '#22c55e',
      'MODERATE': '#f59e0b',
      'WEAK': '#ef4444'
    };

    const trendIcon = {
      'BULLISH': '📈',
      'BEARISH': '📉',
      'NEUTRAL': '➡️'
    };

    return (
      <div key={score.currency} className="currency-power-card">
        <div className="currency-header">
          <h3>{score.currency}</h3>
          <span className="trend-icon">{trendIcon[score.trend]}</span>
        </div>
        <div className="power-score">
          <span className="score-value" style={{ color: strengthColor[score.strength] }}>
            {score.totalScore}/100
          </span>
          <span className="strength-badge" style={{ backgroundColor: strengthColor[score.strength] }}>
            {score.strength}
          </span>
        </div>
        <div className="trend-info">
          <span className="trend-text">{score.trend}</span>
        </div>
        <div className="news-stats">
          <small>📰 {score.newsCount} events | 🟢 {score.bullishCount} | 🔴 {score.bearishCount} | ⚪ {score.neutralCount}</small>
        </div>
      </div>
    );
  };

  // Format economic event for display
  const formatEconomicEvent = (event: EconomicEvent) => {
    const impactColor = {
      'HIGH': '#ef4444',
      'MEDIUM': '#f59e0b',
      'LOW': '#22c55e'
    };

    const sentimentIcon = {
      'BULLISH': '🟢',
      'BEARISH': '🔴',
      'NEUTRAL': '⚪'
    };

    return (
      <div key={event.id} className="economic-event-card">
        <div className="event-header">
          <span className="currency-badge">{event.currency}</span>
          <span 
            className="impact-badge" 
            style={{ backgroundColor: impactColor[event.impact] }}
          >
            {event.impact}
          </span>
          <span className="sentiment-icon">{sentimentIcon[event.sentiment]}</span>
        </div>
        <h4 className="event-title">{event.title}</h4>
        <div className="event-details">
          <span className="event-date">
            📅 {event.eventDate.toLocaleDateString()}
          </span>
          {event.actualValue && (
            <span className="actual-value">
              📊 Actual: {event.actualValue}
            </span>
          )}
          {event.expectedValue && (
            <span className="expected-value">
              🎯 Expected: {event.expectedValue}
            </span>
          )}
        </div>
      </div>
    );
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH':
        return 'var(--forex-green)';
      case 'BEARISH':
        return 'var(--forex-red)';
      default:
        return 'var(--forex-yellow)';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH':
        return '📈';
      case 'BEARISH':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'HIGH':
        return 'var(--forex-red)';
      case 'MEDIUM':
        return 'var(--forex-yellow)';
      default:
        return 'var(--forex-green)';
    }
  };

  const formatEventDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="dashboard">
      {/* Data Summary */}
      {forexDataSummary && (
        <div className="card">
          <h2>📊 Data Summary</h2>
          <div className="data-summary-grid">
            <div className="summary-item">
              <span className="summary-label">Total Events</span>
              <span className="summary-value">{forexDataSummary.totalEvents.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Currencies</span>
              <span className="summary-value">{forexDataSummary.currencies.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Data Coverage</span>
              <span className="summary-value">
                {new Date(forexDataSummary.dateRange.start).toLocaleDateString()} - {new Date(forexDataSummary.dateRange.end).toLocaleDateString()}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Last Update</span>
              <span className="summary-value">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Data Refresh Controls */}
      <div className="card">
        <h2>🔄 Data Management</h2>
        <div className="refresh-controls">
          <div className="refresh-info">
            <p>
              <strong>Last Refresh:</strong> {lastRefresh ? lastRefresh.toLocaleString() : 'Never'}
            </p>
            <p>
              <strong>Refresh Count:</strong> {refreshCount}
            </p>
            <p>
              <strong>Time Since Last Refresh:</strong> {timeSinceLastRefresh}
            </p>
          </div>
          <div className="refresh-actions">
            <button 
              className="btn btn-primary"
              onClick={refreshData}
              disabled={!canRefresh || isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <span className="loading"></span> Refreshing...
                </>
              ) : (
                '🔄 Refresh Data'
              )}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={fetchComprehensiveForexData}
              disabled={isLoadingEvents || isLoadingPowerScores}
            >
              {isLoadingEvents || isLoadingPowerScores ? (
                <>
                  <span className="loading"></span> Loading...
                </>
              ) : (
                '📊 Load Latest Data'
              )}
            </button>
          </div>
        </div>
        {error && (
          <div className="error-message">
            ❌ Error: {error}
          </div>
        )}
      </div>

      {/* Market Status Header */}
      <div className="card">
        <h2>🌍 Market Status</h2>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="dashboard-value" style={{ color: marketStatus.isOpen ? 'var(--forex-green)' : 'var(--forex-red)' }}>
              {marketStatus.isOpen ? 'OPEN' : 'CLOSED'}
            </div>
            <div className="dashboard-label">Market Status</div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-value">{marketStatus.totalVolume}</div>
            <div className="dashboard-label">Total Volume</div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-value">{marketStatus.activePairs}</div>
            <div className="dashboard-label">Active Pairs</div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-value">
              {marketStatus.lastUpdate.toLocaleTimeString()}
            </div>
            <div className="dashboard-label">Last Update</div>
          </div>
        </div>
      </div>

      {/* Currency Sentiment Grid */}
      <div className="card">
        <h2>💱 Currency Sentiment Analysis</h2>
        <div className="currency-grid">
          {currencies.map((currency, index) => (
            <div key={index} className="currency-card">
              <div className="currency-header">
                <div className="currency-code">{currency.currency}</div>
                <div className="currency-sentiment" style={{ color: getSentimentColor(currency.sentiment) }}>
                  {getSentimentIcon(currency.sentiment)} {currency.sentiment}
                </div>
              </div>
              <div className="currency-price">${currency.price.toFixed(4)}</div>
              <div className={`currency-change ${currency.change >= 0 ? 'positive' : 'negative'}`}>
                {currency.change >= 0 ? '+' : ''}{currency.change.toFixed(4)} ({currency.changePercent >= 0 ? '+' : ''}{currency.changePercent.toFixed(2)}%)
              </div>
              <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--forex-text-secondary)' }}>
                Confidence: {currency.confidence}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Economic Events from Forex Factory */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>📅 Economic Events (Forex Factory)</h2>
          <button 
            className="btn btn-secondary"
            onClick={fetchComprehensiveForexData}
            disabled={isLoadingEvents || isLoadingPowerScores}
          >
            {isLoadingEvents || isLoadingPowerScores ? (
              <>
                <span className="loading"></span> Loading...
              </>
            ) : (
              '🔄 Refresh Events'
            )}
          </button>
        </div>
        
        {economicEvents.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Currency</th>
                  <th>Event</th>
                  <th>Impact</th>
                  <th>Date/Time</th>
                  <th>Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {economicEvents.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <strong>{event.currency}</strong>
                    </td>
                    <td>{event.title}</td>
                    <td>
                      <span 
                        className="status" 
                        style={{ 
                          backgroundColor: getImpactColor(event.impact) + '20',
                          color: getImpactColor(event.impact),
                          borderColor: getImpactColor(event.impact)
                        }}
                      >
                        {event.impact}
                      </span>
                    </td>
                    <td>{formatEventDate(event.eventDate)}</td>
                    <td>
                      <span 
                        className="status" 
                        style={{ 
                          backgroundColor: getSentimentColor(event.sentiment) + '20',
                          color: getSentimentColor(event.sentiment),
                          borderColor: getSentimentColor(event.sentiment)
                        }}
                      >
                        {event.sentiment}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--forex-text-secondary)' }}>
            {isLoadingEvents || isLoadingPowerScores ? (
              <>
                <span className="loading"></span> Loading economic events...
              </>
            ) : (
              'No economic events available. Click "Refresh Events" to load data.'
            )}
          </div>
        )}
      </div>

      {/* Currency Power Scores */}
      <div className="card">
        <h2>💪 Currency Power Scores</h2>
        {isLoadingPowerScores ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--forex-text-secondary)' }}>
            <span className="loading"></span> Loading power scores...
          </div>
        ) : currencyPowerScores.length > 0 ? (
          <div className="currency-power-grid">
            {currencyPowerScores.map(formatCurrencyPowerScore)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--forex-text-secondary)' }}>
            No currency power scores available.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
