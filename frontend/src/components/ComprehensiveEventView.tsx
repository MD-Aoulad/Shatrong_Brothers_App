import React, { useState, useEffect } from 'react';
import { EconomicEvent, Currency } from '../types';
import { api } from '../services/api';
import './ComprehensiveEventView.css';

interface ComprehensiveEventViewProps {
  events: EconomicEvent[];
}

const ComprehensiveEventView: React.FC<ComprehensiveEventViewProps> = ({ events: initialEvents }) => {
  const [events, setEvents] = useState<EconomicEvent[]>(initialEvents);
  const [filteredEvents, setFilteredEvents] = useState<EconomicEvent[]>(initialEvents);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | 'ALL'>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);

  // Get all events on component mount
  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        setLoading(true);
        const response = await api.get('/events');
        setEvents(response.data);
        setFilteredEvents(response.data);
      } catch (error) {
        console.error('Error fetching all events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllEvents();
  }, []);

  // Filter events based on selected criteria
  useEffect(() => {
    let filtered = events;

    if (selectedCurrency !== 'ALL') {
      filtered = filtered.filter(event => event.currency === selectedCurrency);
    }

    if (selectedYear !== 'ALL') {
      filtered = filtered.filter(event => 
        new Date(event.date).getFullYear().toString() === selectedYear
      );
    }

    if (selectedSentiment !== 'ALL') {
      filtered = filtered.filter(event => event.sentiment === selectedSentiment);
    }

    setFilteredEvents(filtered);
  }, [events, selectedCurrency, selectedYear, selectedSentiment]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH': return '#10b981';
      case 'BEARISH': return '#ef4444';
      case 'NEUTRAL': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH': return '📈';
      case 'BEARISH': return '📉';
      case 'NEUTRAL': return '➡️';
      default: return '⚪';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'HIGH': return '🔴';
      case 'MEDIUM': return '🟡';
      case 'LOW': return '🟢';
      default: return '⚪';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const getUniqueYears = () => {
    const years = events.map(event => new Date(event.date).getFullYear());
    return Array.from(new Set(years)).sort((a, b) => b - a);
  };

  const getEventStats = () => {
    const stats = {
      total: filteredEvents.length,
      bullish: filteredEvents.filter(e => e.sentiment === 'BULLISH').length,
      bearish: filteredEvents.filter(e => e.sentiment === 'BEARISH').length,
      neutral: filteredEvents.filter(e => e.sentiment === 'NEUTRAL').length,
      byYear: {} as Record<string, number>,
      byCurrency: {} as Record<string, number>
    };

    filteredEvents.forEach(event => {
      const year = new Date(event.date).getFullYear().toString();
      const currency = event.currency;
      
      stats.byYear[year] = (stats.byYear[year] || 0) + 1;
      stats.byCurrency[currency] = (stats.byCurrency[currency] || 0) + 1;
    });

    return stats;
  };

  const stats = getEventStats();

  if (loading) {
    return (
      <div className="comprehensive-events-loading">
        <div className="loading-spinner"></div>
        <p>Loading comprehensive event data...</p>
      </div>
    );
  }

  return (
    <div className="comprehensive-events">
      <div className="events-header">
        <h2>Comprehensive Economic Events Data</h2>
        <div className="events-stats">
          <div className="stat-card">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Events</span>
          </div>
          <div className="stat-card bullish">
            <span className="stat-number">{stats.bullish}</span>
            <span className="stat-label">📈 Bullish</span>
          </div>
          <div className="stat-card bearish">
            <span className="stat-number">{stats.bearish}</span>
            <span className="stat-label">📉 Bearish</span>
          </div>
          <div className="stat-card neutral">
            <span className="stat-number">{stats.neutral}</span>
            <span className="stat-label">➡️ Neutral</span>
          </div>
        </div>
      </div>

      <div className="events-filters">
        <div className="filter-group">
          <label>Currency:</label>
          <select 
            value={selectedCurrency} 
            onChange={(e) => setSelectedCurrency(e.target.value as Currency | 'ALL')}
          >
            <option value="ALL">All Currencies</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="JPY">JPY</option>
            <option value="GBP">GBP</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Year:</label>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="ALL">All Years</option>
            {getUniqueYears().map(year => (
              <option key={year} value={year.toString()}>{year}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sentiment:</label>
          <select 
            value={selectedSentiment} 
            onChange={(e) => setSelectedSentiment(e.target.value)}
          >
            <option value="ALL">All Sentiments</option>
            <option value="BULLISH">Bullish</option>
            <option value="BEARISH">Bearish</option>
            <option value="NEUTRAL">Neutral</option>
          </select>
        </div>
      </div>

      <div className="events-distribution">
        <div className="distribution-section">
          <h3>Events by Year</h3>
          <div className="distribution-bars">
            {Object.entries(stats.byYear).map(([year, count]) => (
              <div key={year} className="distribution-bar">
                <span className="bar-label">{year}</span>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${(count / stats.total) * 100}%` }}
                  ></div>
                </div>
                <span className="bar-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="distribution-section">
          <h3>Events by Currency</h3>
          <div className="distribution-bars">
            {Object.entries(stats.byCurrency).map(([currency, count]) => (
              <div key={currency} className="distribution-bar">
                <span className="bar-label">{currency}</span>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${(count / stats.total) * 100}%` }}
                  ></div>
                </div>
                <span className="bar-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="events-list">
        <h3>Events ({filteredEvents.length})</h3>
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-card-header">
                <div className="event-currency-badge" style={{ backgroundColor: getSentimentColor(event.sentiment) }}>
                  {event.currency}
                </div>
                <div className="event-sentiment">
                  {getSentimentIcon(event.sentiment)} {event.sentiment}
                </div>
                <div className="event-impact">
                  {getImpactIcon(event.impact)} {event.impact}
                </div>
              </div>
              
              <div className="event-card-body">
                <h4 className="event-title">{event.title}</h4>
                <p className="event-description">{event.description}</p>
                
                <div className="event-metrics">
                  {event.actualValue && (
                    <div className="metric">
                      <span className="metric-label">Actual:</span>
                      <span className="metric-value">{event.actualValue}</span>
                    </div>
                  )}
                  {event.expectedValue && (
                    <div className="metric">
                      <span className="metric-label">Expected:</span>
                      <span className="metric-value">{event.expectedValue}</span>
                    </div>
                  )}
                  {event.previousValue && (
                    <div className="metric">
                      <span className="metric-label">Previous:</span>
                      <span className="metric-value">{event.previousValue}</span>
                    </div>
                  )}
                  {event.priceImpact && (
                    <div className="metric">
                      <span className="metric-label">Price Impact:</span>
                      <span className={`metric-value ${event.priceImpact > 0 ? 'positive' : 'negative'}`}>
                        {event.priceImpact > 0 ? '+' : ''}{event.priceImpact}%
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="event-confidence">
                  <span className="confidence-label">Confidence:</span>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill" 
                      style={{ 
                        width: `${event.confidenceScore}%`,
                        backgroundColor: getSentimentColor(event.sentiment)
                      }}
                    ></div>
                  </div>
                  <span className="confidence-value">{event.confidenceScore}%</span>
                </div>
              </div>
              
              <div className="event-card-footer">
                <span className="event-date">{formatDate(event.date)}</span>
                <span className="event-source">{event.source}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveEventView;
