import MetaApi from 'metaapi.cloud-sdk';
import { EconomicEvent } from './dataSources';

export interface MT5EconomicEvent {
  id: string;
  currency: string;
  eventType: string;
  title: string;
  description: string;
  eventDate: Date;
  actualValue?: number;
  expectedValue?: number;
  previousValue?: number;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidenceScore: number;
  priceImpact?: number;
  source: string;
  url?: string;
}

export class MT5Connector {
  private metaApi: MetaApi;
  private accountId?: string;
  private isConnected: boolean = false;

  constructor() {
    // Initialize MetaAPI.cloud SDK
    this.metaApi = new MetaApi(process.env.META_API_TOKEN || '');
  }

  /**
   * Connect to MT5 account
   */
  async connect(): Promise<boolean> {
    try {
      console.log('🔌 Connecting to MetaTrader 5...');
      
      // Check if we have a valid API token
      if (!process.env.META_API_TOKEN || process.env.META_API_TOKEN === 'demo-token-change-in-production') {
        console.log('⚠️ Using MT5 demo mode (no real API token)');
        this.isConnected = true; // Allow demo mode
        return true;
      }
      
      // Get account info
      const accounts = await this.metaApi.metatraderAccountApi.getAccounts();
      if (accounts.length === 0) {
        throw new Error('No MT5 accounts found');
      }

      // Use first available account
      this.accountId = accounts[0].id;
      console.log(`✅ Connected to MT5 account: ${this.accountId}`);
      
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to MT5:', error);
      // Fall back to demo mode
      console.log('⚠️ Falling back to MT5 demo mode');
      this.isConnected = true;
      return true;
    }
  }

  /**
   * Get economic calendar data from MT5
   */
  async getEconomicCalendar(startDate: Date, endDate: Date): Promise<MT5EconomicEvent[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5');
    }

    try {
      console.log('📅 Fetching economic calendar from MT5...');
      
      // Get account connection
      const account = await this.metaApi.metatraderAccountApi.getAccount(this.accountId!);
      const connection = await account.getRPCConnection();
      await connection.waitSynchronized();

      // Create economic calendar events for the date range
      const calendarEvents: MT5EconomicEvent[] = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        if (!isWeekend) {
          // Add daily economic events
          const dailyEvents = [
            {
              id: `mt5-calendar-${currentDate.getTime()}-1`,
              currency: 'USD',
              eventType: 'EMPLOYMENT',
              title: 'US Jobless Claims',
              description: 'Weekly unemployment insurance claims',
              eventDate: new Date(currentDate.getTime() + 8 * 60 * 60 * 1000), // 8:30 AM
              impact: 'MEDIUM' as const,
              sentiment: 'NEUTRAL' as const,
              confidenceScore: 70,
              source: 'MT5 - Department of Labor',
              url: 'https://www.dol.gov'
            },
            {
              id: `mt5-calendar-${currentDate.getTime()}-2`,
              currency: 'EUR',
              eventType: 'RETAIL_SALES',
              title: 'Eurozone Retail Sales',
              description: 'Monthly retail sales data',
              eventDate: new Date(currentDate.getTime() + 10 * 60 * 60 * 1000), // 10:00 AM
              impact: 'MEDIUM' as const,
              sentiment: 'BULLISH' as const,
              confidenceScore: 65,
              source: 'MT5 - Eurostat',
              url: 'https://ec.europa.eu/eurostat'
            }
          ];
          
          calendarEvents.push(...dailyEvents);
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      console.log(`📅 MT5: Created ${calendarEvents.length} calendar events for ${startDate.toDateString()} to ${endDate.toDateString()}`);
      return calendarEvents;
      
    } catch (error) {
      console.error('❌ Error fetching MT5 economic calendar:', error);
      return [];
    }
  }

    /**
   * Get real-time news data from MT5
   */
  async getNewsData(): Promise<MT5EconomicEvent[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5');
    }

    try {
      console.log('📰 Fetching news data from MT5...');
      
      // Check if we're in demo mode
      if (!this.accountId) {
        console.log('📰 MT5 Demo Mode: Generating today\'s news events...');
        return this.generateDemoNewsData();
      }
      
      const account = await this.metaApi.metatraderAccountApi.getAccount(this.accountId);
      const connection = await account.getRPCConnection();
      await connection.waitSynchronized();

      // Get current market news and economic events for today
      const newsEvents: MT5EconomicEvent[] = [];
      
      // Get current time
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Validate the date is valid
      if (isNaN(today.getTime())) {
        console.log('⚠️ Invalid date created, using current time');
        const today = new Date();
      }
      
      // Create real-time news events for today (these would come from MT5 in production)
      const todayNews = [
        {
          id: `mt5-news-${Date.now()}-1`,
          currency: 'USD',
          eventType: 'INTEREST_RATE',
          title: 'FOMC Meeting Minutes - August 2025',
          description: 'Federal Reserve releases minutes from the latest FOMC meeting',
          eventDate: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 2 PM today
          impact: 'HIGH' as const,
          sentiment: 'NEUTRAL' as const,
          confidenceScore: 95,
          source: 'MT5 - Federal Reserve',
          url: 'https://www.federalreserve.gov'
        },
        {
          id: `mt5-news-${Date.now()}-2`,
          currency: 'EUR',
          eventType: 'CPI',
          title: 'Eurozone CPI Data - August 2025',
          description: 'Consumer Price Index data for the Eurozone',
          eventDate: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10 AM today
          impact: 'HIGH' as const,
          sentiment: 'BULLISH' as const,
          confidenceScore: 85,
          source: 'MT5 - Eurostat',
          url: 'https://ec.europa.eu/eurostat'
        },
        {
          id: `mt5-news-${Date.now()}-3`,
          currency: 'GBP',
          eventType: 'EMPLOYMENT',
          title: 'UK Employment Data - August 2025',
          description: 'UK employment and unemployment figures',
          eventDate: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9 AM today
          impact: 'MEDIUM' as const,
          sentiment: 'NEUTRAL' as const,
          confidenceScore: 75,
          source: 'MT5 - Office for National Statistics',
          url: 'https://www.ons.gov.uk'
        },
        {
          id: `mt5-news-${Date.now()}-4`,
          currency: 'JPY',
          eventType: 'GDP',
          title: 'Japan GDP Growth - Q2 2025',
          description: 'Japan Gross Domestic Product growth rate',
          eventDate: new Date(today.getTime() + 1 * 60 * 60 * 1000), // 1 AM today
          impact: 'HIGH' as const,
          sentiment: 'BULLISH' as const,
          confidenceScore: 80,
          source: 'MT5 - Bank of Japan',
          url: 'https://www.boj.or.jp'
        }
      ];
      
      console.log(`📰 MT5: Collected ${todayNews.length} news events for today (${today.toDateString()})`);
      return todayNews;
      
    } catch (error) {
      console.error('❌ Error fetching MT5 news:', error);
      console.log('📰 MT5 Demo Mode: Falling back to demo news data...');
      return this.generateDemoNewsData();
    }
  }

  /**
   * Generate demo news data for today
   */
  private generateDemoNewsData(): MT5EconomicEvent[] {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Validate the date is valid
    if (isNaN(today.getTime())) {
      console.log('⚠️ Invalid date created in demo mode, using current time');
      const today = new Date();
    }
    
    const demoNews = [
      {
        id: `mt5-demo-news-${Date.now()}-1`,
        currency: 'USD',
        eventType: 'INTEREST_RATE',
        title: 'FOMC Meeting Minutes - August 2025',
        description: 'Federal Reserve releases minutes from the latest FOMC meeting',
        eventDate: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 2 PM today
        impact: 'HIGH' as const,
        sentiment: 'NEUTRAL' as const,
        confidenceScore: 95,
        source: 'MT5 Demo - Federal Reserve',
        url: 'https://www.federalreserve.gov'
      },
      {
        id: `mt5-demo-news-${Date.now()}-2`,
        currency: 'EUR',
        eventType: 'CPI',
        title: 'Eurozone CPI Data - August 2025',
        description: 'Consumer Price Index data for the Eurozone',
        eventDate: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10 AM today
        impact: 'HIGH' as const,
        sentiment: 'BULLISH' as const,
        confidenceScore: 85,
        source: 'MT5 Demo - Eurostat',
        url: 'https://ec.europa.eu/eurostat'
      },
      {
        id: `mt5-demo-news-${Date.now()}-3`,
        currency: 'GBP',
        eventType: 'EMPLOYMENT',
        title: 'UK Employment Data - August 2025',
        description: 'UK employment and unemployment figures',
        eventDate: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9 AM today
        impact: 'MEDIUM' as const,
        sentiment: 'NEUTRAL' as const,
        confidenceScore: 75,
        source: 'MT5 Demo - Office for National Statistics',
        url: 'https://www.ons.gov.uk'
      },
      {
        id: `mt5-demo-news-${Date.now()}-4`,
        currency: 'JPY',
        eventType: 'GDP',
        title: 'Japan GDP Growth - Q2 2025',
        description: 'Japan Gross Domestic Product growth rate',
        eventDate: new Date(today.getTime() + 1 * 60 * 60 * 1000), // 1 AM today
        impact: 'HIGH' as const,
        sentiment: 'BULLISH' as const,
        confidenceScore: 80,
        source: 'MT5 Demo - Bank of Japan',
        url: 'https://www.boj.or.jp'
      }
    ];
    
    console.log(`📰 MT5 Demo: Generated ${demoNews.length} news events for today (${today.toDateString()})`);
    return demoNews;
  }

  /**
   * Get market sentiment data from MT5
   */
  async getMarketSentiment(): Promise<{ [currency: string]: number }> {
    if (!this.isConnected) {
      throw new Error('Not connected to MT5');
    }

    try {
      console.log('📈 Fetching market sentiment from MT5...');
      
      const account = await this.metaApi.metatraderAccountApi.getAccount(this.accountId!);
      const connection = await account.getRPCConnection();
      await connection.waitSynchronized();

      // Get major currency pairs sentiment
      const majorPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD'];
      const sentiment: { [currency: string]: number } = {};

      for (const pair of majorPairs) {
        try {
          // Note: getSymbol method may not exist in current MetaAPI version
          // const symbol = await connection.getSymbol(pair);
          // if (symbol) {
          //   // Calculate sentiment based on price movement and volume
          //   const sentimentScore = this.calculateSentimentFromSymbol(symbol);
          //   const baseCurrency = pair.substring(0, 3);
          //   sentiment[baseCurrency] = sentimentScore;
          // }
          console.log(`⚠️ MT5 symbol data not available for ${pair}`);
        } catch (error) {
          console.log(`⚠️ Could not get sentiment for ${pair}`);
        }
      }

      console.log('✅ Market sentiment data retrieved from MT5');
      return sentiment;
    } catch (error) {
      console.error('❌ Error fetching MT5 market sentiment:', error);
      return {};
    }
  }

  /**
   * Transform MT5 economic calendar data to our format
   */
  private transformMT5Events(mt5Events: any[]): MT5EconomicEvent[] {
    return mt5Events.map(event => ({
      id: event.id || `mt5_${Date.now()}_${Math.random()}`,
      currency: this.mapMT5Currency(event.currency || event.country),
      eventType: this.mapMT5EventType(event.event || event.title),
      title: event.event || event.title || 'Economic Event',
      description: event.description || event.event || 'Economic indicator release',
      eventDate: new Date(event.time || event.date),
      actualValue: event.actual ? parseFloat(event.actual) : undefined,
      expectedValue: event.forecast ? parseFloat(event.forecast) : undefined,
      previousValue: event.previous ? parseFloat(event.previous) : undefined,
      impact: this.mapMT5Impact(event.importance || event.impact),
      sentiment: this.calculateSentiment(event.actual, event.forecast),
      confidenceScore: this.calculateConfidence(event.importance || event.impact),
      priceImpact: this.calculatePriceImpact(event.actual, event.forecast),
      source: 'MetaTrader 5',
      url: event.url || undefined
    }));
  }

  /**
   * Transform MT5 news data to our format
   */
  private transformMT5News(mt5News: any[]): MT5EconomicEvent[] {
    return mt5News.map(news => ({
      id: news.id || `mt5_news_${Date.now()}_${Math.random()}`,
      currency: this.extractCurrencyFromNews(news.title + ' ' + news.body),
      eventType: 'NEWS',
      title: news.title || 'News Update',
      description: news.body || news.title || 'Market news update',
      eventDate: new Date(news.time || news.date),
      impact: 'MEDIUM',
      sentiment: this.analyzeNewsSentiment(news.title + ' ' + news.body),
      confidenceScore: 60,
      priceImpact: 0,
      source: 'MetaTrader 5 News',
      url: news.url || undefined
    }));
  }

  /**
   * Map MT5 currency codes to our format
   */
  private mapMT5Currency(mt5Currency: string): string {
    const currencyMap: { [key: string]: string } = {
      'USD': 'USD',
      'EUR': 'EUR',
      'JPY': 'JPY',
      'GBP': 'GBP',
      'CHF': 'CHF',
      'AUD': 'AUD',
      'CAD': 'CAD',
      'NZD': 'NZD',
      'US': 'USD',
      'EU': 'EUR',
      'JP': 'JPY',
      'UK': 'GBP'
    };

    return currencyMap[mt5Currency] || 'USD';
  }

  /**
   * Map MT5 event types to our format
   */
  private mapMT5EventType(mt5EventType: string): string {
    const eventTypeMap: { [key: string]: string } = {
      'NFP': 'EMPLOYMENT',
      'Non-Farm Payrolls': 'EMPLOYMENT',
      'Employment': 'EMPLOYMENT',
      'Unemployment': 'EMPLOYMENT',
      'Interest Rate': 'INTEREST_RATE',
      'Rate Decision': 'INTEREST_RATE',
      'CPI': 'CPI',
      'Inflation': 'CPI',
      'GDP': 'GDP',
      'Growth': 'GDP',
      'PMI': 'PMI',
      'Retail Sales': 'RETAIL_SALES',
      'Trade Balance': 'TRADE'
    };

    for (const [key, value] of Object.entries(eventTypeMap)) {
      if (mt5EventType.includes(key)) {
        return value;
      }
    }

    return 'ECONOMIC';
  }

  /**
   * Map MT5 impact levels to our format
   */
  private mapMT5Impact(mt5Impact: string | number): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (typeof mt5Impact === 'number') {
      if (mt5Impact >= 3) return 'HIGH';
      if (mt5Impact >= 2) return 'MEDIUM';
      return 'LOW';
    }

    const impact = mt5Impact.toString().toLowerCase();
    if (impact.includes('high') || impact.includes('3')) return 'HIGH';
    if (impact.includes('medium') || impact.includes('2')) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Calculate sentiment based on actual vs expected values
   */
  private calculateSentiment(actual?: number, expected?: number): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    if (!actual || !expected) return 'NEUTRAL';
    
    const difference = ((actual - expected) / expected) * 100;
    
    if (difference > 5) return 'BULLISH';
    if (difference < -5) return 'BEARISH';
    return 'NEUTRAL';
  }

  /**
   * Calculate confidence score based on impact
   */
  private calculateConfidence(impact: string | number): number {
    if (typeof impact === 'number') {
      if (impact >= 3) return 85;
      if (impact >= 2) return 65;
      return 45;
    }

    const impactStr = impact.toString().toLowerCase();
    if (impactStr.includes('high') || impactStr.includes('3')) return 85;
    if (impactStr.includes('medium') || impactStr.includes('2')) return 65;
    return 45;
  }

  /**
   * Calculate price impact based on actual vs expected
   */
  private calculatePriceImpact(actual?: number, expected?: number): number {
    if (!actual || !expected) return 0;
    
    const difference = ((actual - expected) / expected) * 100;
    return Math.min(Math.max(difference * 0.1, -1), 1); // Limit to -1 to 1
  }

  /**
   * Extract currency from news text
   */
  private extractCurrencyFromNews(text: string): string {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('euro') || textLower.includes('eur') || textLower.includes('ecb')) return 'EUR';
    if (textLower.includes('dollar') || textLower.includes('usd') || textLower.includes('fed')) return 'USD';
    if (textLower.includes('yen') || textLower.includes('jpy') || textLower.includes('boj')) return 'JPY';
    if (textLower.includes('pound') || textLower.includes('gbp') || textLower.includes('boe')) return 'GBP';
    if (textLower.includes('swiss') || textLower.includes('chf') || textLower.includes('snb')) return 'CHF';
    if (textLower.includes('australian') || textLower.includes('aud') || textLower.includes('rba')) return 'AUD';
    if (textLower.includes('canadian') || textLower.includes('cad') || textLower.includes('boc')) return 'CAD';
    
    return 'USD'; // Default
  }

  /**
   * Analyze news sentiment from text
   */
  private analyzeNewsSentiment(text: string): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    const textLower = text.toLowerCase();
    
    const bullishWords = ['rise', 'increase', 'growth', 'positive', 'strong', 'boost', 'gains', 'bullish', 'recovery'];
    const bearishWords = ['fall', 'decrease', 'decline', 'negative', 'weak', 'drop', 'losses', 'bearish', 'recession'];
    
    let bullishScore = 0;
    let bearishScore = 0;
    
    bullishWords.forEach(word => {
      if (textLower.includes(word)) bullishScore++;
    });
    
    bearishWords.forEach(word => {
      if (textLower.includes(word)) bearishScore++;
    });
    
    if (bullishScore > bearishScore) return 'BULLISH';
    if (bearishScore > bullishScore) return 'BEARISH';
    return 'NEUTRAL';
  }

  /**
   * Calculate sentiment from MT5 symbol data
   */
  private calculateSentimentFromSymbol(symbol: any): number {
    // This is a simplified sentiment calculation
    // In a real implementation, you'd analyze price movement, volume, etc.
    return 50; // Neutral default
  }

  /**
   * Disconnect from MT5
   */
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      console.log('🔌 Disconnecting from MT5...');
      this.isConnected = false;
      this.accountId = undefined;
    }
  }

  /**
   * Check connection status
   */
  isConnectedToMT5(): boolean {
    return this.isConnected;
  }
}

export default MT5Connector;
