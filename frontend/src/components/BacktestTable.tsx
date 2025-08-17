import React, { useEffect, useState } from 'react';
import './BacktestTable.css';
import TradeChart from './TradeChart';

interface BacktestTrade {
  id: string;
  date: string;
  session: string;
  pair: string;
  signal: 'BUY' | 'SELL' | 'READY' | 'HOLD';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  powerScore: number;
  h1EMATouches: number;
  m15EMATouches: number;
  marketConditions: string[];
  tradeReasons: string[];
  strategyConditions: string[];
  confidence: number;
  status: string;
  result: 'WIN' | 'LOSS' | 'BREAKEVEN';
  profitLoss: number;
  pips: number;
  notes: string;
}

interface BacktestPerformance {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: string;
  totalProfit: string;
  totalPips: string;
  averageProfit: string;
  averagePips: string;
  maxDrawdown: string;
  sharpeRatio: string;
  profitFactor: number;
}

interface BacktestData {
  trades: BacktestTrade[];
  performance: BacktestPerformance;
  summary: {
    totalTrades: number;
    startDate: string;
    endDate: string;
    tradingDays: number;
    currencyPairs: string[];
    currencyGroups: string[];
    dataSource?: string;
    strategy?: string;
    userPairs?: string[];
  };
}

const BacktestTable: React.FC = () => {
  const [backtestData, setBacktestData] = useState<BacktestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tradesPerPage] = useState(20);
  const [sortField, setSortField] = useState<keyof BacktestTrade>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterSignal, setFilterSignal] = useState<string>('ALL');
  const [filterResult, setFilterResult] = useState<string>('ALL');
  const [dataSource, setDataSource] = useState<'mt5' | 'real' | 'simulated'>('mt5');

  useEffect(() => {
    fetchBacktestData();
  }, [dataSource]);

  const fetchBacktestData = async () => {
    try {
      setLoading(true);
      let endpoint = 'http://localhost:8000/api/v1/strategy/backtest';
      
      if (dataSource === 'mt5') {
        endpoint = 'http://localhost:8000/api/v1/strategy/backtest-mt5';
      } else if (dataSource === 'real') {
        endpoint = 'http://localhost:8000/api/v1/strategy/backtest-real';
      }
      
      const response = await fetch(`${endpoint}?startDate=2025-01-01`);
      if (!response.ok) {
        throw new Error('Failed to fetch backtest data');
      }
      
      const data = await response.json();
      setBacktestData(data);
    } catch (error) {
      console.error('Error fetching backtest data:', error);
      setError('Failed to load backtest data');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof BacktestTrade) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortedTrades = () => {
    if (!backtestData?.trades) return [];
    
    let filteredTrades = backtestData.trades;
    
    // Apply filters
    if (filterSignal !== 'ALL') {
      filteredTrades = filteredTrades.filter(trade => trade.signal === filterSignal);
    }
    
    if (filterResult !== 'ALL') {
      filteredTrades = filteredTrades.filter(trade => trade.result === filterResult);
    }
    
    // Apply sorting
    return filteredTrades.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
  };

  const getPaginatedTrades = () => {
    const sortedTrades = getSortedTrades();
    const startIndex = (currentPage - 1) * tradesPerPage;
    return sortedTrades.slice(startIndex, startIndex + tradesPerPage);
  };

  const getTotalPages = () => {
    return Math.ceil(getSortedTrades().length / tradesPerPage);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="backtest-table-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading Backtest Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="backtest-table-container">
        <div className="error-container">
          <p>❌ {error}</p>
          <button onClick={fetchBacktestData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!backtestData) {
    return (
      <div className="backtest-table-container">
        <p>No backtest data available</p>
      </div>
    );
  }

  const paginatedTrades = getPaginatedTrades();
  const totalPages = getTotalPages();

  return (
    <div className="backtest-table-container">
      {/* Header */}
      <div className="backtest-header">
        <h2>📊 Strategy Backtest Results (Jan 1, 2025 - Present)</h2>
        <p>Comprehensive analysis of all trading decisions with detailed reasoning for investor transparency</p>
        
        {/* Data Source Selector */}
        <div className="data-source-selector">
          <h4>Select Data Source:</h4>
          <div className="data-source-buttons">
            <button
              className={`data-source-btn ${dataSource === 'mt5' ? 'active' : ''}`}
              onClick={() => setDataSource('mt5')}
            >
              🎯 MT5 Historical Data
            </button>
            <button
              className={`data-source-btn ${dataSource === 'real' ? 'active' : ''}`}
              onClick={() => setDataSource('real')}
            >
              📊 Real Market Patterns
            </button>
            <button
              className={`data-source-btn ${dataSource === 'simulated' ? 'active' : ''}`}
              onClick={() => setDataSource('simulated')}
            >
              🎲 Simulated Data
            </button>
          </div>
          <div className="data-source-info">
            {dataSource === 'mt5' ? (
              <div className="info-mt5">
                <strong>MT5 Historical Data:</strong> Uses actual MetaTrader 5 historical price data when available. 
                Most accurate backtesting with real market prices and conditions. Falls back to realistic simulation when MT5 data unavailable.
              </div>
            ) : dataSource === 'real' ? (
              <div className="info-real">
                <strong>Real Market Patterns:</strong> Uses actual forex price movements, volatility patterns, and session-specific market conditions. 
                More realistic backtesting based on genuine market behavior.
              </div>
            ) : (
              <div className="info-simulated">
                <strong>Simulated Data:</strong> Strategy validation using generated market scenarios. 
                Useful for testing strategy rules and logic consistency.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="performance-summary">
        <h3>📈 Performance Overview</h3>
        <div className="performance-grid">
          <div className="performance-card">
            <div className="metric-label">Total Trades</div>
            <div className="metric-value">{backtestData?.performance.totalTrades || 0}</div>
          </div>
          <div className="performance-card">
            <div className="metric-label">Win Rate</div>
            <div className="metric-value">{backtestData?.performance.winRate || '0'}%</div>
          </div>
          <div className="performance-card">
            <div className="metric-label">Total Profit</div>
            <div className="metric-value">{backtestData?.performance.totalProfit || '$0'}</div>
          </div>
          <div className="performance-card">
            <div className="metric-label">Total Pips</div>
            <div className="metric-value">{backtestData?.performance.totalPips || '0'}</div>
          </div>
          <div className="performance-card">
            <div className="metric-label">Avg Profit</div>
            <div className="metric-value">{backtestData?.performance.averageProfit || '$0'}</div>
          </div>
          <div className="performance-card">
            <div className="metric-label">Max Drawdown</div>
            <div className="metric-value">{backtestData?.performance.maxDrawdown || '$0'}</div>
          </div>
          <div className="performance-card">
            <div className="metric-label">Sharpe Ratio</div>
            <div className="metric-value">{backtestData?.performance.sharpeRatio || '0'}</div>
          </div>
          <div className="performance-card">
            <div className="metric-label">Profit Factor</div>
            <div className="metric-value">{backtestData?.performance.profitFactor?.toFixed(2) || '0'}</div>
          </div>
        </div>
        
        {/* Data Source Summary */}
        {backtestData?.summary && (
          <div className="data-source-summary">
            <div className="summary-item">
              <strong>Data Source:</strong> {backtestData.summary.dataSource || 'Strategy Rules'}
            </div>
            <div className="summary-item">
              <strong>Strategy:</strong> {backtestData.summary.strategy || 'EMA Multi-Timeframe Analysis'}
            </div>
            <div className="summary-item">
              <strong>Period:</strong> {backtestData.summary.startDate} to {backtestData.summary.endDate}
            </div>
            <div className="summary-item">
              <strong>Trading Days:</strong> {backtestData.summary.tradingDays}
            </div>
            {backtestData.summary.currencyGroups && (
              <div className="summary-item">
                <strong>Currency Groups:</strong> {backtestData.summary.currencyGroups.join(', ')}
              </div>
            )}
            {backtestData.summary.userPairs && (
              <div className="summary-item">
                <strong>Total Pairs:</strong> {backtestData.summary.userPairs.length}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trade Charts Section */}
      {backtestData?.trades && backtestData.trades.length > 0 && (
        <div className="trade-charts-section">
          <h3>📊 Trade Charts - Visual Entry & Exit Points</h3>
          <p>Click on any trade point to see detailed information. Green = BUY, Red = SELL</p>
          <p><strong>Strategy:</strong> Trade when ALL 4 pairs of a currency align above/below H1 EMA</p>
          
          <div className="charts-grid">
            {backtestData.summary?.currencyGroups?.map((currency: string) => {
              const currencyPairs = backtestData.summary?.userPairs?.filter((pair: string) => pair.startsWith(currency)) || [];
              const currencyTrades = backtestData.trades.filter((t: any) => currencyPairs.includes(t.pair));
              
              if (currencyTrades.length === 0) return null;
              
              return (
                <div key={currency} className="chart-wrapper">
                  <h4>{currency} Currency Group</h4>
                  <p>Pairs: {currencyPairs.join(', ')}</p>
                  <TradeChart
                    pair={currency}
                    trades={currencyTrades}
                    timeframe="H1"
                    height={300}
                    showTradeDetails={true}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <h3>🔍 Filters & Controls</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Signal Type:</label>
            <select 
              value={filterSignal} 
              onChange={(e) => setFilterSignal(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Signals</option>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
              <option value="READY">READY</option>
              <option value="HOLD">HOLD</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Result:</label>
            <select 
              value={filterResult} 
              onChange={(e) => setFilterResult(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Results</option>
              <option value="WIN">WIN</option>
              <option value="LOSS">LOSS</option>
              <option value="BREAKEVEN">BREAKEVEN</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Sort By:</label>
            <select 
              value={sortField} 
              onChange={(e) => setSortField(e.target.value as keyof BacktestTrade)}
              className="filter-select"
            >
              <option value="date">Date</option>
              <option value="pair">Pair</option>
              <option value="signal">Signal</option>
              <option value="result">Result</option>
              <option value="profitLoss">Profit/Loss</option>
              <option value="confidence">Confidence</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Direction:</label>
            <button 
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="sort-direction-btn"
            >
              {sortDirection === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
          </div>
        </div>
      </div>

      {/* Trades Table */}
      <div className="trades-table-section">
        <h3>📋 Detailed Trade Analysis</h3>
        <div className="table-container">
          <table className="backtest-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('date')} className="sortable-header">
                  Date/Time
                  {sortField === 'date' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('pair')} className="sortable-header">
                  Pair
                  {sortField === 'pair' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('signal')} className="sortable-header">
                  Signal
                  {sortField === 'signal' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th>Entry Price</th>
                <th>Stop Loss</th>
                <th>Take Profit</th>
                <th>R:R Ratio</th>
                <th onClick={() => handleSort('powerScore')} className="sortable-header">
                  Power Score
                  {sortField === 'powerScore' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th>EMA Status</th>
                <th onClick={() => handleSort('confidence')} className="sortable-header">
                  Confidence
                  {sortField === 'confidence' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('result')} className="sortable-header">
                  Result
                  {sortField === 'result' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('profitLoss')} className="sortable-header">
                  P&L
                  {sortField === 'profitLoss' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th>Pips</th>
                <th>Trade Reasons</th>
                <th>Strategy Conditions</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTrades.map((trade) => (
                <tr key={trade.id} className={`trade-row ${trade.result.toLowerCase()}`}>
                  <td className="date-cell">
                    {new Date(trade.date).toLocaleString()}
                  </td>
                  <td className="pair-cell">
                    <span className="pair-symbol">{trade.pair}</span>
                  </td>
                  <td className="signal-cell">
                    <span className={`signal-badge ${trade.signal.toLowerCase()}`}>
                      {trade.signal}
                    </span>
                  </td>
                  <td className="price-cell">{trade.entryPrice?.toFixed(5) || 'N/A'}</td>
                  <td className="price-cell">{trade.stopLoss?.toFixed(5) || 'N/A'}</td>
                  <td className="price-cell">{trade.takeProfit?.toFixed(5) || 'N/A'}</td>
                  <td className="ratio-cell">{trade.riskReward?.toFixed(2) || 'N/A'}</td>
                  <td className="score-cell">
                    <span className={`power-score ${trade.powerScore >= 20 ? 'extreme' : trade.powerScore >= 15 ? 'strong' : trade.powerScore >= 10 ? 'moderate' : 'weak'}`}>
                      {trade.powerScore}
                    </span>
                  </td>
                  <td className="ema-cell">
                    H1: {trade.h1EMATouches}, M15: {trade.m15EMATouches}
                  </td>
                  <td className="confidence-cell">
                    <span className={`confidence-badge ${trade.confidence >= 80 ? 'high' : trade.confidence >= 60 ? 'medium' : 'low'}`}>
                      {trade.confidence}%
                    </span>
                  </td>
                  <td className="result-cell">
                    <span className={`result-badge ${trade.result.toLowerCase()}`}>
                      {trade.result}
                    </span>
                  </td>
                  <td className="pnl-cell">
                    <span className={`pnl-value ${(trade.profitLoss || 0) >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(trade.profitLoss || 0)}
                    </span>
                  </td>
                  <td className="pips-cell">
                    <span className={`pips-value ${(trade.pips || 0) >= 0 ? 'positive' : 'negative'}`}>
                      {trade.pips || 0}
                    </span>
                  </td>
                  <td className="reasons-cell">
                    <div className="reasons-list">
                      {trade.tradeReasons?.map((reason, index) => (
                        <div key={index} className="reason-item">
                          • {reason}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="conditions-cell">
                    <div className="conditions-list">
                      {trade.strategyConditions?.map((condition, index) => (
                        <div key={index} className="condition-item">
                          ✓ {condition}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="notes-cell">
                    <div className="notes-content">
                      {trade.notes}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-section">
          <div className="pagination-info">
            Showing {((currentPage - 1) * tradesPerPage) + 1} to {Math.min(currentPage * tradesPerPage, getSortedTrades().length)} of {getSortedTrades().length} trades
          </div>
          <div className="pagination-controls">
            <button 
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              First
            </button>
            <button 
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
            <button 
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Last
            </button>
          </div>
        </div>
      )}

      {/* Summary Footer */}
      <div className="summary-footer">
        <h3>📋 Backtest Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <strong>Period:</strong> {backtestData.summary.startDate} to {backtestData.summary.endDate}
          </div>
          <div className="summary-item">
            <strong>Trading Days:</strong> {backtestData.summary.tradingDays}
          </div>
          <div className="summary-item">
            <strong>Currency Pairs:</strong> {backtestData.summary.currencyPairs.join(', ')}
          </div>
          <div className="summary-item">
            <strong>Total Analysis Points:</strong> {backtestData.summary.totalTrades}
          </div>
        </div>
        <div className="strategy-notes">
          <h4>Strategy Implementation Notes:</h4>
          <ul>
            <li><strong>Power Score Requirements:</strong> 10+ (Moderate), 15+ (Strong), 20+ (Extreme)</li>
            <li><strong>EMA Alignment:</strong> H1 3+ touches for BUY, 2+ for READY</li>
            <li><strong>Session Analysis:</strong> 07:30 (Asia) and 13:30 (London)</li>
            <li><strong>Risk Management:</strong> 1-2% risk per trade, 2:1 to 3:1 R:R ratio</li>
            <li><strong>News Restrictions:</strong> 5-minute wait after high-impact events</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BacktestTable;
