import React, { useState } from 'react';
import { Currency, Sentiment, EconomicEvent } from '../types';
import './AddNewsForm.css';

interface AddNewsFormProps {
  onNewsAdded: (event: EconomicEvent) => void;
  onClose: () => void;
}

interface FormData {
  currency: Currency;
  eventType: string;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  actualValue: string;
  expectedValue: string;
  previousValue: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  sentiment: Sentiment;
  confidenceScore: string;
  priceImpact: string;
  source: string;
  url: string;
  // Enhanced fields for complex economic analysis
  votingPattern: string;
  speechTone: 'HAWKISH' | 'DOVISH' | 'NEUTRAL' | '';
  policyChange: string;
  forwardGuidance: string;
}

const AddNewsForm: React.FC<AddNewsFormProps> = ({ onNewsAdded, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    currency: 'USD',
    eventType: 'EMPLOYMENT',
    title: '',
    description: '',
    eventDate: new Date().toISOString().split('T')[0], // Today's date
    eventTime: new Date().toISOString().split('T')[1].substring(0, 5), // Current time
    actualValue: '',
    expectedValue: '',
    previousValue: '',
    impact: 'HIGH',
    sentiment: 'NEUTRAL',
    confidenceScore: '75',
    priceImpact: '0',
    source: 'Manual Entry',
    url: '',
    // Enhanced fields
    votingPattern: '',
    speechTone: '',
    policyChange: '',
    forwardGuidance: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Event type options with descriptions
  const eventTypes = [
    { value: 'EMPLOYMENT', label: 'Employment Data', description: 'NFP, Unemployment Rate, Job Changes' },
    { value: 'INTEREST_RATE', label: 'Interest Rate Decision', description: 'Fed, ECB, BOJ, BOE Rate Decisions' },
    { value: 'CPI', label: 'Inflation Data', description: 'Consumer Price Index, Core CPI' },
    { value: 'GDP', label: 'GDP Data', description: 'Economic Growth, GDP Growth Rate' },
    { value: 'PMI', label: 'PMI Data', description: 'Manufacturing, Services PMI' },
    { value: 'RETAIL_SALES', label: 'Retail Sales', description: 'Consumer Spending Data' },
    { value: 'POLITICAL', label: 'Political Event', description: 'Elections, Policy Changes' },
    { value: 'NEWS', label: 'Economic News', description: 'Breaking News, Announcements' },
    { value: 'CENTRAL_BANK', label: 'Central Bank Speech', description: 'Fed Chair, ECB President Speeches' },
    { value: 'TRADE', label: 'Trade Data', description: 'Trade Balance, Exports/Imports' }
  ];

  // Quick fill templates for common events
  const quickFillTemplates = {
    NFP: {
      title: 'Non-Farm Payrolls (NFP)',
      description: 'Monthly change in employment excluding farming sector',
      eventType: 'EMPLOYMENT',
      impact: 'HIGH' as const,
      confidenceScore: '90',
      currency: 'USD' as Currency
    },
    FED_RATE: {
      title: 'Federal Funds Rate Decision',
      description: 'Federal Reserve interest rate policy decision',
      eventType: 'INTEREST_RATE',
      impact: 'HIGH' as const,
      confidenceScore: '95',
      currency: 'USD' as Currency
    },
    ECB_RATE: {
      title: 'ECB Interest Rate Decision',
      description: 'European Central Bank monetary policy decision',
      eventType: 'INTEREST_RATE',
      impact: 'HIGH' as const,
      confidenceScore: '95',
      currency: 'EUR' as Currency
    },
    CPI_US: {
      title: 'US Consumer Price Index (CPI)',
      description: 'US inflation data - core CPI excluding food and energy',
      eventType: 'CPI',
      impact: 'HIGH' as const,
      confidenceScore: '88',
      currency: 'USD' as Currency
    },
    BOC_RATE: {
      title: 'BOC Interest Rate Decision',
      description: 'Bank of Canada monetary policy decision',
      eventType: 'INTEREST_RATE',
      impact: 'HIGH' as const,
      confidenceScore: '90',
      currency: 'CAD' as Currency
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleQuickFill = (template: keyof typeof quickFillTemplates) => {
    const templateData = quickFillTemplates[template];
    setFormData(prev => ({
      ...prev,
      ...templateData
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required';
    }

    if (!formData.eventDate) {
      newErrors.eventDate = 'Event date is required';
    }

    if (formData.actualValue && isNaN(Number(formData.actualValue))) {
      newErrors.actualValue = 'Actual value must be a valid number';
    }

    if (formData.expectedValue && isNaN(Number(formData.expectedValue))) {
      newErrors.expectedValue = 'Expected value must be a valid number';
    }

    if (formData.previousValue && isNaN(Number(formData.previousValue))) {
      newErrors.previousValue = 'Previous value must be a valid number';
    }

    if (isNaN(Number(formData.confidenceScore)) || Number(formData.confidenceScore) < 0 || Number(formData.confidenceScore) > 100) {
      newErrors.confidenceScore = 'Confidence score must be between 0 and 100';
    }

    if (formData.priceImpact && isNaN(Number(formData.priceImpact))) {
      newErrors.priceImpact = 'Price impact must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateSentiment = (): Sentiment => {
    const actual = Number(formData.actualValue);
    const expected = Number(formData.expectedValue);
    const previous = Number(formData.previousValue);

    let sentimentScore = 0; // -100 to +100 scale

    // 1. ENHANCED INTEREST RATE ANALYSIS (fixes the "red news" problem)
    if (formData.eventType === 'INTEREST_RATE') {
      // Rate trajectory analysis (actual vs previous)
      if (actual !== undefined && previous !== undefined) {
        const rateChange = actual - previous;
        if (rateChange > 0) {
          sentimentScore += 25; // Rate hike = bullish
        } else if (rateChange < 0) {
          sentimentScore -= 30; // Rate cut = bearish (stronger signal)
        }
      }

      // Market expectation analysis
      if (expected !== undefined && actual !== undefined) {
        const expectationDiff = actual - expected;
        if (expectationDiff > 0) {
          sentimentScore += 15; // More hawkish than expected
        } else if (expectationDiff < 0) {
          sentimentScore -= 15; // More dovish than expected
        }
      }

      // VOTING PATTERN ANALYSIS (Critical!)
      if (formData.votingPattern) {
        const votes = formData.votingPattern.split('-').map(Number);
        if (votes.length === 3) {
          const [hikeVotes, cutVotes, holdVotes] = votes;
          const totalVotes = hikeVotes + cutVotes + holdVotes;
          
          if (cutVotes > holdVotes && cutVotes > hikeVotes) {
            sentimentScore -= 35; // Dovish majority = strong bearish signal
          } else if (hikeVotes > holdVotes && hikeVotes > cutVotes) {
            sentimentScore += 30; // Hawkish majority = strong bullish signal
          }
        }
      }

      // SPEECH TONE ANALYSIS
      if (formData.speechTone === 'DOVISH') {
        sentimentScore -= 20;
      } else if (formData.speechTone === 'HAWKISH') {
        sentimentScore += 20;
      }

      // POLICY CHANGE ANALYSIS
      if (formData.policyChange.toLowerCase().includes('cut')) {
        sentimentScore -= 25;
      } else if (formData.policyChange.toLowerCase().includes('hike') || 
                 formData.policyChange.toLowerCase().includes('raise')) {
        sentimentScore += 25;
      }
    }

    // 2. EMPLOYMENT ANALYSIS (NFP, Claims, etc.)
    else if (['EMPLOYMENT'].includes(formData.eventType) || formData.title.toLowerCase().includes('claims')) {
      if (actual && expected) {
        const difference = ((actual - expected) / expected) * 100;
        
        // Unemployment Claims: Higher = Bearish
        if (formData.title.toLowerCase().includes('claims')) {
          if (difference > 2) sentimentScore -= 15; // Higher claims = bearish
          else if (difference < -2) sentimentScore += 10; // Lower claims = bullish
        }
        // NFP and Job Creation: Higher = Bullish
        else {
          if (difference > 5) sentimentScore += 20;
          else if (difference < -5) sentimentScore -= 20;
        }
      }
    }

    // 3. STANDARD ANALYSIS for other events
    else {
      if (actual && (expected || previous)) {
        const comparison = expected || previous;
        const difference = ((actual - comparison!) / comparison!) * 100;

        if (['GDP', 'RETAIL_SALES', 'PMI'].includes(formData.eventType)) {
          if (difference > 5) sentimentScore += 15;
          else if (difference < -5) sentimentScore -= 15;
        } else if (formData.eventType === 'CPI') {
          if (difference > 10) sentimentScore -= 10; // High inflation = bearish
          else if (difference < -5) sentimentScore += 10; // Low inflation = bullish
        }
      }
    }

    // Convert score to sentiment
    if (sentimentScore >= 20) return 'BULLISH';
    if (sentimentScore <= -20) return 'BEARISH';
    return 'NEUTRAL';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Auto-calculate sentiment if not manually set
      const calculatedSentiment = formData.sentiment === 'NEUTRAL' ? calculateSentiment() : formData.sentiment;

      // Combine date and time
      const eventDateTime = new Date(`${formData.eventDate}T${formData.eventTime}`);

      const eventData = {
        currency: formData.currency,
        eventType: formData.eventType,
        title: formData.title,
        description: formData.description,
        eventDate: eventDateTime.toISOString(),
        actualValue: formData.actualValue ? Number(formData.actualValue) : null,
        expectedValue: formData.expectedValue ? Number(formData.expectedValue) : null,
        previousValue: formData.previousValue ? Number(formData.previousValue) : null,
        impact: formData.impact,
        sentiment: calculatedSentiment,
        confidenceScore: Number(formData.confidenceScore),
        priceImpact: formData.priceImpact ? Number(formData.priceImpact) : null,
        source: formData.source,
        url: formData.url || null
      };

      // Send to API
      const response = await fetch('/api/v1/events/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        throw new Error('Failed to save economic event');
      }

      const savedEvent = await response.json();
      
      // Notify parent component
      onNewsAdded(savedEvent);
      
      // Show success message
      alert('✅ Economic event added successfully!');
      
      // Close form
      onClose();

    } catch (error) {
      console.error('Error saving economic event:', error);
      alert('❌ Failed to save economic event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-news-overlay">
      <div className="add-news-form">
        <div className="form-header">
          <h2>📝 Add New Economic Event</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>

        {/* Quick Fill Templates */}
        <div className="quick-fill-section">
          <h3>⚡ Quick Fill Templates</h3>
          <div className="quick-fill-buttons">
            <button type="button" onClick={() => handleQuickFill('NFP')}>
              📊 NFP (Non-Farm Payrolls)
            </button>
            <button type="button" onClick={() => handleQuickFill('FED_RATE')}>
              🏛️ Fed Rate Decision
            </button>
            <button type="button" onClick={() => handleQuickFill('ECB_RATE')}>
              🇪🇺 ECB Rate Decision
            </button>
            <button type="button" onClick={() => handleQuickFill('CPI_US')}>
              📈 US CPI Data
            </button>
            <button type="button" onClick={() => handleQuickFill('BOC_RATE')}>
              🇨🇦 BOC Rate Decision
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="news-form">
          {/* Basic Information */}
          <div className="form-section">
            <h3>📋 Basic Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="currency">Currency *</label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  required
                >
                  <option value="USD">🇺🇸 USD (US Dollar)</option>
                  <option value="EUR">🇪🇺 EUR (Euro)</option>
                  <option value="GBP">🇬🇧 GBP (British Pound)</option>
                  <option value="JPY">🇯🇵 JPY (Japanese Yen)</option>
                  <option value="CAD">🇨🇦 CAD (Canadian Dollar)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="eventType">Event Type *</label>
                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  required
                >
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value} title={type.description}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="title">Event Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Non-Farm Payrolls (NFP)"
                required
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Detailed description of the economic event"
                rows={3}
                required
                className={errors.description ? 'error' : ''}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>
          </div>

          {/* Event Timing */}
          <div className="form-section">
            <h3>⏰ Event Timing</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="eventDate">Event Date *</label>
                <input
                  type="date"
                  id="eventDate"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  required
                  className={errors.eventDate ? 'error' : ''}
                />
                {errors.eventDate && <span className="error-message">{errors.eventDate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="eventTime">Event Time</label>
                <input
                  type="time"
                  id="eventTime"
                  name="eventTime"
                  value={formData.eventTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Economic Data Values */}
          <div className="form-section">
            <h3>📊 Economic Data Values</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="actualValue">Actual Value</label>
                <input
                  type="number"
                  step="any"
                  id="actualValue"
                  name="actualValue"
                  value={formData.actualValue}
                  onChange={handleInputChange}
                  placeholder="e.g., 185000"
                  className={errors.actualValue ? 'error' : ''}
                />
                {errors.actualValue && <span className="error-message">{errors.actualValue}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="expectedValue">Expected Value</label>
                <input
                  type="number"
                  step="any"
                  id="expectedValue"
                  name="expectedValue"
                  value={formData.expectedValue}
                  onChange={handleInputChange}
                  placeholder="e.g., 200000"
                  className={errors.expectedValue ? 'error' : ''}
                />
                {errors.expectedValue && <span className="error-message">{errors.expectedValue}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="previousValue">Previous Value</label>
                <input
                  type="number"
                  step="any"
                  id="previousValue"
                  name="previousValue"
                  value={formData.previousValue}
                  onChange={handleInputChange}
                  placeholder="e.g., 220000"
                  className={errors.previousValue ? 'error' : ''}
                />
                {errors.previousValue && <span className="error-message">{errors.previousValue}</span>}
              </div>
            </div>
          </div>

          {/* Analysis & Impact */}
          <div className="form-section">
            <h3>🎯 Analysis & Impact</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="impact">Market Impact *</label>
                <select
                  id="impact"
                  name="impact"
                  value={formData.impact}
                  onChange={handleInputChange}
                  required
                >
                  <option value="HIGH">🔴 HIGH - Major market mover</option>
                  <option value="MEDIUM">🟡 MEDIUM - Moderate impact</option>
                  <option value="LOW">🟢 LOW - Minor impact</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="sentiment">Sentiment *</label>
                <select
                  id="sentiment"
                  name="sentiment"
                  value={formData.sentiment}
                  onChange={handleInputChange}
                  required
                >
                  <option value="BULLISH">📈 BULLISH - Positive for currency</option>
                  <option value="NEUTRAL">➡️ NEUTRAL - No clear direction</option>
                  <option value="BEARISH">📉 BEARISH - Negative for currency</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="confidenceScore">Confidence Score (0-100) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  id="confidenceScore"
                  name="confidenceScore"
                  value={formData.confidenceScore}
                  onChange={handleInputChange}
                  placeholder="75"
                  required
                  className={errors.confidenceScore ? 'error' : ''}
                />
                {errors.confidenceScore && <span className="error-message">{errors.confidenceScore}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="priceImpact">Expected Price Impact (%)</label>
                <input
                  type="number"
                  step="0.1"
                  id="priceImpact"
                  name="priceImpact"
                  value={formData.priceImpact}
                  onChange={handleInputChange}
                  placeholder="0.5"
                  className={errors.priceImpact ? 'error' : ''}
                />
                {errors.priceImpact && <span className="error-message">{errors.priceImpact}</span>}
              </div>
            </div>
          </div>

          {/* Enhanced Policy Analysis */}
          <div className="form-section">
            <h3>🏛️ Central Bank & Policy Analysis</h3>
            <p className="section-description">Critical for capturing "red news" like voting patterns and policy shifts</p>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="votingPattern">Voting Pattern (e.g., 0-5-4)</label>
                <input
                  type="text"
                  id="votingPattern"
                  name="votingPattern"
                  value={formData.votingPattern}
                  onChange={handleInputChange}
                  placeholder="e.g., 0-5-4 (hike-cut-hold votes)"
                />
                <small>Format: hike votes - cut votes - hold votes (e.g., BOE: 0-5-4)</small>
              </div>

              <div className="form-group">
                <label htmlFor="speechTone">Speech/Communication Tone</label>
                <select
                  id="speechTone"
                  name="speechTone"
                  value={formData.speechTone}
                  onChange={handleInputChange}
                >
                  <option value="">Select tone...</option>
                  <option value="HAWKISH">🦅 HAWKISH - Inflation concerns, rate hikes</option>
                  <option value="DOVISH">🕊️ DOVISH - Growth concerns, rate cuts</option>
                  <option value="NEUTRAL">⚖️ NEUTRAL - Balanced, data-dependent</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="policyChange">Policy Change Description</label>
                <input
                  type="text"
                  id="policyChange"
                  name="policyChange"
                  value={formData.policyChange}
                  onChange={handleInputChange}
                  placeholder="e.g., Rate cut from 4.25% to 4.00%, QE expansion"
                />
              </div>

              <div className="form-group">
                <label htmlFor="forwardGuidance">Forward Guidance</label>
                <input
                  type="text"
                  id="forwardGuidance"
                  name="forwardGuidance"
                  value={formData.forwardGuidance}
                  onChange={handleInputChange}
                  placeholder="e.g., More cuts likely, Data-dependent approach"
                />
              </div>
            </div>
          </div>

          {/* Source Information */}
          <div className="form-section">
            <h3>📚 Source Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="source">Data Source *</label>
                <input
                  type="text"
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  placeholder="e.g., Bureau of Labor Statistics, Reuters, Bloomberg"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="url">Source URL (Optional)</label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              ❌ Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="submit-btn">
              {isSubmitting ? '⏳ Saving...' : '✅ Save Economic Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewsForm;
