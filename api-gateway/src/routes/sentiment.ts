import express from 'express';
import { query } from '../config/database';

const router = express.Router();

// Get all currency sentiments
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT currency, current_sentiment, confidence_score, trend, last_updated
      FROM currency_sentiments
      ORDER BY last_updated DESC
    `);

    const sentiments = result.rows.map(row => ({
      id: row.id,
      currency: row.currency,
      currentSentiment: row.current_sentiment,
      confidenceScore: row.confidence_score,
      trend: row.trend,
      lastUpdated: row.last_updated,
      recentEvents: []
    }));

    return res.json(sentiments);
  } catch (error) {
    console.error('Error fetching sentiments:', error);
    return res.status(500).json({ error: 'Failed to fetch sentiments' });
  }
});

// Get specific currency sentiment
router.get('/:currency', async (req, res) => {
  try {
    const { currency } = req.params;
    
    const result = await query(`
      SELECT currency, current_sentiment, confidence_score, trend, last_updated
      FROM currency_sentiments
      WHERE currency = $1
    `, [currency]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Currency sentiment not found' });
    }

    const sentiment = result.rows[0];
    return res.json({
      id: sentiment.id,
      currency: sentiment.currency,
      currentSentiment: sentiment.current_sentiment,
      confidenceScore: sentiment.confidence_score,
      trend: sentiment.trend,
      lastUpdated: sentiment.last_updated,
      recentEvents: []
    });
  } catch (error) {
    console.error('Error fetching currency sentiment:', error);
    return res.status(500).json({ error: 'Failed to fetch currency sentiment' });
  }
});

// Get historical sentiment data
router.get('/:currency/history', async (req, res) => {
  try {
    const { currency } = req.params;
    const { startDate, endDate } = req.query;

    let queryText = `
      SELECT sentiment_date, sentiment, confidence_score, price_change
      FROM sentiment_history
      WHERE currency = $1
    `;
    const params = [currency];

    if (startDate && endDate) {
      queryText += ` AND sentiment_date BETWEEN $2 AND $3`;
      params.push(startDate as string, endDate as string);
    }

    queryText += ` ORDER BY sentiment_date DESC`;

    const result = await query(queryText, params);

    const history = result.rows.map(row => ({
      date: row.sentiment_date,
      sentiment: row.sentiment,
      confidenceScore: row.confidence_score,
      priceChange: row.price_change
    }));

    return res.json(history);
  } catch (error) {
    console.error('Error fetching sentiment history:', error);
    return res.status(500).json({ error: 'Failed to fetch sentiment history' });
  }
});

export default router;
