import express = require('express');
import cors = require('cors');
import { EnhancedDataCollector } from './enhancedDataCollector';
import { ForexFactoryCalendarService } from './forexFactoryCalendar';

const app = express();
const PORT = process.env.PORT || 8002;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const forexFactoryService = new ForexFactoryCalendarService();
let enhancedCollector: EnhancedDataCollector | null = null;

// Initialize enhanced collector when database is available
const initializeCollector = () => {
  try {
    // For now, we'll create a mock pool since the real database connection isn't implemented
    const mockPool = {} as any;
    enhancedCollector = new EnhancedDataCollector(mockPool);
    console.log('✅ Enhanced Data Collector initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Enhanced Data Collector:', error);
  }
};

// Initialize on startup
initializeCollector();

// API Routes

// Trigger data refresh
app.post('/api/refresh', async (req: express.Request, res: express.Response) => {
  try {
    console.log('🔄 API: Triggering data refresh...');
    
    // Trigger Forex Factory data collection
    const calendarData = await forexFactoryService.getCurrentWeekCalendar();
    
    // If enhanced collector is available, trigger it too
    if (enhancedCollector) {
      try {
        await enhancedCollector.collectAllData();
      } catch (error) {
        console.log('⚠️ Enhanced collector refresh failed, continuing with Forex Factory...');
      }
    }
    
    console.log('✅ API: Data refresh completed');
    
    res.json({
      success: true,
      message: 'Data refresh completed successfully',
      timestamp: new Date().toISOString(),
      forexFactoryEvents: calendarData.events.length,
      dataSource: 'Forex Factory Calendar + Enhanced Collector'
    });
    
  } catch (error) {
    console.error('❌ API: Data refresh failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Data refresh failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Get latest data
app.get('/api/latest', async (req: express.Request, res: express.Response) => {
  try {
    console.log('📊 API: Fetching latest data...');
    
    // Get Forex Factory calendar data
    const calendarData = await forexFactoryService.getCurrentWeekCalendar();
    
    // Get enhanced collector data if available
    let enhancedData = null;
    if (enhancedCollector) {
      try {
        enhancedData = enhancedCollector.getData();
      } catch (error) {
        console.log('⚠️ Failed to get enhanced collector data');
      }
    }
    
    res.json({
      success: true,
      data: {
        forexFactory: calendarData,
        enhanced: enhancedData,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ API: Failed to fetch latest data:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest data',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Get data collection status
app.get('/api/status', async (req: express.Request, res: express.Response) => {
  try {
    console.log('📈 API: Fetching data collection status...');
    
    let status = {
      forexFactory: {
        isAvailable: true,
        lastUpdate: new Date().toISOString(),
        eventsCount: 0
      },
      enhanced: {
        isAvailable: false,
        status: 'Not initialized'
      }
    };
    
    // Get Forex Factory status
    try {
      const calendarData = await forexFactoryService.getCurrentWeekCalendar();
      status.forexFactory.eventsCount = calendarData.events.length;
    } catch (error) {
      status.forexFactory.isAvailable = false;
    }
    
    // Get enhanced collector status
    if (enhancedCollector) {
      try {
        const collectorStatus = enhancedCollector.getStatus();
        status.enhanced = {
          isAvailable: true,
          status: collectorStatus
        };
      } catch (error) {
        status.enhanced.isAvailable = false;
        status.enhanced.status = 'Error getting status';
      }
    }
    
    res.json({
      success: true,
      status,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ API: Failed to fetch status:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch status',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Get Forex Factory calendar data
app.get('/api/forex-factory', async (req: express.Request, res: express.Response) => {
  try {
    const { week } = req.query;
    console.log(`📅 API: Fetching Forex Factory calendar${week ? ` for week: ${week}` : ''}...`);
    
    let calendarData;
    if (week && typeof week === 'string') {
      calendarData = await forexFactoryService.getCalendarForWeek(week);
    } else {
      calendarData = await forexFactoryService.getCurrentWeekCalendar();
    }
    
    res.json({
      success: true,
      data: calendarData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ API: Failed to fetch Forex Factory data:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Forex Factory data',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Get economic indicators
app.get('/api/indicators', async (req: express.Request, res: express.Response) => {
  try {
    console.log('📊 API: Fetching economic indicators...');
    
    // For now, return mock data since FRED integration needs API keys
    const mockIndicators = [
      {
        name: 'US Unemployment Rate',
        currency: 'USD',
        value: 3.8,
        previous: 3.9,
        change: -0.1,
        changePercent: -2.56,
        date: new Date().toISOString(),
        source: 'FRED (Mock)'
      },
      {
        name: 'US CPI',
        currency: 'USD',
        value: 3.2,
        previous: 3.1,
        change: 0.1,
        changePercent: 3.23,
        date: new Date().toISOString(),
        source: 'FRED (Mock)'
      }
    ];
    
    res.json({
      success: true,
      data: mockIndicators,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ API: Failed to fetch indicators:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch indicators',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Get currency prices
app.get('/api/prices', async (req: express.Request, res: express.Response) => {
  try {
    console.log('💱 API: Fetching currency prices...');
    
    // For now, return mock data since ExchangeRate-API integration needs to be implemented
    const mockPrices = [
      {
        currency: 'EUR',
        rate: 1.0925,
        base: 'USD',
        change: 0.0025,
        changePercent: 0.23,
        timestamp: new Date().toISOString(),
        source: 'ExchangeRate-API (Mock)'
      },
      {
        currency: 'GBP',
        rate: 1.2678,
        base: 'USD',
        change: -0.0032,
        changePercent: -0.25,
        timestamp: new Date().toISOString(),
        source: 'ExchangeRate-API (Mock)'
      }
    ];
    
    res.json({
      success: true,
      data: mockPrices,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ API: Failed to fetch prices:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prices',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Health check
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({
    status: 'healthy',
    service: 'Data Collection Service',
    timestamp: new Date().toISOString(),
    forexFactory: 'available',
    enhanced: enhancedCollector ? 'available' : 'not initialized'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Data Collection API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔄 Data refresh: POST http://localhost:${PORT}/api/refresh`);
});

export default app;
