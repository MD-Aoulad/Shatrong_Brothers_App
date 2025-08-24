import { Pool } from 'pg';
import { ForexFactoryCalendarService } from './forexFactoryCalendar';
import { FinancialNewsCollector } from './financialNewsCollector';
import { HistoricalNewsCollector } from './historicalNewsCollector';
import { CurrencyPowerCalculator } from './currencyPowerCalculator';
import express from 'express';
import cors from 'cors';
import { EnhancedMultiSourceCollector } from './enhancedMultiSourceCollector';


console.log('🚀 Enhanced Forex Data Collection Service Starting...');

class ForexDataCollectionService {
  private pool: Pool;
  private forexFactoryService: ForexFactoryCalendarService;
  private newsCollector: FinancialNewsCollector;
  private historicalNewsCollector: HistoricalNewsCollector;
  private currencyPowerCalculator: CurrencyPowerCalculator;

  private isRunning = false;
  private updateInterval: NodeJS.Timeout | null = null;
  private lastHistoricalCollection: Date | null = null;

  constructor() {
    // Initialize database connection
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@postgres:5432/forex_app',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Initialize services
    this.forexFactoryService = new ForexFactoryCalendarService();
    this.newsCollector = new FinancialNewsCollector();
    this.historicalNewsCollector = new HistoricalNewsCollector();
    this.currencyPowerCalculator = new CurrencyPowerCalculator();

    console.log('✅ Services initialized successfully');
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️ Service already running');
      return;
    }

    try {
      // Test database connection
      await this.testDatabaseConnection();
      
      this.isRunning = true;
      console.log('✅ Starting enhanced forex data collection...');

      // Start immediate collection
      await this.collectAllData();

      // Set up periodic collection every 5 minutes
      this.updateInterval = setInterval(async () => {
        await this.collectAllData();
      }, 5 * 60 * 1000); // 5 minutes

      console.log('🔄 Data collection running every 5 minutes');
      
    } catch (error) {
      console.error('❌ Failed to start service:', error);
      this.isRunning = false;
    }
  }

  async stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
    await this.pool.end();
    console.log('🛑 Service stopped');
  }

  private async testDatabaseConnection() {
    try {
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      console.log('✅ Database connected successfully');
    } catch (error) {
      throw new Error(`Database connection failed: ${error}`);
    }
  }

  private async collectAllData() {
    try {
      console.log('🔄 Starting data collection cycle...');
      
      // 1. Collect Forex Factory economic calendar
      await this.collectEconomicCalendar();
      
      // 2. Collect financial news
      await this.collectFinancialNews();
      
      // 3. Collect real-time economic data
      await this.collectEconomicData();
      
      // 4. Collect historical news (only once per day to avoid API limits)
      const now = new Date();
      const lastHistoricalCollection = this.lastHistoricalCollection || new Date(0);
      const hoursSinceLastCollection = (now.getTime() - lastHistoricalCollection.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastCollection >= 24) {
        await this.collectHistoricalNews();
        this.lastHistoricalCollection = now;
      }
      
      console.log('✅ Data collection cycle completed');
      
    } catch (error) {
      console.error('❌ Error in data collection cycle:', error);
    }
  }

  private async collectEconomicCalendar() {
    try {
      console.log('📅 Collecting economic calendar data...');
      
      const calendarData = await this.forexFactoryService.getCalendarData();
      
      if (calendarData.events.length > 0) {
        console.log(`📊 Got ${calendarData.events.length} economic events from ${calendarData.source}`);
        
        // Store events in database
        await this.storeEconomicEvents(calendarData.events);
        
        // Update currency sentiments based on new data
        await this.updateCurrencySentiments(calendarData.events);
      } else {
        console.log('⚠️ No economic events collected');
      }
      
    } catch (error) {
      console.error('❌ Error collecting economic calendar:', error);
    }
  }

  private async collectFinancialNews() {
    try {
      console.log('📰 Collecting financial news...');
      
      const news = await this.newsCollector.collectFinancialNews();
      
      if (news.length > 0) {
        console.log(`📰 Got ${news.length} financial news items`);
        
        // Store news in database
        await this.storeFinancialNews(news);
      } else {
        console.log('⚠️ No financial news collected');
      }
      
    } catch (error) {
      console.error('❌ Error collecting financial news:', error);
    }
  }

  private async collectEconomicData() {
    try {
      console.log('📊 Collecting real-time economic data...');
      
      // For now, we'll skip this since the service doesn't have the right method
      // This can be implemented later with proper economic data APIs
      console.log('⚠️ Economic data collection not yet implemented - will be added later');
      
    } catch (error) {
      console.error('❌ Error collecting economic data:', error);
    }
  }

  private async collectHistoricalNews() {
    try {
      console.log('📰 Collecting historical news for 2025...');
      
      // Collect news from January 1, 2025 to current date
      const startDate = '2025-01-01';
      const endDate = new Date().toISOString().split('T')[0];
      
      const historicalNews = await this.historicalNewsCollector.collectHistoricalNews(startDate, endDate);
      
      if (historicalNews.length > 0) {
        console.log(`📰 Collected ${historicalNews.length} historical news items`);
        
        // Store historical news in database
        await this.storeHistoricalNews(historicalNews);
        
        // Calculate currency power scores
        await this.calculateAndStoreCurrencyPower(historicalNews);
        
      } else {
        console.log('⚠️ No historical news collected');
      }
      
    } catch (error) {
      console.error('❌ Error collecting historical news:', error);
    }
  }

  private async storeHistoricalNews(newsItems: any[]) {
    try {
      console.log('💾 Storing historical news in database...');
      
      for (const item of newsItems) {
        // Extract primary currency from news
        const primaryCurrency = item.currencies[0] || 'USD';
        
        // Validate and parse the publishedAt date
        let eventDate = new Date();
        if (item.publishedAt && !isNaN(new Date(item.publishedAt).getTime())) {
          eventDate = new Date(item.publishedAt);
        }
        
        // Validate confidence score to be between 0 and 100
        let confidenceScore = item.confidenceScore || 75;
        if (confidenceScore < 0) confidenceScore = 0;
        if (confidenceScore > 100) confidenceScore = 100;
        
        const query = `
          INSERT INTO economic_events (
            currency, event_type, title, description, event_date, 
            impact, sentiment, confidence_score, source, url
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (title, currency) DO NOTHING
        `;
        
        await this.pool.query(query, [
          primaryCurrency,
          'NEWS',
          item.title,
          item.description,
          eventDate,
          item.impact,
          item.sentiment,
          confidenceScore,
          item.source,
          item.url
        ]);
      }
      
      console.log(`💾 Successfully stored ${newsItems.length} historical news items`);
      
    } catch (error) {
      console.error('❌ Error storing historical news:', error);
    }
  }

  private async calculateAndStoreCurrencyPower(newsData: any[]) {
    try {
      console.log('🧮 Calculating currency power scores...');
      
      // Calculate currency power scores
      const currencyScores = this.currencyPowerCalculator.calculateCurrencyPower(newsData);
      
      // Generate detailed report
      const report = this.currencyPowerCalculator.generateDetailedReport(currencyScores);
      
      // Store currency power scores in database (if you have a table for it)
      await this.storeCurrencyPowerScores(currencyScores);
      
      // Log the report
      console.log('\n' + report);
      
      console.log('✅ Currency power calculation completed');
      
    } catch (error) {
      console.error('❌ Error calculating currency power:', error);
    }
  }

  private async storeCurrencyPowerScores(currencyScores: any[]) {
    try {
      console.log('💾 Storing currency power scores...');
      
      // For now, we'll just log them since we don't have a dedicated table
      // You can create a currency_power_scores table if needed
      console.log('📊 Currency Power Scores:');
      for (const score of currencyScores) {
        console.log(`${score.rank}. ${score.currency}: ${score.totalScore}/100 (${score.strength}) - ${score.trend}`);
      }
      
    } catch (error) {
      console.error('❌ Error storing currency power scores:', error);
    }
  }

  private async storeEconomicEvents(events: any[]) {
    try {
      for (const event of events) {
        const query = `
          INSERT INTO economic_events (
            currency, event_type, title, description, event_date, 
            actual_value, expected_value, previous_value, impact, 
            sentiment, confidence_score, price_impact, source, url
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (title, currency) DO NOTHING
        `;
        
        await this.pool.query(query, [
          event.currency,
          event.eventType,
          event.title,
          event.description,
          event.eventDate,
          event.actualValue,
          event.expectedValue,
          event.previousValue,
          event.impact,
          event.sentiment,
          event.confidenceScore,
          event.priceImpact || 0, // Add price_impact parameter
          event.source,
          event.url || null
        ]);
      }
      
      console.log(`💾 Stored ${events.length} economic events in database`);
      
    } catch (error) {
      console.error('❌ Error storing economic events:', error);
    }
  }

  private async storeFinancialNews(news: any[]) {
    try {
      for (const item of news) {
        const query = `
          INSERT INTO economic_events (
            currency, event_type, title, description, event_date, 
            impact, sentiment, confidence_score, source, url
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (title, currency) DO NOTHING
        `;
        
        // Extract primary currency from news
        const primaryCurrency = item.currencies[0] || 'USD';
        
        // Validate and parse the publishedAt date
        let eventDate = new Date();
        if (item.publishedAt && !isNaN(new Date(item.publishedAt).getTime())) {
          eventDate = new Date(item.publishedAt);
        }
        
        // Validate confidence score to be between 0 and 100
        let confidenceScore = item.confidenceScore || 75;
        if (confidenceScore < 0) confidenceScore = 0;
        if (confidenceScore > 100) confidenceScore = 100;
        
        await this.pool.query(query, [
          primaryCurrency,
          'NEWS',
          item.title,
          item.description,
          eventDate,
          item.impact,
          item.sentiment,
          confidenceScore,
          item.source,
          item.url
        ]);
      }
      
      console.log(`💾 Stored ${news.length} news items in database`);
      
    } catch (error) {
      console.error('❌ Error storing financial news:', error);
    }
  }

  private async storeEconomicData(data: any[]) {
    try {
      for (const item of data) {
        const query = `
          INSERT INTO economic_events (
            currency, event_type, title, description, event_date, 
            actual_value, impact, sentiment, confidence_score, source
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (title, currency, event_date) DO NOTHING
        `;
        
        await this.pool.query(query, [
          item.currency,
          item.dataType,
          item.title || `${item.dataType} Data`,
          item.description || `Latest ${item.dataType} data for ${item.currency}`,
          new Date(),
          item.value,
          'MEDIUM',
          'NEUTRAL',
          75,
          item.source
        ]);
      }
      
      console.log(`💾 Stored ${data.length} economic data points in database`);
      
    } catch (error) {
      console.error('❌ Error storing economic data:', error);
    }
  }

  private async updateCurrencySentiments(events: any[]) {
    try {
      // Group events by currency
      const currencyEvents = events.reduce((acc, event) => {
        if (!acc[event.currency]) {
          acc[event.currency] = [];
        }
        acc[event.currency].push(event);
        return acc;
      }, {});

      // Update sentiment for each currency
      for (const [currency, currencyEventList] of Object.entries(currencyEvents)) {
        const sentiment = this.calculateCurrencySentiment(currencyEventList as any[]);
        
        const query = `
          INSERT INTO currency_sentiments (currency, current_sentiment, confidence_score, trend)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (currency) DO UPDATE SET
            current_sentiment = EXCLUDED.current_sentiment,
            confidence_score = EXCLUDED.confidence_score,
            trend = EXCLUDED.trend,
            last_updated = CURRENT_TIMESTAMP
        `;
        
        await this.pool.query(query, [
          currency,
          sentiment.sentiment,
          sentiment.confidence,
          sentiment.trend
        ]);
      }
      
      console.log('💾 Updated currency sentiments in database');
      
    } catch (error) {
      console.error('❌ Error updating currency sentiments:', error);
    }
  }

  private calculateCurrencySentiment(events: any[]) {
    let bullishCount = 0;
    let bearishCount = 0;
    let totalConfidence = 0;
    
    events.forEach(event => {
      if (event.sentiment === 'BULLISH') bullishCount++;
      else if (event.sentiment === 'BEARISH') bearishCount++;
      totalConfidence += event.confidenceScore || 50;
    });
    
    const avgConfidence = Math.round(totalConfidence / events.length);
    
    let sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    if (bullishCount > bearishCount) sentiment = 'BULLISH';
    else if (bearishCount > bullishCount) sentiment = 'BEARISH';
    
    let trend: 'STRENGTHENING' | 'WEAKENING' | 'STABLE' = 'STABLE';
    if (Math.abs(bullishCount - bearishCount) > 2) {
      trend = bullishCount > bearishCount ? 'STRENGTHENING' : 'WEAKENING';
    }
    
    return { sentiment, confidence: avgConfidence, trend };
  }
}

// Start the service
const service = new ForexDataCollectionService();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  await service.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  await service.stop();
  process.exit(0);
});

// Start the service
service.start().catch(error => {
  console.error('❌ Failed to start service:', error);
  process.exit(1);
});

console.log('✅ Forex Data Collection Service ready!');
console.log('📊 Will collect economic calendar, news, and real-time data');
console.log('🔄 Collection interval: Every 5 minutes');
console.log('🌐 Sources: Forex Factory, Financial News APIs, Economic Data APIs');

// Start the API server for frontend integration

// Initialize API server components
const apiApp = express();
const apiPort = 8002;

// Middleware
apiApp.use(cors());
apiApp.use(express.json());

// Create separate database connection for API
const apiPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@postgres:5432/forex_app'
});

// Initialize services for API
const apiMultiSourceCollector = new EnhancedMultiSourceCollector();
const apiCurrencyPowerCalculator = new CurrencyPowerCalculator();

// Health check endpoint
apiApp.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Enhanced Data Collection API',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Get latest data endpoint
apiApp.get('/api/latest', async (req, res) => {
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
    
    const result = await apiPool.query(query);
    
    // Calculate currency power scores
    const currencyPowerScores = apiCurrencyPowerCalculator.calculateCurrencyPower(result.rows);
    
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

// Get comprehensive data endpoint
apiApp.get('/api/comprehensive', async (req, res) => {
  try {
    console.log('🌍 API: Fetching comprehensive forex data...');
    
    // Get all events
    const eventsQuery = `
      SELECT * FROM economic_events
      ORDER BY event_date DESC
      LIMIT 200
    `;
    
    const eventsResult = await apiPool.query(eventsQuery);
    
    // Calculate currency power scores
    const currencyPowerScores = apiCurrencyPowerCalculator.calculateCurrencyPower(eventsResult.rows);
    
    // Generate detailed report
    const detailedReport = apiCurrencyPowerCalculator.generateDetailedReport(currencyPowerScores);
    
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

// Start API server
apiApp.listen(apiPort, () => {
  console.log(`🚀 Enhanced Data Collection API Server running on port ${apiPort}`);
  console.log(`📊 Health check: http://localhost:${apiPort}/health`);
  console.log(`📈 Latest data: http://localhost:${apiPort}/api/latest`);
  console.log(`🌍 Comprehensive: http://localhost:${apiPort}/api/comprehensive`);
});
