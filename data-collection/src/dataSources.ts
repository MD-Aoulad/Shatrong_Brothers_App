import axios from 'axios';

// Data source configurations
export interface DataSource {
  name: string;
  url: string;
  apiKey?: string;
  headers?: Record<string, string>;
  transformFunction: (data: any) => EconomicEvent[];
}

export interface EconomicEvent {
  currency: 'EUR' | 'USD' | 'JPY' | 'GBP' | 'CAD';
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

/**
 * Economic Calendar API (Free tier available)
 * Provides real economic events and indicators
 */
export const economicCalendarAPI: DataSource = {
  name: 'Economic Calendar API',
  url: 'https://api.tradingeconomics.com/calendar',
  headers: {
    'Content-Type': 'application/json',
  },
  transformFunction: (data: any[]): EconomicEvent[] => {
    return data.map(item => ({
      currency: mapCountryToCurrency(item.Country),
      eventType: item.Category || 'ECONOMIC',
      title: item.Event || 'Economic Event',
      description: item.Event || 'Economic indicator release',
      eventDate: new Date(item.Date),
      actualValue: parseFloat(item.Actual) || undefined,
      expectedValue: parseFloat(item.Forecast) || undefined,
      previousValue: parseFloat(item.Previous) || undefined,
      impact: mapImportance(item.Importance),
      sentiment: calculateSentiment(item.Actual, item.Forecast),
      confidenceScore: Math.round(calculateConfidence(item.Importance)),
      source: 'Trading Economics',
      url: `https://tradingeconomics.com/calendar`
    }));
  }
};

/**
 * Alpha Vantage API (Free tier: 5 calls/minute, 500 calls/day)
 * Provides economic indicators and news sentiment
 */
export const alphaVantageAPI: DataSource = {
  name: 'Alpha Vantage',
  url: 'https://www.alphavantage.co/query',
  transformFunction: (data: any): EconomicEvent[] => {
    // Transform Alpha Vantage economic indicators
    const events: EconomicEvent[] = [];
    
    if (data.data) {
      data.data.forEach((item: any) => {
        events.push({
          currency: 'USD', // Alpha Vantage primarily covers US data
          eventType: data.name || 'ECONOMIC',
          title: `${data.name} Release`,
          description: data.description || 'Economic indicator from Alpha Vantage',
          eventDate: new Date(item.date),
          actualValue: parseFloat(item.value) || undefined,
          impact: 'MEDIUM',
          sentiment: 'NEUTRAL',
          confidenceScore: Math.round(Number(60) || 50),
          source: 'Alpha Vantage'
        });
      });
    }
    
    return events;
  }
};

/**
 * Forex Factory API (Web scraping - free but rate limited)
 * Provides high-impact forex news and events
 */
export const forexFactoryAPI: DataSource = {
  name: 'Forex Factory',
  url: 'https://nfs.faireconomy.media/ff_calendar_thisweek.json',
  transformFunction: (data: any[]): EconomicEvent[] => {
    return data.map(item => ({
      currency: item.country as 'EUR' | 'USD' | 'JPY' | 'GBP',
      eventType: item.title.includes('Rate') ? 'INTEREST_RATE' : 
                 item.title.includes('GDP') ? 'GDP' :
                 item.title.includes('CPI') ? 'CPI' : 'ECONOMIC',
      title: item.title,
      description: item.title,
      eventDate: new Date(item.date),
      impact: mapForexFactoryImpact(item.impact),
      sentiment: 'NEUTRAL', // Will be calculated based on actual vs forecast
      confidenceScore: Math.round(50),
      source: 'Forex Factory'
    }));
  }
};

/**
 * Federal Reserve Economic Data (FRED) API
 * Free API from St. Louis Fed with extensive US economic data
 */
export const fredAPI: DataSource = {
  name: 'FRED API',
  url: 'https://api.stlouisfed.org/fred/series/observations',
  transformFunction: (data: any): EconomicEvent[] => {
    const events: EconomicEvent[] = [];
    
    if (data.observations) {
      data.observations.slice(-5).forEach((obs: any) => {
        if (obs.value !== '.') {
          events.push({
            currency: 'USD',
            eventType: 'ECONOMIC',
            title: `Economic Indicator Update`,
            description: `FRED economic data series update`,
            eventDate: new Date(obs.date),
            actualValue: parseFloat(obs.value),
            impact: 'MEDIUM',
            sentiment: 'NEUTRAL',
            confidenceScore: Math.round(70),
            source: 'Federal Reserve Economic Data'
          });
        }
      });
    }
    
    return events;
  }
};

/**
 * NewsAPI.org for financial news sentiment
 * Free tier: 1000 requests/month
 */
export const newsAPI: DataSource = {
  name: 'NewsAPI',
  url: 'https://newsapi.org/v2/everything',
  transformFunction: (data: any): EconomicEvent[] => {
    const events: EconomicEvent[] = [];
    
    if (data.articles) {
      data.articles.slice(0, 10).forEach((article: any) => {
        const currency = extractCurrencyFromText(article.title + ' ' + article.description);
        if (currency) {
          events.push({
            currency,
            eventType: 'NEWS',
            title: article.title,
            description: article.description || article.title,
            eventDate: new Date(article.publishedAt),
            impact: 'LOW',
            sentiment: analyzeSentimentFromText(article.title + ' ' + article.description),
            confidenceScore: Math.round(40),
            source: article.source.name,
            url: article.url
          });
        }
      });
    }
    
    return events;
  }
};

// Helper functions
function mapCountryToCurrency(country: string): 'EUR' | 'USD' | 'JPY' | 'GBP' {
  const countryMap: Record<string, 'EUR' | 'USD' | 'JPY' | 'GBP'> = {
    'United States': 'USD',
    'Euro Zone': 'EUR',
    'European Union': 'EUR',
    'Germany': 'EUR',
    'France': 'EUR',
    'Japan': 'JPY',
    'United Kingdom': 'GBP',
    'UK': 'GBP'
  };
  
  return countryMap[country] || 'USD';
}

function mapImportance(importance: string): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (importance === '3' || importance === 'High') return 'HIGH';
  if (importance === '2' || importance === 'Medium') return 'MEDIUM';
  return 'LOW';
}

function mapForexFactoryImpact(impact: string): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (impact === 'high') return 'HIGH';
  if (impact === 'medium') return 'MEDIUM';
  return 'LOW';
}

function calculateSentiment(actual?: number, forecast?: number): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
  if (!actual || !forecast) return 'NEUTRAL';
  
  const difference = ((actual - forecast) / forecast) * 100;
  
  if (difference > 10) return 'BULLISH';
  if (difference < -10) return 'BEARISH';
  return 'NEUTRAL';
}

function calculateConfidence(importance: string): number {
  if (importance === '3' || importance === 'High') return 85;
  if (importance === '2' || importance === 'Medium') return 65;
  return 45;
}

function extractCurrencyFromText(text: string): 'EUR' | 'USD' | 'JPY' | 'GBP' | null {
  text = text.toLowerCase();
  
  if (text.includes('euro') || text.includes('eur') || text.includes('ecb')) return 'EUR';
  if (text.includes('dollar') || text.includes('usd') || text.includes('fed')) return 'USD';
  if (text.includes('yen') || text.includes('jpy') || text.includes('boj')) return 'JPY';
  if (text.includes('pound') || text.includes('gbp') || text.includes('boe')) return 'GBP';
  
  return null;
}

function analyzeSentimentFromText(text: string): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
  text = text.toLowerCase();
  
  const bullishWords = ['rise', 'increase', 'growth', 'positive', 'strong', 'boost', 'gains'];
  const bearishWords = ['fall', 'decrease', 'decline', 'negative', 'weak', 'drop', 'losses'];
  
  let bullishScore = 0;
  let bearishScore = 0;
  
  bullishWords.forEach(word => {
    if (text.includes(word)) bullishScore++;
  });
  
  bearishWords.forEach(word => {
    if (text.includes(word)) bearishScore++;
  });
  
  if (bullishScore > bearishScore) return 'BULLISH';
  if (bearishScore > bullishScore) return 'BEARISH';
  return 'NEUTRAL';
}

// API Endpoints with different data sources
export const DATA_SOURCES = [
  economicCalendarAPI,
  alphaVantageAPI,
  forexFactoryAPI,
  fredAPI,
  newsAPI
];

// Fetch data from multiple sources
export async function fetchFromAllSources(): Promise<EconomicEvent[]> {
  const allEvents: EconomicEvent[] = [];
  
  for (const source of DATA_SOURCES) {
    try {
      console.log(`Fetching from ${source.name}...`);
      
      let url = source.url;
      let params: any = {};
      
      // Configure specific API calls
      if (source.name === 'Alpha Vantage') {
        params = {
          function: 'REAL_GDP',
          interval: 'quarterly',
          apikey: process.env.ALPHA_VANTAGE_API_KEY || 'demo'
        };
      } else if (source.name === 'FRED API') {
        params = {
          series_id: 'GDP',
          api_key: process.env.FRED_API_KEY || 'demo',
          file_type: 'json',
          limit: 5
        };
      } else if (source.name === 'NewsAPI') {
        params = {
          q: 'forex OR currency OR "central bank" OR inflation',
          sources: 'bloomberg,reuters,financial-times',
          sortBy: 'publishedAt',
          apiKey: process.env.NEWS_API_KEY || 'demo'
        };
      }
      
      const response = await axios.get(url, {
        params,
        headers: source.headers,
        timeout: 10000
      });
      
      const events = source.transformFunction(response.data);
      allEvents.push(...events);
      
      console.log(`✅ Fetched ${events.length} events from ${source.name}`);
      
    } catch (error: any) {
      console.error(`❌ Error fetching from ${source.name}:`, error.message);
      // Continue with other sources even if one fails
    }
  }
  
  return allEvents;
}

// Rate limiting helper
export function createRateLimiter(requestsPerMinute: number) {
  const requests: number[] = [];
  
  return async function rateLimitedFetch(fn: () => Promise<any>) {
    const now = Date.now();
    const minuteAgo = now - 60000;
    
    // Remove requests older than 1 minute
    while (requests.length > 0 && requests[0] < minuteAgo) {
      requests.shift();
    }
    
    // Check if we can make another request
    if (requests.length >= requestsPerMinute) {
      const waitTime = requests[0] + 60000 - now;
      console.log(`Rate limit reached. Waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    requests.push(now);
    return await fn();
  };
}
