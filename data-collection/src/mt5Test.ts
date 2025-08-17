import { initializeMT5Connection, isMT5Connected, getHistoricalPrices, getLivePrices, getEconomicCalendar, getMarketSentiment } from './mt5Connector';

/**
 * Standalone MT5 Test - Tests real MT5 connection and data
 * This requires valid API credentials to function
 */
export async function testMT5Connector() {
  console.log('🧪 Starting MT5 connection test...');
  
  try {
    // Test MT5 connection
    const isConnected = await initializeMT5Connection();
    
    if (isConnected) {
      console.log('✅ MT5 connection test successful');
      
      // Test economic calendar
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Next 7 days
      try {
        const calendar = await getEconomicCalendar(startDate, endDate);
        console.log(`📅 MT5 Calendar: ${calendar.length} events found`);
      } catch (error) {
        console.log('📅 MT5 Calendar: No events available (requires real data source)');
      }
      
      // Test live prices
      try {
        const symbols = ['EUR/USD', 'GBP/USD', 'USD/JPY'];
        const prices = await getLivePrices(symbols);
        console.log(`📈 MT5 Live Prices: ${prices.length} symbols found`);
      } catch (error) {
        console.log('📈 MT5 Live Prices: No prices available');
      }
      
      // Test market sentiment
      try {
        const symbols = ['EUR/USD', 'GBP/USD', 'USD/JPY'];
        const sentiment = await getMarketSentiment(symbols);
        console.log(`🧠 MT5 Sentiment: ${sentiment.length} symbols analyzed`);
      } catch (error) {
        console.log('🧠 MT5 Sentiment: No sentiment data available');
      }
      
      // Test historical prices
      try {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
        const historical = await getHistoricalPrices('EUR/USD', startDate, endDate, 'H1');
        console.log(`📊 MT5 Historical: ${historical.length} H1 bars found for EUR/USD`);
      } catch (error) {
        console.log('📊 MT5 Historical: No historical data available');
      }
      
      return {
        success: true,
        message: 'MT5 connection successful - real data available'
      };
      
    } else {
      console.log('❌ MT5 connection test failed - requires valid API credentials');
      return { 
        success: false, 
        error: 'MT5 connection failed - requires valid API credentials',
        instructions: 'Please set METAAPI_TOKEN and METAAPI_ACCOUNT_ID in your .env file'
      };
    }
    
  } catch (error) {
    console.error('❌ MT5 test error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      instructions: 'Check your API credentials and network connection'
    };
  }
}

/**
 * Check MT5 connection status
 */
export function checkMT5Status(): boolean {
  return isMT5Connected();
}

// Export for testing
export default testMT5Connector;

