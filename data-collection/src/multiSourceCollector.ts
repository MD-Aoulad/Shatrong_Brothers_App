import axios from 'axios';
import * as cheerio from 'cheerio';

export interface MultiSourceEvent {
  currency: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  time: string;
  event: string;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
  timestamp: Date;
  source: string;
  url: string;
  confidenceScore: number;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface MultiSourceResult {
  source: string;
  success: boolean;
  events: MultiSourceEvent[];
  error?: string;
  responseTime: number;
  statusCode: number;
}

export class MultiSourceCollector {
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ];

  /**
   * Collect from Investing.com Economic Calendar
   */
  async collectFromInvestingCom(): Promise<MultiSourceResult> {
    const startTime = Date.now();
    const source = 'Investing.com';
    
    try {
      console.log('📊 Collecting from Investing.com...');
      
      // Investing.com economic calendar URL
      const url = 'https://www.investing.com/economic-calendar/';
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgents[Math.floor(Math.random() * this.userAgents.length)],
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 30000
      });

      if (response.status === 200) {
        const events = this.parseInvestingComEvents(response.data);
        return {
          source,
          success: true,
          events,
          responseTime: Date.now() - startTime,
          statusCode: response.status
        };
      } else {
        return {
          source,
          success: false,
          events: [],
          error: `HTTP ${response.status}`,
          responseTime: Date.now() - startTime,
          statusCode: response.status
        };
      }
    } catch (error: any) {
      return {
        source,
        success: false,
        events: [],
        error: error.message,
        responseTime: Date.now() - startTime,
        statusCode: 0
      };
    }
  }

  /**
   * Collect from FXStreet Economic Calendar
   */
  async collectFromFXStreet(): Promise<MultiSourceResult> {
    const startTime = Date.now();
    const source = 'FXStreet';
    
    try {
      console.log('📊 Collecting from FXStreet...');
      
      // FXStreet economic calendar URL
      const url = 'https://www.fxstreet.com/economic-calendar';
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgents[Math.floor(Math.random() * this.userAgents.length)],
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 30000
      });

      if (response.status === 200) {
        const events = this.parseFXStreetEvents(response.data);
        return {
          source,
          success: true,
          events,
          responseTime: Date.now() - startTime,
          statusCode: response.status
        };
      } else {
        return {
          source,
          success: false,
          events: [],
          error: `HTTP ${response.status}`,
          responseTime: Date.now() - startTime,
          statusCode: response.status
        };
      }
    } catch (error: any) {
      return {
        source,
        success: false,
        events: [],
        error: error.message,
        responseTime: Date.now() - startTime,
        statusCode: 0
      };
    }
  }

  /**
   * Collect from Yahoo Finance News
   */
  async collectFromYahooFinance(): Promise<MultiSourceResult> {
    const startTime = Date.now();
    const source = 'Yahoo Finance';
    
    try {
      console.log('📊 Collecting from Yahoo Finance...');
      
      // Yahoo Finance forex news URL
      const url = 'https://finance.yahoo.com/currencies/news';
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgents[Math.floor(Math.random() * this.userAgents.length)],
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 30000
      });

      if (response.status === 200) {
        const events = this.parseYahooFinanceEvents(response.data);
        return {
          source,
          success: true,
          events,
          responseTime: Date.now() - startTime,
          statusCode: response.status
        };
      } else {
        return {
          source,
          success: false,
          events: [],
          error: `HTTP ${response.status}`,
          responseTime: Date.now() - startTime,
          statusCode: response.status
        };
      }
    } catch (error: any) {
      return {
        source,
        success: false,
        events: [],
        error: error.message,
        responseTime: Date.now() - startTime,
        statusCode: 0
      };
    }
  }

  /**
   * Collect from all sources
   */
  async collectFromAllSources(): Promise<MultiSourceResult[]> {
    console.log('🚀 Starting multi-source collection...\n');
    
    const sources = [
      () => this.collectFromInvestingCom(),
      () => this.collectFromFXStreet(),
      () => this.collectFromYahooFinance()
    ];

    const results: MultiSourceResult[] = [];
    
    for (let i = 0; i < sources.length; i++) {
      try {
        const result = await sources[i]();
        results.push(result);
        
        if (result.success) {
          console.log(`✅ ${result.source}: ${result.events.length} events collected`);
        } else {
          console.log(`❌ ${result.source}: ${result.error}`);
        }
        
        // Add delay between sources
        if (i < sources.length - 1) {
          const delay = Math.random() * 3000 + 2000; // 2-5 seconds
          console.log(`⏳ Waiting ${Math.round(delay)}ms before next source...`);
          await this.delay(delay);
        }
        
      } catch (error: any) {
        console.log(`❌ Error collecting from source ${i + 1}: ${error.message}`);
        results.push({
          source: `Source ${i + 1}`,
          success: false,
          events: [],
          error: error.message,
          responseTime: 0,
          statusCode: 0
        });
      }
    }
    
    return results;
  }

  /**
   * Parse Investing.com events
   */
  private parseInvestingComEvents(html: string): MultiSourceEvent[] {
    const events: MultiSourceEvent[] = [];
    const $ = cheerio.load(html);
    
    // Look for economic calendar events
    $('.economicCalendarRow, .calendarRow, .eventRow').each((index, element) => {
      try {
        const $row = $(element);
        
        const currency = $row.find('.flagCur, .currency, .ccy').text().trim();
        const impact = $row.find('.grayFull, .impact, .importance').attr('title') || 'LOW';
        const time = $row.find('.time, .eventTime').text().trim();
        const event = $row.find('.event, .eventName').text().trim();
        const actual = $row.find('.actual, .actualValue').text().trim();
        const forecast = $row.find('.forecast, .forecastValue').text().trim();
        const previous = $row.find('.previous, .previousValue').text().trim();
        
        if (currency && event) {
          events.push({
            currency,
            impact: this.normalizeImpact(impact),
            time: time || 'N/A',
            event,
            actual: actual || null,
            forecast: forecast || null,
            previous: previous || null,
            timestamp: new Date(),
            source: 'Investing.com',
            url: 'https://www.investing.com/economic-calendar/',
            confidenceScore: this.calculateConfidenceScore(impact),
            sentiment: this.analyzeSentiment(event, actual, forecast, previous)
          });
        }
      } catch (error) {
        console.warn('Warning: Could not parse Investing.com event row:', error);
      }
    });
    
    return events;
  }

  /**
   * Parse FXStreet events
   */
  private parseFXStreetEvents(html: string): MultiSourceEvent[] {
    const events: MultiSourceEvent[] = [];
    const $ = cheerio.load(html);
    
    // Look for economic calendar events
    $('.calendar-row, .event-row, .economic-event').each((index, element) => {
      try {
        const $row = $(element);
        
        const currency = $row.find('.currency, .ccy, .flag').text().trim();
        const impact = $row.find('.impact, .importance, .level').attr('title') || 'LOW';
        const time = $row.find('.time, .event-time').text().trim();
        const event = $row.find('.event, .event-name, .title').text().trim();
        const actual = $row.find('.actual, .actual-value').text().trim();
        const forecast = $row.find('.forecast, .forecast-value').text().trim();
        const previous = $row.find('.previous, .previous-value').text().trim();
        
        if (currency && event) {
          events.push({
            currency,
            impact: this.normalizeImpact(impact),
            time: time || 'N/A',
            event,
            actual: actual || null,
            forecast: forecast || null,
            previous: previous || null,
            timestamp: new Date(),
            source: 'FXStreet',
            url: 'https://www.fxstreet.com/economic-calendar',
            confidenceScore: this.calculateConfidenceScore(impact),
            sentiment: this.analyzeSentiment(event, actual, forecast, previous)
          });
        }
      } catch (error) {
        console.warn('Warning: Could not parse FXStreet event row:', error);
      }
    });
    
    return events;
  }

  /**
   * Parse Yahoo Finance events
   */
  private parseYahooFinanceEvents(html: string): MultiSourceEvent[] {
    const events: MultiSourceEvent[] = [];
    const $ = cheerio.load(html);
    
    // Look for forex news articles
    $('.news-item, .article, .story').each((index, element) => {
      try {
        const $row = $(element);
        
        const title = $row.find('.title, .headline, .story-title').text().trim();
        const summary = $row.find('.summary, .excerpt, .description').text().trim();
        const time = $row.find('.time, .timestamp, .date').text().trim();
        const url = $row.find('a').attr('href') || '';
        
        if (title) {
          // Extract currency from title/summary
          const currencies = this.extractCurrencies(title + ' ' + summary);
          
          if (currencies.length > 0) {
            currencies.forEach(currency => {
              events.push({
                currency,
                impact: 'MEDIUM', // News articles are typically medium impact
                time: time || 'N/A',
                event: title,
                actual: null,
                forecast: null,
                previous: null,
                timestamp: new Date(),
                source: 'Yahoo Finance',
                url: url.startsWith('http') ? url : `https://finance.yahoo.com${url}`,
                confidenceScore: 70, // News articles have good confidence
                sentiment: this.analyzeSentiment(title, null, null, null)
              });
            });
          }
        }
      } catch (error) {
        console.warn('Warning: Could not parse Yahoo Finance article:', error);
      }
    });
    
    return events;
  }

  /**
   * Extract currencies from text
   */
  private extractCurrencies(text: string): string[] {
    const currencyPatterns = [
      /\b(USD|EUR|GBP|JPY|AUD|CAD|CHF|NZD|CNY|HKD|SGD|SEK|NOK|DKK|PLN|CZK|HUF|RON|BGN|HRK)\b/gi,
      /\b(US Dollar|Euro|British Pound|Japanese Yen|Australian Dollar|Canadian Dollar|Swiss Franc|New Zealand Dollar|Chinese Yuan|Hong Kong Dollar|Singapore Dollar|Swedish Krona|Norwegian Krone|Danish Krone|Polish Zloty|Czech Koruna|Hungarian Forint|Romanian Leu|Bulgarian Lev|Croatian Kuna)\b/gi
    ];
    
    const currencies = new Set<string>();
    
    currencyPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Convert full names to codes
          const code = this.convertCurrencyNameToCode(match);
          if (code) {
            currencies.add(code);
          }
        });
      }
    });
    
    return Array.from(currencies);
  }

  /**
   * Convert currency name to code
   */
  private convertCurrencyNameToCode(name: string): string | null {
    const currencyMap: Record<string, string> = {
      'US Dollar': 'USD',
      'Euro': 'EUR',
      'British Pound': 'GBP',
      'Japanese Yen': 'JPY',
      'Australian Dollar': 'AUD',
      'Canadian Dollar': 'CAD',
      'Swiss Franc': 'CHF',
      'New Zealand Dollar': 'NZD',
      'Chinese Yuan': 'CNY',
      'Hong Kong Dollar': 'HKD',
      'Singapore Dollar': 'SGD',
      'Swedish Krona': 'SEK',
      'Norwegian Krone': 'NOK',
      'Danish Krone': 'DKK',
      'Polish Zloty': 'PLN',
      'Czech Koruna': 'CZK',
      'Hungarian Forint': 'HUF',
      'Romanian Leu': 'RON',
      'Bulgarian Lev': 'BGN',
      'Croatian Kuna': 'HRK'
    };
    
    return currencyMap[name] || name;
  }

  /**
   * Normalize impact levels
   */
  private normalizeImpact(impact: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    const lower = impact.toLowerCase();
    if (lower.includes('high') || lower.includes('red') || lower.includes('3')) return 'HIGH';
    if (lower.includes('medium') || lower.includes('orange') || lower.includes('2')) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Calculate confidence score based on impact
   */
  private calculateConfidenceScore(impact: string): number {
    const normalized = this.normalizeImpact(impact);
    switch (normalized) {
      case 'HIGH': return 90;
      case 'MEDIUM': return 75;
      case 'LOW': return 60;
      default: return 50;
    }
  }

  /**
   * Analyze sentiment based on event data
   */
  private analyzeSentiment(event: string, actual: string | null, forecast: string | null, previous: string | null): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    // Simple sentiment analysis based on keywords
    const bullishKeywords = ['increase', 'rise', 'higher', 'strong', 'positive', 'growth', 'expansion', 'improvement'];
    const bearishKeywords = ['decrease', 'fall', 'lower', 'weak', 'negative', 'decline', 'contraction', 'deterioration'];
    
    const text = (event + ' ' + (actual || '') + ' ' + (forecast || '') + ' ' + (previous || '')).toLowerCase();
    
    const bullishCount = bullishKeywords.filter(keyword => text.includes(keyword)).length;
    const bearishCount = bearishKeywords.filter(keyword => text.includes(keyword)).length;
    
    if (bullishCount > bearishCount) return 'BULLISH';
    if (bearishCount > bullishCount) return 'BEARISH';
    return 'NEUTRAL';
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
