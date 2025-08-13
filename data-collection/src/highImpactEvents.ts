import axios from 'axios';
import { EconomicEvent } from './dataSources';

/**
 * High-Impact Economic Events Configuration
 * These are the events that move markets the most
 */

export interface HighImpactEventConfig {
  name: string;
  currency: 'EUR' | 'USD' | 'JPY' | 'GBP' | 'CAD';
  frequency: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  sources: string[];
}

// Critical economic events that we must capture
export const HIGH_IMPACT_EVENTS: HighImpactEventConfig[] = [
  // USD Events (Highest Priority)
  {
    name: 'Non-Farm Payrolls (NFP)',
    currency: 'USD',
    frequency: 'First Friday of month',
    impact: 'HIGH',
    description: 'Monthly change in employment excluding farming sector',
    sources: ['BLS', 'FRED', 'Trading Economics']
  },
  {
    name: 'Federal Funds Rate Decision',
    currency: 'USD',
    frequency: '8 times per year',
    impact: 'HIGH',
    description: 'Federal Reserve interest rate policy decision',
    sources: ['Federal Reserve', 'FRED', 'Alpha Vantage']
  },
  {
    name: 'CPI (Consumer Price Index)',
    currency: 'USD',
    frequency: 'Monthly',
    impact: 'HIGH',
    description: 'Inflation measure - core and headline',
    sources: ['BLS', 'FRED', 'Trading Economics']
  },
  {
    name: 'GDP Growth Rate',
    currency: 'USD',
    frequency: 'Quarterly',
    impact: 'HIGH',
    description: 'Gross Domestic Product growth rate',
    sources: ['BEA', 'FRED', 'Alpha Vantage']
  },
  {
    name: 'Unemployment Rate',
    currency: 'USD',
    frequency: 'Monthly',
    impact: 'HIGH',
    description: 'Percentage of unemployed labor force',
    sources: ['BLS', 'FRED']
  },
  {
    name: 'ISM Manufacturing PMI',
    currency: 'USD',
    frequency: 'Monthly',
    impact: 'HIGH',
    description: 'Manufacturing sector purchasing managers index',
    sources: ['ISM', 'Trading Economics']
  },
  {
    name: 'Retail Sales',
    currency: 'USD',
    frequency: 'Monthly',
    impact: 'MEDIUM',
    description: 'Consumer spending on retail goods',
    sources: ['Census Bureau', 'FRED']
  },

  // EUR Events
  {
    name: 'ECB Interest Rate Decision',
    currency: 'EUR',
    frequency: '8 times per year',
    impact: 'HIGH',
    description: 'European Central Bank monetary policy decision',
    sources: ['ECB', 'Trading Economics']
  },
  {
    name: 'Eurozone CPI',
    currency: 'EUR',
    frequency: 'Monthly',
    impact: 'HIGH',
    description: 'Eurozone inflation rate',
    sources: ['Eurostat', 'Trading Economics']
  },
  {
    name: 'Eurozone GDP',
    currency: 'EUR',
    frequency: 'Quarterly',
    impact: 'HIGH',
    description: 'Eurozone economic growth rate',
    sources: ['Eurostat', 'Trading Economics']
  },
  {
    name: 'German IFO Business Climate',
    currency: 'EUR',
    frequency: 'Monthly',
    impact: 'HIGH',
    description: 'German business confidence indicator',
    sources: ['IFO Institute', 'Trading Economics']
  },

  // GBP Events
  {
    name: 'BOE Interest Rate Decision',
    currency: 'GBP',
    frequency: '8 times per year',
    impact: 'HIGH',
    description: 'Bank of England monetary policy decision',
    sources: ['Bank of England', 'Trading Economics']
  },
  {
    name: 'UK CPI',
    currency: 'GBP',
    frequency: 'Monthly',
    impact: 'HIGH',
    description: 'UK inflation rate',
    sources: ['ONS', 'Trading Economics']
  },
  {
    name: 'UK Employment Change',
    currency: 'GBP',
    frequency: 'Monthly',
    impact: 'HIGH',
    description: 'Change in number of employed people',
    sources: ['ONS', 'Trading Economics']
  },
  {
    name: 'UK GDP',
    currency: 'GBP',
    frequency: 'Quarterly',
    impact: 'HIGH',
    description: 'UK economic growth rate',
    sources: ['ONS', 'Trading Economics']
  },

  // JPY Events
  {
    name: 'BOJ Interest Rate Decision',
    currency: 'JPY',
    frequency: '8 times per year',
    impact: 'HIGH',
    description: 'Bank of Japan monetary policy decision',
    sources: ['Bank of Japan', 'Trading Economics']
  },
  {
    name: 'Japan CPI',
    currency: 'JPY',
    frequency: 'Monthly',
    impact: 'HIGH',
    description: 'Japan inflation rate',
    sources: ['Statistics Bureau', 'Trading Economics']
  },
  {
    name: 'Japan GDP',
    currency: 'JPY',
    frequency: 'Quarterly',
    impact: 'HIGH',
    description: 'Japan economic growth rate',
    sources: ['Cabinet Office', 'Trading Economics']
  },
  {
    name: 'Tankan Survey',
    currency: 'JPY',
    frequency: 'Quarterly',
    impact: 'HIGH',
    description: 'Bank of Japan business sentiment survey',
    sources: ['Bank of Japan', 'Trading Economics']
  },

  // CAD Events (Critical Addition!)
  {
    name: 'BOC Interest Rate Decision',
    currency: 'CAD',
    frequency: '8 times per year',
    impact: 'HIGH',
    description: 'Bank of Canada monetary policy decision',
    sources: ['Bank of Canada', 'Trading Economics']
  },
  {
    name: 'Canada CPI',
    currency: 'CAD',
    frequency: 'Monthly',
    impact: 'HIGH',
    description: 'Canadian inflation rate',
    sources: ['Statistics Canada', 'Trading Economics']
  },
  {
    name: 'Canada Employment Change',
    currency: 'CAD',
    frequency: 'Monthly',
    impact: 'HIGH',
    description: 'Change in number of employed people in Canada',
    sources: ['Statistics Canada', 'Trading Economics']
  },
  {
    name: 'Canada GDP',
    currency: 'CAD',
    frequency: 'Monthly',
    impact: 'HIGH',
    description: 'Canadian economic growth rate',
    sources: ['Statistics Canada', 'Trading Economics']
  },
  {
    name: 'BOC Monetary Policy Report',
    currency: 'CAD',
    frequency: 'Quarterly',
    impact: 'HIGH',
    description: 'Bank of Canada economic outlook and policy assessment',
    sources: ['Bank of Canada', 'Trading Economics']
  },
  {
    name: 'Canada Trade Balance',
    currency: 'CAD',
    frequency: 'Monthly',
    impact: 'MEDIUM',
    description: 'Canadian exports minus imports (commodity-sensitive)',
    sources: ['Statistics Canada', 'Trading Economics']
  }
];

/**
 * Enhanced Economic Calendar Data Source
 * Specifically targets high-impact forex events
 */
export async function fetchHighImpactEvents(): Promise<EconomicEvent[]> {
  const events: EconomicEvent[] = [];
  
  try {
    // Method 1: Trading Economics API (if available)
    if (process.env.TRADING_ECONOMICS_API_KEY) {
      const tradingEconomicsEvents = await fetchTradingEconomicsEvents();
      events.push(...tradingEconomicsEvents);
    }
    
    // Method 2: Economic Calendar APIs
    const calendarEvents = await fetchEconomicCalendarEvents();
    events.push(...calendarEvents);
    
    // Method 3: FRED API for US high-impact data
    const fredEvents = await fetchFREDHighImpactData();
    events.push(...fredEvents);
    
    // Method 4: Generate realistic demo events if no real data
    if (events.length === 0) {
      const demoEvents = generateHighImpactDemoEvents();
      events.push(...demoEvents);
    }
    
    console.log(`📊 Fetched ${events.length} high-impact economic events`);
    return events;
    
  } catch (error) {
    console.error('Error fetching high-impact events:', error);
    return generateHighImpactDemoEvents();
  }
}

/**
 * Trading Economics API - Premium but comprehensive
 */
async function fetchTradingEconomicsEvents(): Promise<EconomicEvent[]> {
  const events: EconomicEvent[] = [];
  
  try {
    const apiKey = process.env.TRADING_ECONOMICS_API_KEY;
    const countries = ['united-states', 'euro-area', 'japan', 'united-kingdom'];
    
    for (const country of countries) {
      const response = await axios.get(`https://api.tradingeconomics.com/calendar/country/${country}`, {
        params: {
          key: apiKey,
          format: 'json'
        },
        timeout: 10000
      });
      
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((item: any) => {
          const currency = mapCountryToCurrency(item.Country || country);
          if (isHighImpactEvent(item.Event)) {
            events.push({
              currency,
              eventType: classifyEventType(item.Event),
              title: item.Event,
              description: item.Event,
              eventDate: new Date(item.Date),
              actualValue: parseFloat(item.Actual) || undefined,
              expectedValue: parseFloat(item.Forecast) || undefined,
              previousValue: parseFloat(item.Previous) || undefined,
              impact: mapImportanceToImpact(item.Importance),
              sentiment: calculateSentimentFromValues(item.Actual, item.Forecast, item.Previous),
              confidenceScore: calculateConfidenceFromImportance(item.Importance),
              priceImpact: estimatePriceImpact(item.Event, item.Actual, item.Forecast),
              source: 'Trading Economics'
            });
          }
        });
      }
    }
  } catch (error) {
    console.log('Trading Economics API not available or error occurred');
  }
  
  return events;
}

/**
 * Economic Calendar APIs (Free alternatives)
 */
async function fetchEconomicCalendarEvents(): Promise<EconomicEvent[]> {
  const events: EconomicEvent[] = [];
  
  try {
    // Forex Factory Calendar
    const forexFactoryResponse = await axios.get('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (forexFactoryResponse.data && Array.isArray(forexFactoryResponse.data)) {
      forexFactoryResponse.data.forEach((item: any) => {
        if (item.impact === 'high' && isHighImpactEvent(item.title)) {
          const currency = mapCountryToCurrency(item.country);
          events.push({
            currency,
            eventType: classifyEventType(item.title),
            title: item.title,
            description: item.title,
            eventDate: new Date(item.date),
            impact: 'HIGH',
            sentiment: 'NEUTRAL',
            confidenceScore: 75,
            source: 'Forex Factory'
          });
        }
      });
    }
  } catch (error) {
    console.log('Forex Factory API not available');
  }
  
  return events;
}

/**
 * FRED API for US economic data
 */
async function fetchFREDHighImpactData(): Promise<EconomicEvent[]> {
  const events: EconomicEvent[] = [];
  
  try {
    const apiKey = process.env.FRED_API_KEY;
    if (!apiKey || apiKey === 'demo') return [];
    
    // High-impact FRED series
    const series = [
      { id: 'PAYEMS', name: 'Non-Farm Payrolls' },
      { id: 'UNRATE', name: 'Unemployment Rate' },
      { id: 'CPIAUCSL', name: 'Consumer Price Index' },
      { id: 'GDP', name: 'Gross Domestic Product' },
      { id: 'RRSFS', name: 'Retail Sales' }
    ];
    
    for (const seriesInfo of series) {
      const response = await axios.get('https://api.stlouisfed.org/fred/series/observations', {
        params: {
          series_id: seriesInfo.id,
          api_key: apiKey,
          file_type: 'json',
          limit: 3,
          sort_order: 'desc'
        },
        timeout: 10000
      });
      
      if (response.data && response.data.observations) {
        response.data.observations.forEach((obs: any, index: number) => {
          if (obs.value !== '.' && index === 0) { // Latest value only
            events.push({
              currency: 'USD',
              eventType: classifyEventType(seriesInfo.name),
              title: `${seriesInfo.name} Release`,
              description: `Latest ${seriesInfo.name} data from Federal Reserve`,
              eventDate: new Date(obs.date),
              actualValue: parseFloat(obs.value),
              impact: 'HIGH',
              sentiment: 'NEUTRAL',
              confidenceScore: 90,
              source: 'Federal Reserve Economic Data'
            });
          }
        });
      }
    }
  } catch (error) {
    console.log('FRED API not available or error occurred');
  }
  
  return events;
}

/**
 * Generate realistic demo events for high-impact indicators
 */
function generateHighImpactDemoEvents(): EconomicEvent[] {
  const now = new Date();
  const events: EconomicEvent[] = [];
  
  // Generate NFP data (most important for USD)
  events.push({
    currency: 'USD',
    eventType: 'EMPLOYMENT',
    title: 'Non-Farm Payrolls (NFP)',
    description: 'Monthly change in employment excluding farming sector',
    eventDate: new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000), // Within 24h
    actualValue: 180000 + Math.random() * 100000,
    expectedValue: 200000,
    previousValue: 220000,
    impact: 'HIGH',
    sentiment: Math.random() > 0.5 ? 'BEARISH' : 'BULLISH',
    confidenceScore: 85 + Math.random() * 10,
    priceImpact: (Math.random() - 0.5) * 2,
    source: 'Demo High-Impact Source'
  });
  
  // Generate Fed Rate Decision
  events.push({
    currency: 'USD',
    eventType: 'INTEREST_RATE',
    title: 'Federal Funds Rate Decision',
    description: 'Federal Reserve interest rate policy decision',
    eventDate: new Date(now.getTime() - Math.random() * 48 * 60 * 60 * 1000), // Within 48h
    actualValue: 5.25,
    expectedValue: 5.25,
    previousValue: 5.50,
    impact: 'HIGH',
    sentiment: 'NEUTRAL',
    confidenceScore: 95,
    priceImpact: 0,
    source: 'Demo High-Impact Source'
  });
  
  // Generate UK Employment Data
  events.push({
    currency: 'GBP',
    eventType: 'EMPLOYMENT',
    title: 'UK Employment Change',
    description: 'Change in number of employed people in the UK',
    eventDate: new Date(now.getTime() - Math.random() * 36 * 60 * 60 * 1000),
    actualValue: 15000 + Math.random() * 50000,
    expectedValue: 25000,
    previousValue: 30000,
    impact: 'HIGH',
    sentiment: 'BULLISH',
    confidenceScore: 78,
    priceImpact: 0.3,
    source: 'Demo High-Impact Source'
  });
  
  // Generate ECB Rate Decision
  events.push({
    currency: 'EUR',
    eventType: 'INTEREST_RATE',
    title: 'ECB Interest Rate Decision',
    description: 'European Central Bank monetary policy decision',
    eventDate: new Date(now.getTime() - Math.random() * 72 * 60 * 60 * 1000),
    actualValue: 4.0,
    expectedValue: 4.25,
    previousValue: 4.25,
    impact: 'HIGH',
    sentiment: 'BEARISH',
    confidenceScore: 88,
    priceImpact: -0.6,
    source: 'Demo High-Impact Source'
  });
  
  // Generate BOJ Decision
  events.push({
    currency: 'JPY',
    eventType: 'INTEREST_RATE',
    title: 'BOJ Interest Rate Decision',
    description: 'Bank of Japan monetary policy decision',
    eventDate: new Date(now.getTime() - Math.random() * 48 * 60 * 60 * 1000),
    actualValue: -0.1,
    expectedValue: -0.1,
    previousValue: -0.1,
    impact: 'HIGH',
    sentiment: 'NEUTRAL',
    confidenceScore: 70,
    priceImpact: 0,
    source: 'Demo High-Impact Source'
  });
  
  return events;
}

// Helper functions
function mapCountryToCurrency(country: string): 'EUR' | 'USD' | 'JPY' | 'GBP' | 'CAD' {
  const mapping: Record<string, 'EUR' | 'USD' | 'JPY' | 'GBP' | 'CAD'> = {
    'united-states': 'USD',
    'USA': 'USD',
    'US': 'USD',
    'euro-area': 'EUR',
    'eurozone': 'EUR',
    'EUR': 'EUR',
    'germany': 'EUR',
    'france': 'EUR',
    'japan': 'JPY',
    'JPY': 'JPY',
    'united-kingdom': 'GBP',
    'UK': 'GBP',
    'GBP': 'GBP',
    'canada': 'CAD',
    'CA': 'CAD',
    'CAD': 'CAD'
  };
  
  return mapping[country.toLowerCase()] || 'USD';
}

function isHighImpactEvent(eventName: string): boolean {
  const highImpactKeywords = [
    'payroll', 'nfp', 'employment', 'unemployment',
    'interest rate', 'fed funds', 'federal reserve',
    'cpi', 'inflation', 'price index',
    'gdp', 'gross domestic',
    'pmi', 'manufacturing',
    'retail sales',
    'ecb', 'boe', 'boj',
    'central bank'
  ];
  
  const eventLower = eventName.toLowerCase();
  return highImpactKeywords.some(keyword => eventLower.includes(keyword));
}

function classifyEventType(eventName: string): string {
  const eventLower = eventName.toLowerCase();
  
  if (eventLower.includes('payroll') || eventLower.includes('employment') || eventLower.includes('unemployment')) {
    return 'EMPLOYMENT';
  }
  if (eventLower.includes('interest rate') || eventLower.includes('fed funds') || eventLower.includes('central bank')) {
    return 'INTEREST_RATE';
  }
  if (eventLower.includes('cpi') || eventLower.includes('inflation') || eventLower.includes('price index')) {
    return 'CPI';
  }
  if (eventLower.includes('gdp') || eventLower.includes('gross domestic')) {
    return 'GDP';
  }
  if (eventLower.includes('retail sales')) {
    return 'RETAIL_SALES';
  }
  if (eventLower.includes('pmi') || eventLower.includes('manufacturing')) {
    return 'PMI';
  }
  
  return 'ECONOMIC';
}

function mapImportanceToImpact(importance: string | number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (typeof importance === 'string') {
    if (importance.toLowerCase() === 'high' || importance === '3') return 'HIGH';
    if (importance.toLowerCase() === 'medium' || importance === '2') return 'MEDIUM';
  }
  if (typeof importance === 'number') {
    if (importance >= 3) return 'HIGH';
    if (importance >= 2) return 'MEDIUM';
  }
  return 'LOW';
}

function calculateSentimentFromValues(actual?: number, forecast?: number, previous?: number): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
  if (!actual || (!forecast && !previous)) return 'NEUTRAL';
  
  const comparison = forecast || previous;
  if (!comparison) return 'NEUTRAL';
  
  const difference = ((actual - comparison) / comparison) * 100;
  
  if (difference > 5) return 'BULLISH';
  if (difference < -5) return 'BEARISH';
  return 'NEUTRAL';
}

function calculateConfidenceFromImportance(importance: string | number): number {
  if (typeof importance === 'string') {
    if (importance.toLowerCase() === 'high' || importance === '3') return 85 + Math.random() * 10;
    if (importance.toLowerCase() === 'medium' || importance === '2') return 65 + Math.random() * 15;
  }
  if (typeof importance === 'number') {
    if (importance >= 3) return 85 + Math.random() * 10;
    if (importance >= 2) return 65 + Math.random() * 15;
  }
  return 45 + Math.random() * 15;
}

function estimatePriceImpact(eventName: string, actual?: number, forecast?: number): number {
  if (!actual || !forecast) return Math.random() * 0.5 - 0.25;
  
  const difference = ((actual - forecast) / forecast) * 100;
  
  // High-impact events have larger price movements
  if (isHighImpactEvent(eventName)) {
    return (difference / 100) * 2; // Scale to reasonable price impact
  }
  
  return (difference / 100) * 0.5;
}
