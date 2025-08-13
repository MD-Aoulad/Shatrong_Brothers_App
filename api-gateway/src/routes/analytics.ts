import express from 'express';
import { query } from '../config/database';

const router = express.Router();

// Get currency performance
router.get('/:currency/performance', async (req, res) => {
  try {
    const { currency } = req.params;
    
    // Get performance metrics
    const result = await query(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN sentiment = 'BULLISH' THEN 1 END) as bullish_events,
        COUNT(CASE WHEN sentiment = 'BEARISH' THEN 1 END) as bearish_events,
        COUNT(CASE WHEN sentiment = 'NEUTRAL' THEN 1 END) as neutral_events,
        AVG(confidence_score) as avg_confidence,
        AVG(ABS(price_impact)) as avg_price_impact
      FROM economic_events
      WHERE currency = $1 AND event_date >= NOW() - INTERVAL '30 days'
    `, [currency]);

    const performance = result.rows[0];
    
    res.json({
      currency,
      totalEvents: parseInt(performance.total_events),
      bullishEvents: parseInt(performance.bullish_events),
      bearishEvents: parseInt(performance.bearish_events),
      neutralEvents: parseInt(performance.neutral_events),
      averageConfidence: parseFloat(performance.avg_confidence || 0),
      averagePriceImpact: parseFloat(performance.avg_price_impact || 0),
      successRate: performance.total_events > 0 ? 
        (parseInt(performance.bullish_events) / parseInt(performance.total_events) * 100) : 0
    });
  } catch (error) {
    console.error('Error fetching performance:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

// Backtest trading strategy
router.post('/strategy/backtest', async (req, res) => {
  try {
    const { currency, startDate, endDate, strategy } = req.body;
    
    // Simple backtesting logic
    const result = await query(`
      SELECT 
        event_date,
        sentiment,
        confidence_score,
        price_impact,
        title
      FROM economic_events
      WHERE currency = $1 
        AND event_date BETWEEN $2 AND $3
        AND confidence_score >= 70
      ORDER BY event_date ASC
    `, [currency, startDate, endDate]);

    const events = result.rows;
    let correctSignals = 0;
    let totalSignals = events.length;
    let totalReturn = 0;

    events.forEach(event => {
      const predictedDirection = event.sentiment === 'BULLISH' ? 1 : -1;
      const actualDirection = event.price_impact > 0 ? 1 : -1;
      
      if (predictedDirection === actualDirection) {
        correctSignals++;
      }
      
      totalReturn += Math.abs(event.price_impact || 0);
    });

    const successRate = totalSignals > 0 ? (correctSignals / totalSignals) * 100 : 0;
    const averageReturn = totalSignals > 0 ? totalReturn / totalSignals : 0;

    res.json({
      currency,
      startDate,
      endDate,
      totalSignals,
      correctSignals,
      successRate: Math.round(successRate * 100) / 100,
      averageReturn: Math.round(averageReturn * 100) / 100,
      totalReturn: Math.round(totalReturn * 100) / 100,
      events: events.map(event => ({
        date: event.event_date,
        sentiment: event.sentiment,
        confidenceScore: event.confidence_score,
        priceImpact: event.price_impact,
        title: event.title
      }))
    });
  } catch (error) {
    console.error('Error backtesting strategy:', error);
    res.status(500).json({ error: 'Failed to backtest strategy' });
  }
});

// Get correlation analysis
router.get('/correlation', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        currency,
        sentiment,
        AVG(confidence_score) as avg_confidence,
        AVG(ABS(price_impact)) as avg_price_impact,
        COUNT(*) as event_count
      FROM economic_events
      WHERE event_date >= NOW() - INTERVAL '30 days'
      GROUP BY currency, sentiment
      ORDER BY currency, sentiment
    `);

    const correlations = result.rows.reduce((acc, row) => {
      if (!acc[row.currency]) {
        acc[row.currency] = {};
      }
      acc[row.currency][row.sentiment] = {
        averageConfidence: parseFloat(row.avg_confidence || 0),
        averagePriceImpact: parseFloat(row.avg_price_impact || 0),
        eventCount: parseInt(row.event_count)
      };
      return acc;
    }, {} as any);

    res.json(correlations);
  } catch (error) {
    console.error('Error fetching correlation:', error);
    res.status(500).json({ error: 'Failed to fetch correlation data' });
  }
});

export default router;
