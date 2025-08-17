import React from 'react';
import { EconomicEvent } from '../types';
import './EventTimeline.css';

interface EventTimelineProps {
  events: EconomicEvent[];
  showCurrency?: boolean;
}

const EventTimeline: React.FC<EventTimelineProps> = ({ events, showCurrency = true }) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
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

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
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

  const formatDate = (date: Date) => {
    const now = new Date();
    const eventDate = new Date(date);
    const diffInMs = now.getTime() - eventDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      // Show full date for older events
      return eventDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'HIGH':
        return '🔴';
      case 'MEDIUM':
        return '🟡';
      case 'LOW':
        return '🟢';
      default:
        return '⚪';
    }
  };

  return (
    <div className="event-timeline">
      {events.length === 0 ? (
        <div className="no-events">
          <p>No recent events</p>
        </div>
      ) : (
        <div className="timeline">
          {events.map((event) => (
            <div key={event.id} className="timeline-item">
              <div className="timeline-marker" style={{ backgroundColor: getSentimentColor(event.sentiment) }}>
                {getSentimentIcon(event.sentiment)}
              </div>
              <div className="timeline-content">
                <div className="event-header">
                  <h4 className="event-title">{event.title}</h4>
                  <div className="event-meta">
                    {showCurrency && <span className="event-currency">{event.currency}</span>}
                    <span className="event-impact">{getImpactIcon(event.impact)} {event.impact}</span>
                  </div>
                </div>
                <div className="event-details">
                  <p className="event-description">{event.description}</p>
                  <div className="event-stats">
                    {event.actualValue && (
                      <span className="event-stat">
                        Actual: {event.actualValue}
                        {event.expectedValue && ` (Expected: ${event.expectedValue})`}
                      </span>
                    )}
                    {event.priceImpact && (
                      <span className="event-stat">
                        Price Impact: {event.priceImpact > 0 ? '+' : ''}{event.priceImpact}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="event-footer">
                  <div className="event-time-info">
                    <span className="event-time">{formatDate(event.date)}</span>
                    <span className="event-actual-date">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <span className="event-source">{event.source}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventTimeline;
