import { Router } from 'express';
import { query } from '../config/database';

const router = Router();

// GET /api/v1/events - Get all economic events (existing endpoint)
router.get('/', async (req, res) => {
  try {
    const { currency, limit = 50, offset = 0 } = req.query;
    
    let sqlQuery = `
      SELECT id, currency, event_type, title, description, event_date, 
             actual_value, expected_value, previous_value, impact, sentiment, 
             confidence_score, price_impact, source, url, created_at
      FROM economic_events
    `;
    
    const params: any[] = [];
    const conditions: string[] = [];
    
    if (currency) {
      conditions.push(`currency = $${params.length + 1}`);
      params.push(currency);
    }
    
    if (conditions.length > 0) {
      sqlQuery += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    sqlQuery += ` ORDER BY event_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await query(sqlQuery, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch economic events' });
  }
});

// POST /api/v1/events/add - Add new economic event
router.post('/add', async (req, res): Promise<void> => {
  try {
    const {
      currency,
      eventType,
      title,
      description,
      eventDate,
      actualValue,
      expectedValue,
      previousValue,
      impact,
      sentiment,
      confidenceScore,
      priceImpact,
      source,
      url
    } = req.body;

    // Validation
    if (!currency || !eventType || !title || !description || !eventDate) {
      res.status(400).json({ 
        error: 'Missing required fields: currency, eventType, title, description, eventDate' 
      });
      return;
    }

    // Validate currency
    if (!['EUR', 'USD', 'JPY', 'GBP', 'CAD'].includes(currency)) {
      res.status(400).json({ 
        error: 'Invalid currency. Must be one of: EUR, USD, JPY, GBP, CAD' 
      });
      return;
    }

    // Validate impact
    if (!['HIGH', 'MEDIUM', 'LOW'].includes(impact)) {
      res.status(400).json({ 
        error: 'Invalid impact. Must be one of: HIGH, MEDIUM, LOW' 
      });
      return;
    }

    // Validate sentiment
    if (!['BULLISH', 'BEARISH', 'NEUTRAL'].includes(sentiment)) {
      res.status(400).json({ 
        error: 'Invalid sentiment. Must be one of: BULLISH, BEARISH, NEUTRAL' 
      });
      return;
    }

    // Validate confidence score
    if (confidenceScore !== null && (confidenceScore < 0 || confidenceScore > 100)) {
      res.status(400).json({ 
        error: 'Confidence score must be between 0 and 100' 
      });
      return;
    }

    // Insert into database
    const insertQuery = `
      INSERT INTO economic_events 
      (currency, event_type, title, description, event_date, actual_value, expected_value, 
       previous_value, impact, sentiment, confidence_score, price_impact, source, url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const values = [
      currency,
      eventType,
      title,
      description,
      new Date(eventDate),
      actualValue || null,
      expectedValue || null,
      previousValue || null,
      impact,
      sentiment,
      confidenceScore || null,
      priceImpact || null,
      source || 'Manual Entry',
      url || null
    ];

    const result = await query(insertQuery, values);
    const savedEvent = result.rows[0];

    // Log the addition
    console.log(`📝 New economic event added: ${title} (${currency}) by manual entry`);

    // Return the saved event
    res.status(201).json({
      success: true,
      message: 'Economic event added successfully',
      event: savedEvent
    });

  } catch (error) {
    console.error('Error adding economic event:', error);
    res.status(500).json({ 
      error: 'Failed to save economic event',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/v1/events/:id - Update existing economic event
router.put('/:id', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      currency,
      eventType,
      title,
      description,
      eventDate,
      actualValue,
      expectedValue,
      previousValue,
      impact,
      sentiment,
      confidenceScore,
      priceImpact,
      source,
      url
    } = req.body;

    // Check if event exists
    const checkQuery = 'SELECT id FROM economic_events WHERE id = $1';
    const checkResult = await query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: 'Economic event not found' });
      return;
    }

    // Update query - only update provided fields
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (currency !== undefined) {
      updateFields.push(`currency = $${paramIndex++}`);
      values.push(currency);
    }
    if (eventType !== undefined) {
      updateFields.push(`event_type = $${paramIndex++}`);
      values.push(eventType);
    }
    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (eventDate !== undefined) {
      updateFields.push(`event_date = $${paramIndex++}`);
      values.push(new Date(eventDate));
    }
    if (actualValue !== undefined) {
      updateFields.push(`actual_value = $${paramIndex++}`);
      values.push(actualValue);
    }
    if (expectedValue !== undefined) {
      updateFields.push(`expected_value = $${paramIndex++}`);
      values.push(expectedValue);
    }
    if (previousValue !== undefined) {
      updateFields.push(`previous_value = $${paramIndex++}`);
      values.push(previousValue);
    }
    if (impact !== undefined) {
      updateFields.push(`impact = $${paramIndex++}`);
      values.push(impact);
    }
    if (sentiment !== undefined) {
      updateFields.push(`sentiment = $${paramIndex++}`);
      values.push(sentiment);
    }
    if (confidenceScore !== undefined) {
      updateFields.push(`confidence_score = $${paramIndex++}`);
      values.push(confidenceScore);
    }
    if (priceImpact !== undefined) {
      updateFields.push(`price_impact = $${paramIndex++}`);
      values.push(priceImpact);
    }
    if (source !== undefined) {
      updateFields.push(`source = $${paramIndex++}`);
      values.push(source);
    }
    if (url !== undefined) {
      updateFields.push(`url = $${paramIndex++}`);
      values.push(url);
    }

    if (updateFields.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    // Add updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // Add WHERE clause
    values.push(id);
    const updateQuery = `
      UPDATE economic_events 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, values);
    const updatedEvent = result.rows[0];

    console.log(`📝 Economic event updated: ${updatedEvent.title} (${updatedEvent.currency})`);

    res.json({
      success: true,
      message: 'Economic event updated successfully',
      event: updatedEvent
    });

  } catch (error) {
    console.error('Error updating economic event:', error);
    res.status(500).json({ 
      error: 'Failed to update economic event',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/v1/events/:id - Delete economic event
router.delete('/:id', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if event exists
    const checkQuery = 'SELECT id, title, currency FROM economic_events WHERE id = $1';
    const checkResult = await query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: 'Economic event not found' });
      return;
    }

    const eventToDelete = checkResult.rows[0];

    // Delete the event
    const deleteQuery = 'DELETE FROM economic_events WHERE id = $1';
    await query(deleteQuery, [id]);

    console.log(`🗑️ Economic event deleted: ${eventToDelete.title} (${eventToDelete.currency})`);

    res.json({
      success: true,
      message: 'Economic event deleted successfully',
      deletedEvent: eventToDelete
    });

  } catch (error) {
    console.error('Error deleting economic event:', error);
    res.status(500).json({ 
      error: 'Failed to delete economic event',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/v1/events/statistics - Get event statistics
router.get('/statistics', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN impact = 'HIGH' THEN 1 END) as high_impact_events,
        COUNT(CASE WHEN sentiment = 'BULLISH' THEN 1 END) as bullish_events,
        COUNT(CASE WHEN sentiment = 'BEARISH' THEN 1 END) as bearish_events,
        COUNT(CASE WHEN sentiment = 'NEUTRAL' THEN 1 END) as neutral_events,
        COUNT(CASE WHEN currency = 'USD' THEN 1 END) as usd_events,
        COUNT(CASE WHEN currency = 'EUR' THEN 1 END) as eur_events,
        COUNT(CASE WHEN currency = 'GBP' THEN 1 END) as gbp_events,
        COUNT(CASE WHEN currency = 'JPY' THEN 1 END) as jpy_events,
        AVG(confidence_score) as avg_confidence_score,
        MAX(created_at) as latest_event_time
      FROM economic_events
    `;

    const result = await query(statsQuery);
    const stats = result.rows[0];

    res.json({
      success: true,
      statistics: {
        totalEvents: parseInt(stats.total_events),
        highImpactEvents: parseInt(stats.high_impact_events),
        sentimentBreakdown: {
          bullish: parseInt(stats.bullish_events),
          bearish: parseInt(stats.bearish_events),
          neutral: parseInt(stats.neutral_events)
        },
        currencyBreakdown: {
          USD: parseInt(stats.usd_events),
          EUR: parseInt(stats.eur_events),
          GBP: parseInt(stats.gbp_events),
          JPY: parseInt(stats.jpy_events)
        },
        averageConfidenceScore: parseFloat(stats.avg_confidence_score) || 0,
        latestEventTime: stats.latest_event_time
      }
    });

  } catch (error) {
    console.error('Error fetching event statistics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch event statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;