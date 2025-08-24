import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import { EnhancedMultiSourceCollector } from './enhancedMultiSourceCollector';
import { CurrencyPowerCalculator } from './currencyPowerCalculator';

const app = express();
const PORT = process.env.PORT || 8002;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@postgres:5432/forex_app'
});

// Initialize services
const multiSourceCollector = new EnhancedMultiSourceCollector();
const currencyPowerCalculator = new CurrencyPowerCalculator();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Enhanced Data Collection API',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Trigger data refresh
app.post('/api/refresh', async (req, res) => {
  try {
    console.log('🔄 API: Triggering data refresh...');
    
    // Start data collection in background
    setTimeout(async () => {
      try {
        console.log('🚀 Starting background data collection...');
        await multiSourceCollector.collectFromAllSources();
        console.log('✅ Background data collection completed');
      } catch (error) {
        console.error('❌ Background data collection failed:', error);
      }
    }, 1000);
    
    res.json({
      success: true,
      message: 'Data refresh triggered successfully',
      timestamp: new Date().toISOString(),
      note: 'Collection running in background'
    });
    
  } catch (error: any) {
    console.error('❌ Error triggering data refresh:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger data refresh',
      error: error.message
    });
  }
});

// Get latest data
app.get('/api/latest', async (req, res) => {
  try {
    console.log('📊 API: Fetching latest data...');
    
    // Get latest events from database
    const query = `
      SELECT id, currency, event_type, title, description, event_date, 
             actual_value, expected_value, previous_value, impact, sentiment, 
             confidence_score, price_impact, source, url, created_at
      FROM economic_events
      ORDER BY event_date DESC
      LIMIT 100
    `;
    
    const result = await pool.query(query);
    
    // Calculate currency power scores
    const currencyPowerScores = currencyPowerCalculator.calculateCurrencyPower(result.rows);
    
    res.json({
      success: true,
      data: {
        events: result.rows,
        currencyPowerScores,
        summary: {
          totalEvents: result.rows.length,
          currencies: [...new Set(result.rows.map(e => e.currency))],
          dateRange: {
            start: result.rows[result.rows.length - 1]?.event_date,
            end: result.rows[0]?.event_date
          }
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ Error fetching latest data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest data',
      error: error.message
    });
  }
});

// Get data status
app.get('/api/status', async (req, res) => {
  try {
    console.log('📈 API: Fetching data status...');
    
    // Get database statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_events,
        COUNT(DISTINCT currency) as unique_currencies,
        MIN(event_date) as earliest_date,
        MAX(event_date) as latest_date,
        COUNT(*) FILTER (WHERE impact = 'HIGH') as high_impact_events,
        COUNT(*) FILTER (WHERE impact = 'MEDIUM') as medium_impact_events,
        COUNT(*) FILTER (WHERE impact = 'LOW') as low_impact_events
      FROM economic_events
    `;
    
    const statsResult = await pool.query(statsQuery);
    const stats = statsResult.rows[0];
    
    // Get currency breakdown
    const currencyQuery = `
      SELECT currency, COUNT(*) as count
      FROM economic_events
      GROUP BY currency
      ORDER BY count DESC
    `;
    
    const currencyResult = await pool.query(currencyQuery);
    
    res.json({
      success: true,
      status: {
        database: {
          totalEvents: parseInt(stats.total_events),
          uniqueCurrencies: parseInt(stats.unique_currencies),
          dateRange: {
            earliest: stats.earliest_date,
            latest: stats.latest_date
          },
          impactBreakdown: {
            high: parseInt(stats.high_impact_events),
            medium: parseInt(stats.medium_impact_events),
            low: parseInt(stats.low_impact_events)
          }
        },
        currencies: currencyResult.rows,
        lastUpdate: new Date().toISOString(),
        serviceStatus: 'running'
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ Error fetching data status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch data status',
      error: error.message
    });
  }
});

// Get Forex Factory calendar data (with fallback)
app.get('/api/forex-factory', async (req, res) => {
  try {
    const { week } = req.query;
    console.log(`📅 API: Fetching Forex Factory data${week ? ` for week: ${week}` : ''}...`);
    
    // Try to get data from database first
    let query = `
      SELECT id, currency, event_type, title, description, event_date, 
             actual_value, expected_value, previous_value, impact, sentiment, 
             confidence_score, price_impact, source, url
      FROM economic_events
      WHERE source LIKE '%Forex%' OR source LIKE '%Factory%'
    `;
    
    const params: any[] = [];
    
    if (week) {
      query += ` AND event_date >= $1 AND event_date < $1 + INTERVAL '7 days'`;
      params.push(week);
    }
    
    query += ` ORDER BY event_date DESC LIMIT 50`;
    
    const result = await pool.query(query, params);
    
    if (result.rows.length > 0) {
      res.json({
        success: true,
        data: result.rows,
        source: 'Database (Forex Factory data)',
        count: result.rows.length
      });
    } else {
      // Fallback: generate sample data
      const fallbackData = await generateFallbackForexData();
      res.json({
        success: true,
        data: fallbackData,
        source: 'Fallback (Sample Forex Factory data)',
        count: fallbackData.length,
        note: 'Using fallback data - live collection may be blocked'
      });
    }
    
  } catch (error: any) {
    console.error('❌ Error fetching Forex Factory data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Forex Factory data',
      error: error.message
    });
  }
});

// Get economic indicators
app.get('/api/indicators', async (req, res) => {
  try {
    console.log('📊 API: Fetching economic indicators...');
    
    const query = `
      SELECT currency, event_type, title, event_date, impact, sentiment, confidence_score
      FROM economic_events
      WHERE event_type IN ('CPI', 'GDP', 'INTEREST_RATE', 'EMPLOYMENT', 'PMI')
      ORDER BY event_date DESC
      LIMIT 50
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
    
  } catch (error: any) {
    console.error('❌ Error fetching economic indicators:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch economic indicators',
      error: error.message
    });
  }
});

// Get currency prices (placeholder for now)
app.get('/api/prices', async (req, res) => {
  try {
    console.log('💰 API: Fetching currency prices...');
    
    // For now, return a placeholder response
    // In the future, this could integrate with real-time price feeds
    res.json({
      success: true,
      data: {
        message: 'Currency price endpoint - to be implemented with real-time feeds',
        currencies: ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'],
        note: 'Real-time price integration coming soon'
      }
    });
    
  } catch (error: any) {
    console.error('❌ Error fetching currency prices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch currency prices',
      error: error.message
    });
  }
});

// Get comprehensive forex data
app.get('/api/comprehensive', async (req, res) => {
  try {
    console.log('🌍 API: Fetching comprehensive forex data...');
    
    // Get all events
    const eventsQuery = `
      SELECT * FROM economic_events
      ORDER BY event_date DESC
      LIMIT 200
    `;
    
    const eventsResult = await pool.query(eventsQuery);
    
    // Calculate currency power scores
    const currencyPowerScores = currencyPowerCalculator.calculateCurrencyPower(eventsResult.rows);
    
    // Generate detailed report
    const detailedReport = currencyPowerCalculator.generateDetailedReport(currencyPowerScores);
    
    res.json({
      success: true,
      data: {
        events: eventsResult.rows,
        currencyPowerScores,
        detailedReport,
        summary: {
          totalEvents: eventsResult.rows.length,
          currencies: [...new Set(eventsResult.rows.map(e => e.currency))],
          dateRange: {
            start: eventsResult.rows[eventsResult.rows.length - 1]?.event_date,
            end: eventsResult.rows[0]?.event_date
          }
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ Error fetching comprehensive data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comprehensive data',
      error: error.message
    });
  }
});

// Generate fallback Forex Factory data
async function generateFallbackForexData() {
  const fallbackEvents = [
    {
      id: 'fallback-1',
      currency: 'USD',
      event_type: 'CPI',
      title: 'US Consumer Price Index',
      description: 'Monthly inflation data for the United States',
      event_date: new Date('2025-01-15T14:30:00Z'),
      actual_value: '3.1%',
      expected_value: '3.0%',
      previous_value: '3.2%',
      impact: 'HIGH',
      sentiment: 'BULLISH',
      confidence_score: 85,
      source: 'Forex Factory (Fallback)',
      url: 'https://www.forexfactory.com/calendar'
    },
    {
      id: 'fallback-2',
      currency: 'EUR',
      event_type: 'INTEREST_RATE',
      title: 'ECB Interest Rate Decision',
      description: 'European Central Bank monetary policy decision',
      event_date: new Date('2025-01-16T10:00:00Z'),
      actual_value: '4.50%',
      expected_value: '4.50%',
      previous_value: '4.50%',
      impact: 'HIGH',
      sentiment: 'NEUTRAL',
      confidence_score: 90,
      source: 'Forex Factory (Fallback)',
      url: 'https://www.forexfactory.com/calendar'
    }
  ];
  
  return fallbackEvents;
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Enhanced Data Collection API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔄 Data refresh: http://localhost:${PORT}/api/refresh`);
  console.log(`📈 Latest data: http://localhost:${PORT}/api/latest`);
  console.log(`📋 Status: http://localhost:${PORT}/api/status`);
});

export default app;
