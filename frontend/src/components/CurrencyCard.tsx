import React, { useEffect, useState } from 'react';
import { CurrencySentiment } from '../types';
import './CurrencyCard.css';
import { biasApiClient } from '../services/api';

interface CurrencyCardProps {
  sentiment: CurrencySentiment;
  isSelected?: boolean;
  onClick?: () => void;
}

const CurrencyCard: React.FC<CurrencyCardProps> = ({ sentiment, isSelected = false, onClick }) => {
  const [bias, setBias] = useState<{ score?: number; bias?: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    biasApiClient.getScorecard(sentiment.currency)
      .then((res) => {
        if (!mounted) return;
        const data = res.data;
        setBias({ score: data.weightedBiasScore, bias: data.bias });
      })
      .catch(() => {})
    return () => { mounted = false };
  }, [sentiment.currency]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onClick) {
      onClick();
    }
  };

  const getSentimentColor = (sentimentType: string) => {
    switch (sentimentType) {
      case 'BULLISH':
        return '#10b981';
      case 'BEARISH':
        return '#ef4444';
      case 'NEUTRAL':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getSentimentIcon = (sentimentType: string) => {
    switch (sentimentType) {
      case 'BULLISH':
        return '🟢';
      case 'BEARISH':
        return '🔴';
      case 'NEUTRAL':
        return '🟡';
      default:
        return '⚪';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'STRENGTHENING':
        return '↗️';
      case 'WEAKENING':
        return '↘️';
      case 'STABLE':
        return '→';
      default:
        return '→';
    }
  };

  return (
    <div 
      className={`currency-card ${isSelected ? 'selected' : ''}`} 
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
      title={isSelected ? `Click to clear ${sentiment.currency} filter` : `Click to filter events for ${sentiment.currency}`}
    >
      <div className="currency-header">
        <h3 className="currency-title">{sentiment.currency}</h3>
        <div 
          className="sentiment-indicator"
          style={{ backgroundColor: getSentimentColor(sentiment.currentSentiment) }}
        >
          {getSentimentIcon(sentiment.currentSentiment)}
        </div>
        {isSelected && (
          <div className="selection-indicator">
            <span className="selection-icon">✓</span>
            <span className="selection-text">Active Filter</span>
          </div>
        )}
      </div>
      
      <div className="currency-content">
        <div className="sentiment-info">
          <span className="sentiment-text">{sentiment.currentSentiment}</span>
          <span className="confidence-score">({sentiment.confidenceScore}%)</span>
        </div>
        {bias && (
          <div className="bias-info">
            <span className="bias-text">Bias: <strong>{bias.bias}</strong></span>
            <span className="bias-score">Score: {bias.score}</span>
          </div>
        )}
        
        <div className="trend-info">
          <span className="trend-icon">{getTrendIcon(sentiment.trend)}</span>
          <span className="trend-text">{sentiment.trend}</span>
        </div>
      </div>
      
      <div className="currency-footer">
        <span className="last-updated">
          Updated: {new Date(sentiment.lastUpdated).toLocaleTimeString()}
        </span>
        <span className="click-hint">
          {isSelected ? 'Click to clear filter' : 'Click to filter events'}
        </span>
      </div>
    </div>
  );
};

export default CurrencyCard;
