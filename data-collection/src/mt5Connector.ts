import MetaApi from 'metaapi.cloud-sdk';
import { EconomicEvent } from './dataSources';

let connection: any = null;
let websocketClient: any = null;
let isConnected = false;

// Initialize MT5 connection using environment variables
export async function initializeMT5Connection(): Promise<boolean> {
  try {
    const token = process.env.METAAPI_TOKEN;
    const accountId = process.env.METAAPI_ACCOUNT_ID;
    
    if (!token || !accountId) {
      console.error('❌ MT5 API credentials required!');
      console.error('Please set METAAPI_TOKEN and METAAPI_ACCOUNT_ID in your .env file');
      console.error('Get them from: https://app.metaapi.cloud/');
      return false;
    }

    console.log('🔌 Connecting to MT5 via MetaAPI.cloud...');
    
    // Initialize MetaAPI connection
    const api = new MetaApi(token);
    const account = await api.metatraderAccountApi.getAccount(accountId);
    
    if (account.state !== 'DEPLOYED') {
      console.error('❌ MT5 account not deployed. Please check your account status.');
      return false;
    }

    // Wait for account to be ready
    await account.waitConnected();
    
    connection = account;
    isConnected = true;
    
    console.log('✅ Successfully connected to MT5!');
    console.log(`Account: ${account.id}`);
    console.log(`Server: ${account.version}`);
    console.log(`Status: ${account.state}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MT5:', error);
    console.error('Please check your API credentials and try again.');
    return false;
  }
}

export function isMT5Connected(): boolean {
  return isConnected && connection !== null;
}

// Get real historical prices from MT5
export async function getHistoricalPrices(
  symbol: string,
  startDate: Date,
  endDate: Date,
  timeframe: 'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4' | 'D1' = 'H1'
): Promise<any[]> {
  if (!isMT5Connected() || !connection) {
    throw new Error(`MT5 not connected. Cannot get historical data for ${symbol}. Please check your connection.`);
  }

  try {
    console.log(`📊 Fetching real MT5 data for ${symbol} from ${startDate} to ${endDate}`);
    
    // Convert timeframe to MT5 format
    const mt5Timeframe = timeframe === 'M1' ? '1m' : 
                        timeframe === 'M5' ? '5m' : 
                        timeframe === 'M15' ? '15m' : 
                        timeframe === 'M30' ? '30m' : 
                        timeframe === 'H1' ? '1h' : 
                        timeframe === 'H4' ? '4h' : '1d';
    
    // Get historical data from MT5
    const historicalData = await connection.getHistoricalPrices(symbol, mt5Timeframe, startDate, endDate);
    
    if (historicalData && historicalData.length > 0) {
      console.log(`✅ Got ${historicalData.length} real price bars for ${symbol}`);
      
      // Transform MT5 data to our format
      return historicalData.map((bar: any) => ({
        timestamp: new Date(bar.time),
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        volume: bar.tickVolume || 0,
        spread: bar.spread || 0
      }));
    } else {
      throw new Error(`No historical data found for ${symbol} in MT5.`);
    }
      } catch (error) {
      console.error(`❌ Error fetching MT5 historical data for ${symbol}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get historical data for ${symbol}: ${errorMessage}`);
    }
}

// Get real live prices from MT5
export async function getLivePrices(symbols: string[]): Promise<any[]> {
  if (!isMT5Connected() || !connection) {
    throw new Error('MT5 not connected. Cannot get live prices. Please check your connection.');
  }

  try {
    console.log(`📈 Fetching real live prices for: ${symbols.join(', ')}`);
    
    const livePrices = [];
    
    for (const symbol of symbols) {
      try {
        // Get current price from MT5
        const price = await connection.getSymbolPrice(symbol);
        
        if (price) {
          livePrices.push({
            symbol: symbol,
            bid: price.bid,
            ask: price.ask,
            spread: price.ask - price.bid,
            timestamp: new Date(),
            source: 'MT5'
          });
        }
      } catch (error) {
        console.error(`❌ Error getting live price for ${symbol}:`, error);
      }
    }
    
    if (livePrices.length > 0) {
      console.log(`✅ Got real live prices for ${livePrices.length} symbols`);
      return livePrices;
    } else {
      throw new Error('No live prices available from MT5.');
    }
      } catch (error) {
      console.error('❌ Error fetching MT5 live prices:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get live prices: ${errorMessage}`);
    }
}

// Get real economic calendar from MT5
export async function getEconomicCalendar(startDate: Date, endDate: Date): Promise<any[]> {
  if (!isMT5Connected() || !connection) {
    throw new Error('MT5 not connected. Cannot get economic calendar. Please check your connection.');
  }

  try {
    console.log('📅 Fetching real economic calendar from MT5...');
    
    // Note: MT5 doesn't directly provide economic calendar
    // We'll use external sources for real economic data
    const realEvents = await getRealEconomicEvents(startDate, endDate);
    
    if (realEvents && realEvents.length > 0) {
      console.log(`✅ Got ${realEvents.length} real economic events`);
      return realEvents;
    } else {
      throw new Error('No economic events available. Please check your data sources.');
    }
      } catch (error) {
      console.error('❌ Error fetching real economic calendar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get economic calendar: ${errorMessage}`);
    }
}

// Get real market sentiment from MT5
export async function getMarketSentiment(symbols: string[]): Promise<any[]> {
  if (!isMT5Connected() || !connection) {
    throw new Error('MT5 not connected. Cannot get market sentiment. Please check your connection.');
  }

  try {
    console.log(`🧠 Fetching real market sentiment for: ${symbols.join(', ')}`);
    
    // Calculate real sentiment based on price movements and volume
    const realSentiment = await calculateRealMarketSentiment(symbols);
    
    if (realSentiment && realSentiment.length > 0) {
      console.log(`✅ Calculated real sentiment for ${realSentiment.length} symbols`);
      return realSentiment;
    } else {
      throw new Error('No sentiment data available. Please check your connection.');
    }
      } catch (error) {
      console.error('❌ Error calculating real market sentiment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get market sentiment: ${errorMessage}`);
    }
}

// Get current trading session
export async function getCurrentSession(): Promise<any> {
  const now = new Date();
  const utcHour = now.getUTCHours();
  
  let session = 'CLOSED';
  let nextAnalysis = new Date();
  
  if (utcHour >= 0 && utcHour < 8) {
    session = 'ASIA';
    nextAnalysis = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 30, 0);
  } else if (utcHour >= 8 && utcHour < 16) {
    session = 'LONDON';
    nextAnalysis = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 30, 0);
  } else if (utcHour >= 16 && utcHour < 24) {
    session = 'NEW_YORK';
    nextAnalysis = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 30, 0);
  }
  
  return {
    current: session,
    nextAnalysis: nextAnalysis,
    countdown: getCountdown(nextAnalysis),
    status: session === 'CLOSED' ? 'CLOSED' : 'ACTIVE'
  };
}

// Helper function to get countdown
function getCountdown(targetDate: Date): string {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  
  if (diff <= 0) return '00:00:00';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Get real economic events from external sources
async function getRealEconomicEvents(startDate: Date, endDate: Date): Promise<any[]> {
  try {
    // TODO: Integrate with real economic data providers
    // For now, return empty array - user must provide real data
    console.warn('⚠️ No economic data provider configured. Please set up real economic data sources.');
    return [];
  } catch (error) {
    console.error('❌ Error fetching real economic events:', error);
    return [];
  }
}

// Calculate real market sentiment based on price data
async function calculateRealMarketSentiment(symbols: string[]): Promise<any[]> {
  try {
    const sentiment = [];
    
    for (const symbol of symbols) {
      // Get recent price data to calculate sentiment
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (24 * 60 * 60 * 1000)); // Last 24 hours
      
      const priceData = await getHistoricalPrices(symbol, startDate, endDate, 'H1');
      
      if (priceData && priceData.length > 0) {
        // Calculate sentiment based on price movement, volatility, and trend
        const sentimentScore = calculateSentimentFromPriceData(priceData);
        
        sentiment.push({
          symbol: symbol,
          score: sentimentScore,
          trend: sentimentScore > 15 ? 'BULLISH' : sentimentScore < 10 ? 'BEARISH' : 'NEUTRAL',
          strength: sentimentScore > 20 ? 'EXTREME' : sentimentScore > 15 ? 'STRONG' : sentimentScore > 10 ? 'MODERATE' : 'WEAK',
          lastUpdate: new Date(),
          source: 'MT5_Price_Analysis'
        });
      }
    }
    
    return sentiment;
  } catch (error) {
    console.error('❌ Error calculating real market sentiment:', error);
    return [];
  }
}

// Calculate sentiment score from price data
function calculateSentimentFromPriceData(priceData: any[]): number {
  if (priceData.length < 2) return 12;
  
  let bullishSignals = 0;
  let bearishSignals = 0;
  
  for (let i = 1; i < priceData.length; i++) {
    const current = priceData[i];
    const previous = priceData[i - 1];
    
    // Price movement
    if (current.close > previous.close) bullishSignals++;
    else if (current.close < previous.close) bearishSignals++;
    
    // Volatility
    const volatility = (current.high - current.low) / previous.close;
    if (volatility > 0.002) { // High volatility
      if (current.close > previous.close) bullishSignals += 0.5;
      else bearishSignals += 0.5;
    }
  }
  
  // Calculate sentiment score (1-25)
  const totalSignals = bullishSignals + bearishSignals;
  if (totalSignals === 0) return 12;
  
  const bullishRatio = bullishSignals / totalSignals;
  const score = Math.round(1 + (bullishRatio * 24));
  
  return Math.max(1, Math.min(25, score));
}
