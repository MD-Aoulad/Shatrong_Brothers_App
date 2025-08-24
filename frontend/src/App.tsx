import React, { useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';

// Placeholder components for now
const CurrencyCard: React.FC = () => (
  <div className="card">
    <h2>💱 Currency Analysis</h2>
    <p>Currency analysis component coming soon...</p>
  </div>
);

const EventManagement: React.FC = () => (
  <div className="card">
    <h2>📅 Economic Events</h2>
    <p>Event management component coming soon...</p>
  </div>
);

const StrategyMonitor: React.FC = () => (
  <div className="card">
    <h2>🎯 Trading Strategy</h2>
    <p>Strategy monitor component coming soon...</p>
  </div>
);

const EnhancedSentimentAnalysis: React.FC = () => (
  <div className="card">
    <h2>🧠 Sentiment Analysis</h2>
    <p>Enhanced sentiment analysis component coming soon...</p>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'currencies':
        return <CurrencyCard />;
      case 'events':
        return <EventManagement />;
      case 'strategy':
        return <StrategyMonitor />;
      case 'sentiment':
        return <EnhancedSentimentAnalysis />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      {/* Professional Forex Header */}
      <header className="header">
        <h1>🚀 FOREX FUNDAMENTAL DASHBOARD</h1>
        <nav className="nav">
          <a 
            href="#dashboard" 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </a>
          <a 
            href="#currencies" 
            className={activeTab === 'currencies' ? 'active' : ''}
            onClick={() => setActiveTab('currencies')}
          >
            💱 Currency Analysis
          </a>
          <a 
            href="#events" 
            className={activeTab === 'events' ? 'active' : ''}
            onClick={() => setActiveTab('events')}
          >
            📅 Economic Events
          </a>
          <a 
            href="#strategy" 
            className={activeTab === 'strategy' ? 'active' : ''}
            onClick={() => setActiveTab('strategy')}
          >
            🎯 Trading Strategy
          </a>
          <a 
            href="#sentiment" 
            className={activeTab === 'sentiment' ? 'active' : ''}
            onClick={() => setActiveTab('sentiment')}
          >
            🧠 Sentiment Analysis
          </a>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {renderContent()}
      </main>

      {/* Professional Footer */}
      <footer style={{
        background: 'var(--forex-dark-gray)',
        borderTop: '1px solid var(--forex-border)',
        padding: '1rem 2rem',
        textAlign: 'center',
        color: 'var(--forex-text-secondary)',
        fontSize: '0.9rem'
      }}>
        <p>© 2025 Forex Fundamental Dashboard | Professional Trading Platform</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
          Real-time market data • Economic analysis • Trading insights
        </p>
      </footer>
    </div>
  );
}

export default App;
