import express from 'express';
import { query } from '../config/database';
import { getRedisClient } from '../config/redis';

const router = express.Router();

// Get dashboard data
router.get('/', async (req, res) => {
  try {
    const redis = getRedisClient();
    
    // Try to get from cache first
    const cachedData = await redis.get('dashboard:data');
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    // Get currency sentiments
    const sentimentsResult = await query(`
      SELECT currency, current_sentiment, confidence_score, trend, last_updated
      FROM currency_sentiments
      ORDER BY last_updated DESC
    `);

    // Get recent events (increased to show more data)
    const eventsResult = await query(`
      SELECT id, currency, event_type, title, description, event_date, 
             actual_value, expected_value, previous_value, impact, sentiment, 
             confidence_score, price_impact, source, url, created_at
      FROM economic_events
      ORDER BY event_date DESC
      LIMIT 50
    `);

    const dashboardData = {
      currencySentiments: sentimentsResult.rows.map(row => ({
        id: row.id,
        currency: row.currency,
        currentSentiment: row.current_sentiment,
        confidenceScore: row.confidence_score,
        trend: row.trend,
        lastUpdated: row.last_updated,
        recentEvents: []
      })),
      recentEvents: eventsResult.rows.map(row => ({
        id: row.id,
        currency: row.currency,
        eventType: row.event_type,
        title: row.title,
        description: row.description,
        date: row.event_date,
        actualValue: row.actual_value,
        expectedValue: row.expected_value,
        previousValue: row.previous_value,
        impact: row.impact,
        sentiment: row.sentiment,
        confidenceScore: row.confidence_score,
        priceImpact: row.price_impact,
        source: row.source,
        url: row.url,
        createdAt: row.created_at,
        updatedAt: row.created_at
      })),
      marketStatus: 'Active',
      activeAlerts: 0
    };

    // Cache the data for 5 minutes
    await redis.setEx('dashboard:data', 300, JSON.stringify(dashboardData));

    return res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
