import { MT5Connector } from './mt5Connector';

/**
 * Standalone MT5 Test - Bypasses all problematic data collection
 * This will directly provide today's news data
 */
export async function testMT5Connector() {
  console.log('🧪 Starting standalone MT5 test...');
  
  try {
    // Initialize MT5 connector
    const mt5Connector = new MT5Connector();
    
    // Connect to MT5 (will use demo mode)
    console.log('🔌 Connecting to MT5...');
    const connected = await mt5Connector.connect();
    
    if (connected) {
      console.log('✅ MT5 connected successfully!');
      
      // Get today's news
      console.log('📰 Fetching today\'s news from MT5...');
      const todayNews = await mt5Connector.getNewsData();
      
      console.log(`📊 MT5 News Results:`);
      console.log(`   • Total news events: ${todayNews.length}`);
      
      todayNews.forEach((news, index) => {
        console.log(`   • News ${index + 1}: ${news.title}`);
        console.log(`     Currency: ${news.currency}`);
        console.log(`     Impact: ${news.impact}`);
        console.log(`     Sentiment: ${news.sentiment}`);
        console.log(`     Time: ${news.eventDate.toLocaleTimeString()}`);
        console.log(`     Source: ${news.source}`);
        console.log('');
      });
      
      // Get economic calendar
      console.log('📅 Fetching economic calendar...');
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      
      const calendarEvents = await mt5Connector.getEconomicCalendar(startDate, endDate);
      console.log(`   • Calendar events: ${calendarEvents.length}`);
      
      // Get market sentiment
      console.log('📈 Fetching market sentiment...');
      const sentiment = await mt5Connector.getMarketSentiment();
      console.log(`   • Market sentiment data:`, sentiment);
      
      return {
        success: true,
        newsCount: todayNews.length,
        calendarCount: calendarEvents.length,
        sentiment: sentiment,
        news: todayNews,
        calendar: calendarEvents
      };
      
    } else {
      console.log('❌ MT5 connection failed');
      return { success: false, error: 'MT5 connection failed' };
    }
    
  } catch (error) {
    console.error('❌ MT5 test error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

/**
 * Direct function to get today's news for immediate use
 */
export async function getTodayNews() {
  const result = await testMT5Connector();
  if (result.success) {
    return result.news;
  }
  return [];
}

// Export for testing
export default testMT5Connector;

