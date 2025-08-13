import React, { useState } from 'react';
import { EconomicEvent } from '../types';
import './EventManagement.css';

interface EventManagementProps {
  events: EconomicEvent[];
  onEventUpdated: (event: EconomicEvent) => void;
  onEventDeleted: (eventId: string) => void;
}

const EventManagement: React.FC<EventManagementProps> = ({ 
  events, 
  onEventUpdated, 
  onEventDeleted 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ALL');
  const [editingEvent, setEditingEvent] = useState<EconomicEvent | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filter events based on search and currency
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCurrency = selectedCurrency === 'ALL' || event.currency === selectedCurrency;
    return matchesSearch && matchesCurrency;
  });

  const handleEdit = (event: EconomicEvent) => {
    setEditingEvent(event);
  };

  const handleDelete = async (eventId: string) => {
    try {
      const response = await fetch(`/api/v1/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      onEventDeleted(eventId);
      setDeleteConfirm(null);
      
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('❌ Failed to delete event. Please try again.');
    }
  };

  const handleUpdate = async (updatedEvent: EconomicEvent) => {
    try {
      const response = await fetch(`/api/v1/events/${updatedEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currency: updatedEvent.currency,
          eventType: updatedEvent.eventType,
          title: updatedEvent.title,
          description: updatedEvent.description,
          eventDate: updatedEvent.date,
          actualValue: updatedEvent.actualValue,
          expectedValue: updatedEvent.expectedValue,
          previousValue: updatedEvent.previousValue,
          impact: updatedEvent.impact,
          sentiment: updatedEvent.sentiment,
          confidenceScore: updatedEvent.confidenceScore,
          priceImpact: updatedEvent.priceImpact,
          source: updatedEvent.source,
          url: updatedEvent.url
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      const result = await response.json();
      onEventUpdated(result.event);
      setEditingEvent(null);

    } catch (error) {
      console.error('Error updating event:', error);
      alert('❌ Failed to update event. Please try again.');
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH': return '#10b981';
      case 'BEARISH': return '#ef4444';
      case 'NEUTRAL': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'HIGH': return '#dc2626';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  return (
    <div className="event-management">
      <div className="management-header">
        <h2>🗂️ Manage Economic Events</h2>
        <p>Edit, delete, and manage all your economic events</p>
      </div>

      {/* Filters */}
      <div className="management-filters">
        <div className="filter-group">
          <label htmlFor="search">🔍 Search Events:</label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or description..."
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="currency-filter">💱 Currency:</label>
          <select
            id="currency-filter"
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="currency-select"
          >
            <option value="ALL">All Currencies</option>
            <option value="USD">🇺🇸 USD</option>
            <option value="EUR">🇪🇺 EUR</option>
            <option value="GBP">🇬🇧 GBP</option>
            <option value="JPY">🇯🇵 JPY</option>
            <option value="CAD">🇨🇦 CAD</option>
          </select>
        </div>

        <div className="results-count">
          📊 {filteredEvents.length} events found
        </div>
      </div>

      {/* Events List */}
      <div className="events-list">
        {filteredEvents.length === 0 ? (
          <div className="no-events">
            <p>No events found matching your criteria.</p>
          </div>
        ) : (
          filteredEvents.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-header">
                <div className="event-title-section">
                  <h3 className="event-title">{event.title}</h3>
                  <div className="event-meta">
                    <span className="currency-badge">{event.currency}</span>
                    <span 
                      className="impact-badge"
                      style={{ backgroundColor: getImpactColor(event.impact) }}
                    >
                      {event.impact}
                    </span>
                    <span 
                      className="sentiment-badge"
                      style={{ backgroundColor: getSentimentColor(event.sentiment) }}
                    >
                      {event.sentiment}
                    </span>
                  </div>
                </div>
                
                <div className="event-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(event)}
                    title="Edit Event"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => setDeleteConfirm(event.id)}
                    title="Delete Event"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              <div className="event-content">
                <p className="event-description">{event.description}</p>
                
                <div className="event-details">
                  <div className="detail-group">
                    <strong>📅 Date:</strong> {formatDate(event.date)}
                  </div>
                  <div className="detail-group">
                    <strong>📊 Values:</strong>
                    {event.actualValue && <span>Actual: {event.actualValue}</span>}
                    {event.expectedValue && <span>Expected: {event.expectedValue}</span>}
                    {event.previousValue && <span>Previous: {event.previousValue}</span>}
                  </div>
                  <div className="detail-group">
                    <strong>🎯 Confidence:</strong> {event.confidenceScore}%
                  </div>
                  <div className="detail-group">
                    <strong>📰 Source:</strong> {event.source}
                  </div>
                </div>
              </div>

              {/* Delete Confirmation */}
              {deleteConfirm === event.id && (
                <div className="delete-confirmation">
                  <div className="confirm-content">
                    <h4>⚠️ Confirm Deletion</h4>
                    <p>Are you sure you want to delete "{event.title}"?</p>
                    <p className="warning-text">This action cannot be undone.</p>
                    <div className="confirm-actions">
                      <button 
                        className="cancel-btn"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="confirm-delete-btn"
                        onClick={() => handleDelete(event.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onSave={handleUpdate}
          onCancel={() => setEditingEvent(null)}
        />
      )}
    </div>
  );
};

// Edit Event Modal Component
interface EditEventModalProps {
  event: EconomicEvent;
  onSave: (event: EconomicEvent) => void;
  onCancel: () => void;
}

const EditEventModal: React.FC<EditEventModalProps> = ({ event, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    actualValue: event.actualValue?.toString() || '',
    expectedValue: event.expectedValue?.toString() || '',
    previousValue: event.previousValue?.toString() || '',
    sentiment: event.sentiment,
    confidenceScore: event.confidenceScore.toString(),
    priceImpact: event.priceImpact?.toString() || '',
    source: event.source,
    url: event.url || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedEvent: EconomicEvent = {
      ...event,
      title: formData.title,
      description: formData.description,
      actualValue: formData.actualValue ? Number(formData.actualValue) : undefined,
      expectedValue: formData.expectedValue ? Number(formData.expectedValue) : undefined,
      previousValue: formData.previousValue ? Number(formData.previousValue) : undefined,
      sentiment: formData.sentiment as any,
      confidenceScore: Number(formData.confidenceScore),
      priceImpact: formData.priceImpact ? Number(formData.priceImpact) : undefined,
      source: formData.source,
      url: formData.url || undefined
    };

    onSave(updatedEvent);
  };

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal">
        <div className="modal-header">
          <h3>✏️ Edit Economic Event</h3>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-title">Event Title *</label>
              <input
                type="text"
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edit-description">Description *</label>
            <textarea
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-actual">Actual Value</label>
              <input
                type="number"
                step="any"
                id="edit-actual"
                name="actualValue"
                value={formData.actualValue}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-expected">Expected Value</label>
              <input
                type="number"
                step="any"
                id="edit-expected"
                name="expectedValue"
                value={formData.expectedValue}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-previous">Previous Value</label>
              <input
                type="number"
                step="any"
                id="edit-previous"
                name="previousValue"
                value={formData.previousValue}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-sentiment">Sentiment *</label>
              <select
                id="edit-sentiment"
                name="sentiment"
                value={formData.sentiment}
                onChange={handleInputChange}
                required
              >
                <option value="BULLISH">📈 BULLISH</option>
                <option value="NEUTRAL">➡️ NEUTRAL</option>
                <option value="BEARISH">📉 BEARISH</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="edit-confidence">Confidence Score (0-100) *</label>
              <input
                type="number"
                min="0"
                max="100"
                id="edit-confidence"
                name="confidenceScore"
                value={formData.confidenceScore}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-impact">Price Impact (%)</label>
              <input
                type="number"
                step="0.1"
                id="edit-impact"
                name="priceImpact"
                value={formData.priceImpact}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-source">Source *</label>
              <input
                type="text"
                id="edit-source"
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              ❌ Cancel
            </button>
            <button type="submit" className="save-btn">
              ✅ Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventManagement;
