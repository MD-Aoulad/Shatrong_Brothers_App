import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchDashboardData } from '../store/slices/dashboardSlice';
import CurrencyCard from './CurrencyCard';
import EventTimeline from './EventTimeline';
import ComprehensiveEventView from './ComprehensiveEventView';
import SentimentAnalysisInfo from './SentimentAnalysisInfo';
import AddNewsForm from './AddNewsForm';
import EventManagement from './EventManagement';
import MT5NewsWidget from './MT5NewsWidget';
import StrategyMonitor from './StrategyMonitor';
import BacktestTable from './BacktestTable';
import { EconomicEvent, CurrencySentiment } from '../types';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.dashboard);
  const [activeView, setActiveView] = useState<'overview' | 'comprehensive' | 'algorithm' | 'manage' | 'scorecard' | 'strategy' | 'backtest'>('overview');
  const [showAddNewsForm, setShowAddNewsForm] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const handleNewsAdded = (newEvent: EconomicEvent) => {
    // Refresh dashboard data to include the new event
    dispatch(fetchDashboardData());
    setShowAddNewsForm(false);
  };

  const handleCloseAddNews = () => {
    setShowAddNewsForm(false);
  };

  const handleEventUpdated = (updatedEvent: EconomicEvent) => {
    // Refresh dashboard data to reflect the updated event
    dispatch(fetchDashboardData());
  };

  const handleEventDeleted = (eventId: string) => {
    // Refresh dashboard data to reflect the deletion
    dispatch(fetchDashboardData());
  };

  const handleCurrencyClick = (currency: string) => {
    console.log('🎯 Currency clicked:', currency);
    console.log('🎯 Previous selection:', selectedCurrency);
    
    // Toggle selection: if same currency is clicked, deselect it; otherwise select the new one
    const newSelection = selectedCurrency === currency ? null : currency;
    setSelectedCurrency(newSelection);
    
    console.log('🎯 New selection:', newSelection);
    console.log('🎯 Available events:', data?.recentEvents?.length || 0);
    
    if (newSelection) {
      const filtered = data?.recentEvents?.filter(event => event.currency === newSelection) || [];
      console.log('🎯 Filtered events for', newSelection, ':', filtered.length);
      console.log('🎯 Sample filtered events:', filtered.slice(0, 3));
    }
  };

  // Filter events by selected currency
  const getFilteredEvents = (): EconomicEvent[] => {
    console.log('🔍 getFilteredEvents called with selectedCurrency:', selectedCurrency);
    if (!selectedCurrency || !data?.recentEvents) {
      console.log('🔍 No currency selected or no data, returning empty array');
      return [];
    }
    const filtered = data.recentEvents.filter(event => event.currency === selectedCurrency);
    console.log('🔍 Filtered events count:', filtered.length);
    return filtered;
  };

  // Get all events (either filtered or all) with duplicate prevention
  const getDisplayEvents = (): EconomicEvent[] => {
    const events = selectedCurrency ? getFilteredEvents() : (data?.recentEvents || []);
    
    // Remove duplicates based on title, currency, and date
    const uniqueEvents = events.filter((event, index, self) => {
      const firstIndex = self.findIndex(e => 
        e.title === event.title && 
        e.currency === event.currency && 
        Math.abs(new Date(e.date).getTime() - new Date(event.date).getTime()) < 60000 // Within 1 minute
      );
      return index === firstIndex;
    });
    
    console.log('🔍 getDisplayEvents returning:', uniqueEvents.length, 'unique events (filtered from', events.length, 'total)');
    return uniqueEvents;
  };

  // Get events count for display
  const getEventsCount = (): { total: number; filtered: number } => {
    const total = data?.recentEvents?.length || 0;
    const filtered = selectedCurrency ? getFilteredEvents().length : total;
    return { total, filtered };
  };

  // Get sentiment details for selected currency
  const getSelectedCurrencySentiment = (): CurrencySentiment | null => {
    if (!selectedCurrency || !data?.currencySentiments) return null;
    return data.currencySentiments.find(s => s.currency === selectedCurrency) || null;
  };

  // Calculate sentiment breakdown for selected currency
  const getSentimentBreakdown = () => {
    const filteredEvents = getFilteredEvents();
    const breakdown = {
      bullish: 0,
      bearish: 0,
      neutral: 0,
      totalEvents: filteredEvents.length,
      highImpact: 0,
      mediumImpact: 0,
      lowImpact: 0
    };

    filteredEvents.forEach(event => {
      switch (event.sentiment) {
        case 'BULLISH':
          breakdown.bullish++;
          break;
        case 'BEARISH':
          breakdown.bearish++;
          break;
        case 'NEUTRAL':
          breakdown.neutral++;
          break;
      }

      switch (event.impact) {
        case 'HIGH':
          breakdown.highImpact++;
          break;
        case 'MEDIUM':
          breakdown.mediumImpact++;
          break;
        case 'LOW':
          breakdown.lowImpact++;
          break;
      }
    });

    return breakdown;
  };

  const selectedSentiment = getSelectedCurrencySentiment();
  const sentimentBreakdown = getSentimentBreakdown();

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <button onClick={() => dispatch(fetchDashboardData())}>Retry</button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dashboard-no-data">
        <h2>No Dashboard Data Available</h2>
        <p>Please check your connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Forex Fundamental Dashboard</h1>
        <div className="header-actions">
          <button 
            className={`nav-btn ${activeView === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveView('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`nav-btn ${activeView === 'comprehensive' ? 'active' : ''}`}
            onClick={() => setActiveView('comprehensive')}
          >
            📈 Comprehensive View
          </button>
          <button 
            className={`nav-btn ${activeView === 'scorecard' ? 'active' : ''}`}
            onClick={() => setActiveView('scorecard')}
          >
            🎯 Scorecard
          </button>
          <button 
            className={`nav-btn ${activeView === 'algorithm' ? 'active' : ''}`}
            onClick={() => setActiveView('algorithm')}
          >
            🧠 Algorithm Info
          </button>
          <button 
            className={`nav-btn ${activeView === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveView('manage')}
          >
            ⚙️ Manage Events
          </button>
          <button 
            className={`nav-btn ${activeView === 'strategy' ? 'active' : ''}`}
            onClick={() => setActiveView('strategy')}
          >
            🎯 Strategy Monitor
          </button>
          <button 
            className={`nav-btn ${activeView === 'backtest' ? 'active' : ''}`}
            onClick={() => setActiveView('backtest')}
          >
            📊 Backtest Results
          </button>
          <button 
            className="add-news-btn"
            onClick={() => setShowAddNewsForm(true)}
          >
            📰 Add News
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {activeView === 'overview' && (
          <>
            {/* Instructions Section */}
            <section className="instructions-section">
              <div className="instructions-content">
                <h3>🎯 How to Use Currency Filtering</h3>
                <p>
                  <strong>Click on any currency card below</strong> to filter and view all news & events related to that specific currency. 
                  The selected currency will show detailed sentiment analysis and filtered events below.
                </p>
                <div className="instruction-steps">
                  <div className="step">
                    <span className="step-number">1</span>
                    <span>Click a currency card to select it</span>
                  </div>
                  <div className="step">
                    <span className="step-number">2</span>
                    <span>View detailed analysis and filtered news</span>
                  </div>
                  <div className="step">
                    <span className="step-number">3</span>
                    <span>Click again or use "Clear Filter" to reset</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="currency-grid">
              <h2>Currency Sentiments</h2>
              <div className="currency-cards">
                {data.currencySentiments.map((sentiment) => (
                  <CurrencyCard
                    key={sentiment.currency}
                    sentiment={sentiment}
                    isSelected={selectedCurrency === sentiment.currency}
                    onClick={() => handleCurrencyClick(sentiment.currency)}
                  />
                ))}
              </div>
            </section>

            {/* Currency Detail Section - Shows when a currency is selected */}
            {selectedCurrency && selectedSentiment && (
              <section className="currency-detail-section">
                <div className="filter-summary">
                  <div className="filter-summary-content">
                    <span className="filter-summary-text">
                      🔍 Filtering events for <strong>{selectedCurrency}</strong> 
                      ({getEventsCount().filtered} of {getEventsCount().total} total events)
                    </span>
                    <button 
                      className="clear-filter-summary-btn"
                      onClick={() => setSelectedCurrency(null)}
                    >
                      Clear Filter
                    </button>
                  </div>
                </div>
                <div className="currency-detail-header">
                  <h2>
                    {selectedCurrency} - Detailed Analysis
                    <button 
                      className="close-currency-btn"
                      onClick={() => setSelectedCurrency(null)}
                    >
                      ✕
                    </button>
                  </h2>
                  <div className="currency-summary">
                    <div className="sentiment-summary">
                      <span className="current-sentiment">
                        Current Sentiment: <strong>{selectedSentiment.currentSentiment}</strong>
                      </span>
                      <span className="confidence-score">
                        Confidence: <strong>{selectedSentiment.confidenceScore}%</strong>
                      </span>
                      <span className="trend">
                        Trend: <strong>{selectedSentiment.trend}</strong>
                      </span>
                    </div>
                    <div className="sentiment-breakdown">
                      <h4>Sentiment Breakdown ({sentimentBreakdown.totalEvents} events analyzed)</h4>
                      <div className="breakdown-stats">
                        <div className="breakdown-item">
                          <span className="breakdown-label">🟢 Bullish:</span>
                          <span className="breakdown-value">{sentimentBreakdown.bullish}</span>
                        </div>
                        <div className="breakdown-item">
                          <span className="breakdown-label">🔴 Bearish:</span>
                          <span className="breakdown-value">{sentimentBreakdown.bearish}</span>
                        </div>
                        <div className="breakdown-item">
                          <span className="breakdown-label">🟡 Neutral:</span>
                          <span className="breakdown-value">{sentimentBreakdown.neutral}</span>
                        </div>
                      </div>
                      <div className="impact-breakdown">
                        <h5>Impact Level Distribution:</h5>
                        <div className="impact-stats">
                          <div className="impact-item">
                            <span className="impact-label">🔴 High Impact:</span>
                            <span className="impact-value">{sentimentBreakdown.highImpact}</span>
                          </div>
                          <div className="impact-item">
                            <span className="impact-label">🟡 Medium Impact:</span>
                            <span className="impact-value">{sentimentBreakdown.mediumImpact}</span>
                          </div>
                          <div className="impact-item">
                            <span className="impact-label">🟢 Low Impact:</span>
                            <span className="impact-value">{sentimentBreakdown.lowImpact}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="currency-events">
                  <h3>News & Events Contributing to {selectedCurrency} Sentiment</h3>
                  <div className="events-container">
                    {getFilteredEvents().length > 0 ? (
                      <EventTimeline events={getFilteredEvents()} showCurrency={false} />
                    ) : (
                      <div className="no-events">
                        <p>No events found for {selectedCurrency} in the selected time period.</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* MT5 News Widget - Shows today's real-time news */}
            <MT5NewsWidget />
            
            <section className="recent-events">
              <div className="events-header">
                <h2>
                  {selectedCurrency ? `${selectedCurrency} Events` : 'Recent Events (Latest 50)'}
                  {selectedCurrency && (
                    <span className="filter-info">
                      Showing {getEventsCount().filtered} of {getEventsCount().total} events
                      <button 
                        className="clear-filter-btn"
                        onClick={() => setSelectedCurrency(null)}
                        title="Clear currency filter"
                      >
                        ✕ Clear Filter
                      </button>
                    </span>
                  )}
                </h2>
              </div>
              
              {!selectedCurrency && (
                <div className="events-help">
                  <p>💡 <strong>Tip:</strong> Click on any currency card above to filter events and see detailed analysis for that currency.</p>
                  <p>✅ <strong>Data Quality:</strong> Showing {getDisplayEvents().length} unique events (filtered from {data?.recentEvents?.length || 0} total)</p>
                </div>
              )}
              
              <EventTimeline 
                key={`events-${selectedCurrency || 'all'}-${getDisplayEvents().length}`}
                events={getDisplayEvents()} 
              />
            </section>
          </>
        )}

        {activeView === 'comprehensive' && (
          <ComprehensiveEventView events={data.recentEvents} />
        )}

        {activeView === 'scorecard' && (
          <div className="scorecard-view">
            <h2>🎯 Currency Bias Scorecard</h2>
            <p>Advanced analysis of currency bias across multiple economic pillars.</p>
            <div className="scorecard-grid">
              {data.currencySentiments.map((sentiment) => (
                <div key={sentiment.currency} className="scorecard-card">
                  <h3>{sentiment.currency}</h3>
                  <div className="scorecard-content">
                    <div className="bias-indicator">
                      <span className="bias-label">Bias:</span>
                      <span className={`bias-value bias-${sentiment.currentSentiment.toLowerCase()}`}>
                        {sentiment.currentSentiment}
                      </span>
                    </div>
                    <div className="confidence-indicator">
                      <span className="confidence-label">Confidence:</span>
                      <span className="confidence-value">{sentiment.confidenceScore}%</span>
                    </div>
                    <div className="trend-indicator">
                      <span className="trend-label">Trend:</span>
                      <span className={`trend-value trend-${sentiment.trend.toLowerCase()}`}>
                        {sentiment.trend}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="scorecard-info">
              <h4>About the Scorecard</h4>
              <p>The Currency Bias Scorecard analyzes multiple economic pillars including:</p>
              <ul>
                <li><strong>Policy (25%):</strong> Central bank decisions and monetary policy</li>
                <li><strong>Inflation (15%):</strong> Price stability and inflation trends</li>
                <li><strong>Growth (15%):</strong> Economic growth and GDP indicators</li>
                <li><strong>Labor (5%):</strong> Employment and wage data</li>
                <li><strong>External (10%):</strong> Trade balance and external factors</li>
                <li><strong>Terms of Trade (10%):</strong> Export/import price ratios</li>
                <li><strong>Fiscal (7.5%):</strong> Government spending and taxation</li>
                <li><strong>Politics (5%):</strong> Political stability and policy changes</li>
                <li><strong>Financial Conditions (5%):</strong> Market liquidity and credit</li>
                <li><strong>Valuation (7.5%):</strong> Currency valuation metrics</li>
              </ul>
            </div>
          </div>
        )}

        {activeView === 'algorithm' && (
          <SentimentAnalysisInfo />
        )}

        {activeView === 'manage' && (
          <EventManagement 
            events={data.recentEvents}
            onEventUpdated={handleEventUpdated}
            onEventDeleted={handleEventDeleted}
          />
        )}

        {activeView === 'strategy' && (
          <StrategyMonitor />
        )}

        {activeView === 'backtest' && (
          <BacktestTable />
        )}
      </main>

      {/* Add News Form Modal */}
      {showAddNewsForm && (
        <AddNewsForm 
          onNewsAdded={handleNewsAdded}
          onClose={handleCloseAddNews}
        />
      )}
    </div>
  );
};

export default Dashboard;
