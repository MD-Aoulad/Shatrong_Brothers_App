import dotenv from 'dotenv';
import { Pool } from 'pg';
import { createClient } from 'redis';

dotenv.config();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Redis connection
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Connect to Redis
redis.connect().catch(console.error);

// Analytics functions
async function generateAnalytics() {
  try {
    console.log('Generating analytics...');
    
    // Calculate performance metrics for each currency
    const currencies = ['EUR', 'USD', 'JPY', 'GBP'];
    
    for (const currency of currencies) {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_events,
          COUNT(CASE WHEN sentiment = 'BULLISH' THEN 1 END) as bullish_events,
          COUNT(CASE WHEN sentiment = 'BEARISH' THEN 1 END) as bearish_events,
          AVG(confidence_score) as avg_confidence,
          AVG(ABS(price_impact)) as avg_price_impact
        FROM economic_events
        WHERE currency = $1 AND event_date >= NOW() - INTERVAL '30 days'
      `, [currency]);

      const metrics = result.rows[0];
      console.log(`Analytics for ${currency}:`, metrics);
    }

  } catch (error) {
    console.error('Error generating analytics:', error);
  }
}

// Start analytics service
async function startAnalytics() {
  try {
    // Test database connection
    const client = await pool.connect();
    console.log('Connected to database');
    client.release();

    console.log('Analytics service started');

  } catch (error) {
    console.error('Failed to start analytics service:', error);
    process.exit(1);
  }
}

startAnalytics();
