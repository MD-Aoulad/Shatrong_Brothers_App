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
import { EconomicEvent, CurrencySentiment } from '../types';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.dashboard);
  const [activeView, setActiveView] = useState<'overview' | 'comprehensive' | 'algorithm' | 'manage'>('overview');
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
    console.log('Currency clicked:', {
      clickedCurrency: currency,
      currentSelectedCurrency: selectedCurrency,
      willSetTo: selectedCurrency === currency ? null : currency
    });
    const newSelection = selectedCurrency === currency ? null : currency;
    console.log('Setting selectedCurrency to:', newSelection);
    setSelectedCurrency(newSelection);
    
    // Force a re-render by updating a dummy state
    setTimeout(() => {
      console.log('After state update - selectedCurrency:', selectedCurrency);
      console.log('Filtered events count:', getFilteredEvents().length);
      console.log('Display events count:', getDisplayEvents().length);
    }, 100);
  };

  // Filter events by selected currency
  const getFilteredEvents = (): EconomicEvent[] => {
    if (!selectedCurrency || !data?.recentEvents) return [];
    const filtered = data.recentEvents.filter(event => event.currency === selectedCurrency);
    console.log(`Filtering events for ${selectedCurrency}:`, {
      totalEvents: data.recentEvents.length,
      filteredEvents: filtered.length,
      selectedCurrency,
      events: filtered
    });
    return filtered;
  };

  // Get all events (either filtered or all)
  const getDisplayEvents = (): EconomicEvent[] => {
    const events = selectedCurrency ? getFilteredEvents() : data?.recentEvents || [];
    console.log('getDisplayEvents called:', {
      selectedCurrency,
      totalEvents: data?.recentEvents?.length || 0,
      displayEvents: events.length,
      events: events
    });
    return events;
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
        <h2>Error loading dashboard</h2>
        <p>{error}</p>
        <button onClick={() => dispatch(fetchDashboardData())}>
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return <div>No data available</div>;
  }

  const selectedSentiment = getSelectedCurrencySentiment();
  const sentimentBreakdown = getSentimentBreakdown();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Forex Fundamental Dashboard</h1>
        <div className="dashboard-stats">
          <span className="stat-item">
            <span className="stat-label">Market Status:</span>
            <span className="stat-value">{data.marketStatus}</span>
          </span>
          <span className="stat-item">
            <span className="stat-label">Active Alerts:</span>
            <span className="stat-value">{data.activeAlerts}</span>
          </span>
          <span className="stat-item">
            <span className="stat-label">Last Updated:</span>
            <span className="stat-value">{new Date().toLocaleTimeString()}</span>
          </span>
        </div>
        
        <div className="view-selector">
          <button 
            className={`view-button ${activeView === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveView('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`view-button ${activeView === 'comprehensive' ? 'active' : ''}`}
            onClick={() => setActiveView('comprehensive')}
          >
            📈 All Data
          </button>
          <button 
            className={`view-button ${activeView === 'algorithm' ? 'active' : ''}`}
            onClick={() => setActiveView('algorithm')}
          >
            🧠 Algorithm
          </button>
          <button 
            className={`view-button ${activeView === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveView('manage')}
          >
            🗂️ Manage
          </button>
          <button 
            className="view-button add-news-button"
            onClick={() => setShowAddNewsForm(true)}
          >
            ➕ Add News
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {activeView === 'overview' && (
          <>
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
              
              {/* Debug Information */}
              <div className="debug-info" style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0', borderRadius: '5px', fontSize: '12px' }}>
                <strong>Debug Info:</strong><br/>
                Selected Currency: <span style={{color: 'red', fontWeight: 'bold'}}>{selectedCurrency || 'None'}</span><br/>
                Total Events: {data?.recentEvents?.length || 0}<br/>
                Filtered Events: {getFilteredEvents().length}<br/>
                Display Events: {getDisplayEvents().length}<br/>
                Sample Event Currencies: {data?.recentEvents?.slice(0, 5).map(e => e.currency).join(', ') || 'None'}<br/>
                <strong>State Debug:</strong> selectedCurrency = "{selectedCurrency}"<br/>
                <strong>Events Being Displayed:</strong> {getDisplayEvents().length} events<br/>
                <strong>First Few Display Events:</strong> {getDisplayEvents().slice(0, 3).map(e => `${e.currency}:${e.title.substring(0, 20)}`).join(' | ')}
              </div>
              
              {!selectedCurrency && (
                <div className="events-help">
                  <p>💡 <strong>Tip:</strong> Click on any currency card above to filter events and see detailed analysis for that currency.</p>
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
