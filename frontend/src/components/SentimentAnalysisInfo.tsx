import React, { useState } from 'react';
import './SentimentAnalysisInfo.css';

const SentimentAnalysisInfo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'algorithm' | 'factors' | 'examples'>('algorithm');

  return (
    <div className="sentiment-analysis-info">
      <div className="info-header">
        <h2>🧠 Sentiment Analysis Algorithm</h2>
        <p>Understanding how we determine if EUR, USD, JPY, or GBP is Bullish, Bearish, or Neutral</p>
      </div>

      <div className="info-tabs">
        <button 
          className={`tab-button ${activeTab === 'algorithm' ? 'active' : ''}`}
          onClick={() => setActiveTab('algorithm')}
        >
          Algorithm
        </button>
        <button 
          className={`tab-button ${activeTab === 'factors' ? 'active' : ''}`}
          onClick={() => setActiveTab('factors')}
        >
          Key Factors
        </button>
        <button 
          className={`tab-button ${activeTab === 'examples' ? 'active' : ''}`}
          onClick={() => setActiveTab('examples')}
        >
          Examples
        </button>
      </div>

      <div className="info-content">
        {activeTab === 'algorithm' && (
          <div className="algorithm-section">
            <h3>Multi-Factor Sentiment Analysis</h3>
            <p>Our algorithm analyzes multiple economic indicators to determine currency sentiment:</p>
            
            <div className="algorithm-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Data Collection</h4>
                  <p>We collect real-time economic data from multiple sources:</p>
                  <ul>
                    <li>Central Bank announcements (Fed, ECB, BOJ, BOE)</li>
                    <li>Economic indicators (CPI, GDP, Employment, Retail Sales)</li>
                    <li>Market expectations vs actual results</li>
                    <li>Historical price impact analysis</li>
                  </ul>
                </div>
              </div>

              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Impact Assessment</h4>
                  <p>Each event is weighted based on its importance:</p>
                  <div className="impact-weights">
                    <div className="weight-item high">
                      <span className="weight-label">HIGH Impact</span>
                      <span className="weight-value">Weight: 3x</span>
                      <span className="weight-desc">Interest Rate Decisions, Major GDP releases</span>
                    </div>
                    <div className="weight-item medium">
                      <span className="weight-label">MEDIUM Impact</span>
                      <span className="weight-value">Weight: 2x</span>
                      <span className="weight-desc">Employment Data, CPI releases</span>
                    </div>
                    <div className="weight-item low">
                      <span className="weight-label">LOW Impact</span>
                      <span className="weight-value">Weight: 1x</span>
                      <span className="weight-desc">Retail Sales, Minor indicators</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Sentiment Calculation</h4>
                  <p>We use a weighted scoring system:</p>
                  <div className="formula">
                    <div className="formula-text">
                      Sentiment Score = Σ(Event Impact × Weight × Time Decay)
                    </div>
                    <div className="formula-explanation">
                      <p><strong>Event Impact:</strong> How much the actual result differed from expectations</p>
                      <p><strong>Weight:</strong> Based on event importance (High/Medium/Low)</p>
                      <p><strong>Time Decay:</strong> Recent events have more influence</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Classification</h4>
                  <p>Final sentiment is determined by score thresholds:</p>
                  <div className="sentiment-thresholds">
                    <div className="threshold bullish">
                      <span className="threshold-icon">📈</span>
                      <span className="threshold-label">BULLISH</span>
                      <span className="threshold-range">Score ≥ +20</span>
                      <span className="threshold-desc">Positive economic outlook</span>
                    </div>
                    <div className="threshold neutral">
                      <span className="threshold-icon">➡️</span>
                      <span className="threshold-label">NEUTRAL</span>
                      <span className="threshold-range">-20 &lt; Score &lt; +20</span>
                      <span className="threshold-desc">Mixed or unclear signals</span>
                    </div>
                    <div className="threshold bearish">
                      <span className="threshold-icon">📉</span>
                      <span className="threshold-label">BEARISH</span>
                      <span className="threshold-range">Score ≤ -20</span>
                      <span className="threshold-desc">Negative economic outlook</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'factors' && (
          <div className="factors-section">
            <h3>Key Economic Factors</h3>
            <p>Here are the main factors we analyze for each currency:</p>

            <div className="currency-factors">
              <div className="currency-factor-card">
                <h4>🇪🇺 EUR (Euro)</h4>
                <ul>
                  <li><strong>ECB Interest Rates:</strong> European Central Bank policy decisions</li>
                  <li><strong>Eurozone CPI:</strong> Inflation data across EU member states</li>
                  <li><strong>GDP Growth:</strong> Economic growth of the Eurozone</li>
                  <li><strong>Employment:</strong> Unemployment rates and job creation</li>
                  <li><strong>Political Stability:</strong> EU policy decisions and member state politics</li>
                </ul>
              </div>

              <div className="currency-factor-card">
                <h4>🇺🇸 USD (US Dollar)</h4>
                <ul>
                  <li><strong>Fed Funds Rate:</strong> Federal Reserve interest rate decisions</li>
                  <li><strong>Non-Farm Payrolls:</strong> Monthly employment report</li>
                  <li><strong>US CPI & PCE:</strong> Inflation indicators</li>
                  <li><strong>GDP Growth:</strong> Quarterly economic growth</li>
                  <li><strong>Trade Balance:</strong> Import/export data</li>
                </ul>
              </div>

              <div className="currency-factor-card">
                <h4>🇯🇵 JPY (Japanese Yen)</h4>
                <ul>
                  <li><strong>BOJ Policy:</strong> Bank of Japan interest rate and QE policies</li>
                  <li><strong>Japan CPI:</strong> Inflation and deflation trends</li>
                  <li><strong>GDP Growth:</strong> Economic performance</li>
                  <li><strong>Trade Surplus:</strong> Export-driven economy indicators</li>
                  <li><strong>Safe Haven Flows:</strong> Risk-off market sentiment</li>
                </ul>
              </div>

              <div className="currency-factor-card">
                <h4>🇬🇧 GBP (British Pound)</h4>
                <ul>
                  <li><strong>BOE Interest Rates:</strong> Bank of England monetary policy</li>
                  <li><strong>UK CPI:</strong> Inflation data</li>
                  <li><strong>Employment:</strong> UK job market health</li>
                  <li><strong>GDP Growth:</strong> Economic performance post-Brexit</li>
                  <li><strong>Political Events:</strong> Government policy and Brexit impacts</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="examples-section">
            <h3>Real Examples from Our Data</h3>
            <p>Here's how our algorithm determined recent sentiment classifications:</p>

            <div className="example-cases">
              <div className="example-case bullish">
                <div className="example-header">
                  <h4>📈 BULLISH Example - EUR (March 2025)</h4>
                  <span className="confidence-badge">Confidence: 85%</span>
                </div>
                <div className="example-content">
                  <div className="example-events">
                    <div className="example-event">
                      <span className="event-name">Eurozone GDP Growth</span>
                      <span className="event-data">Actual: 0.5% vs Expected: 0.3%</span>
                      <span className="event-impact">+15 points (HIGH impact)</span>
                    </div>
                    <div className="example-event">
                      <span className="event-name">ECB Rate Decision</span>
                      <span className="event-data">Cut to 4.0% (dovish but controlled)</span>
                      <span className="event-impact">+8 points (HIGH impact)</span>
                    </div>
                    <div className="example-event">
                      <span className="event-name">Eurozone CPI</span>
                      <span className="event-data">0.3% vs 0.2% expected</span>
                      <span className="event-impact">+5 points (HIGH impact)</span>
                    </div>
                  </div>
                  <div className="example-calculation">
                    <strong>Total Score: +28 points → BULLISH</strong>
                    <p>Strong economic growth exceeded expectations, controlled monetary policy, and stable inflation created positive sentiment.</p>
                  </div>
                </div>
              </div>

              <div className="example-case bearish">
                <div className="example-header">
                  <h4>📉 BEARISH Example - USD (Early 2024)</h4>
                  <span className="confidence-badge">Confidence: 72%</span>
                </div>
                <div className="example-content">
                  <div className="example-events">
                    <div className="example-event">
                      <span className="event-name">US GDP Growth</span>
                      <span className="event-data">Actual: 2.1% vs Expected: 2.5%</span>
                      <span className="event-impact">-12 points (HIGH impact)</span>
                    </div>
                    <div className="example-event">
                      <span className="event-name">Non-Farm Payrolls</span>
                      <span className="event-data">150K vs 180K expected</span>
                      <span className="event-impact">-8 points (HIGH impact)</span>
                    </div>
                    <div className="example-event">
                      <span className="event-name">US CPI</span>
                      <span className="event-data">0.4% vs 0.3% expected (high inflation)</span>
                      <span className="event-impact">-6 points (HIGH impact)</span>
                    </div>
                  </div>
                  <div className="example-calculation">
                    <strong>Total Score: -26 points → BEARISH</strong>
                    <p>Below-expectation growth, weak job creation, and high inflation created negative sentiment for USD.</p>
                  </div>
                </div>
              </div>

              <div className="example-case neutral">
                <div className="example-header">
                  <h4>➡️ NEUTRAL Example - JPY (Current)</h4>
                  <span className="confidence-badge">Confidence: 45%</span>
                </div>
                <div className="example-content">
                  <div className="example-events">
                    <div className="example-event">
                      <span className="event-name">BOJ Rate Decision</span>
                      <span className="event-data">Maintained at -0.1% (as expected)</span>
                      <span className="event-impact">0 points (HIGH impact)</span>
                    </div>
                    <div className="example-event">
                      <span className="event-name">Japan CPI</span>
                      <span className="event-data">0.8% vs 0.9% expected</span>
                      <span className="event-impact">-2 points (MEDIUM impact)</span>
                    </div>
                    <div className="example-event">
                      <span className="event-name">Japan Employment</span>
                      <span className="event-data">2.5% vs 2.6% expected (slight improvement)</span>
                      <span className="event-impact">+1 point (MEDIUM impact)</span>
                    </div>
                  </div>
                  <div className="example-calculation">
                    <strong>Total Score: -1 point → NEUTRAL</strong>
                    <p>Mixed signals with no major surprises led to neutral sentiment. Policy unchanged, modest economic data.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SentimentAnalysisInfo;
