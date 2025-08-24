import axios from 'axios';
import * as cheerio from 'cheerio';

export interface EnhancedForexEvent {
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
  eventDate: Date;
}

export interface EnhancedCollectionResult {
  source: string;
  success: boolean;
  events: EnhancedForexEvent[];
  error?: string;
  responseTime: number;
  statusCode: number;
}

export class EnhancedMultiSourceCollector {
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ];

  /**
   * Collect from Investing.com with enhanced parsing
   */
  async collectFromInvestingCom(): Promise<EnhancedCollectionResult> {
    const startTime = Date.now();
    const source = 'Investing.com';
    
    try {
      console.log('📊 Collecting from Investing.com Economic Calendar...');
      
      // Try multiple URLs for different time periods
      const urls = [
        'https://www.investing.com/economic-calendar/',
        'https://www.investing.com/economic-calendar/week',
        'https://www.investing.com/economic-calendar/month'
      ];

      let allEvents: EnhancedForexEvent[] = [];
      
      for (const url of urls) {
        try {
          const response = await axios.get(url, {
            headers: {
              'User-Agent': this.userAgents[Math.floor(Math.random() * this.userAgents.length)],
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
              'Accept-Encoding': 'gzip, deflate, br',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1',
              'Cache-Control': 'no-cache'
            },
            timeout: 30000
          });

          if (response.status === 200) {
            const events = this.parseInvestingComEvents(response.data, url);
            allEvents.push(...events);
            console.log(`   ✅ ${url}: ${events.length} events`);
          }
          
          // Add delay between requests
          await this.delay(1000 + Math.random() * 2000);
          
        } catch (error: any) {
          console.log(`   ⚠️ ${url}: ${error.message}`);
        }
      }

      return {
        source,
        success: allEvents.length > 0,
        events: allEvents,
        responseTime: Date.now() - startTime,
        statusCode: 200
      };
      
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
   * Collect from FXStreet with enhanced parsing
   */
  async collectFromFXStreet(): Promise<EnhancedCollectionResult> {
    const startTime = Date.now();
    const source = 'FXStreet';
    
    try {
      console.log('📊 Collecting from FXStreet Economic Calendar...');
      
      const urls = [
        'https://www.fxstreet.com/economic-calendar',
        'https://www.fxstreet.com/economic-calendar/week',
        'https://www.fxstreet.com/economic-calendar/month'
      ];

      let allEvents: EnhancedForexEvent[] = [];
      
      for (const url of urls) {
        try {
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
            const events = this.parseFXStreetEvents(response.data, url);
            allEvents.push(...events);
            console.log(`   ✅ ${url}: ${events.length} events`);
          }
          
          await this.delay(1000 + Math.random() * 2000);
          
        } catch (error: any) {
          console.log(`   ⚠️ ${url}: ${error.message}`);
        }
      }

      return {
        source,
        success: allEvents.length > 0,
        events: allEvents,
        responseTime: Date.now() - startTime,
        statusCode: 200
      };
      
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
   * Collect from Yahoo Finance with enhanced parsing
   */
  async collectFromYahooFinance(): Promise<EnhancedCollectionResult> {
    const startTime = Date.now();
    const source = 'Yahoo Finance';
    
    try {
      console.log('📊 Collecting from Yahoo Finance Forex News...');
      
      const urls = [
        'https://finance.yahoo.com/currencies/news',
        'https://finance.yahoo.com/news/forex',
        'https://finance.yahoo.com/news/currency'
      ];

      let allEvents: EnhancedForexEvent[] = [];
      
      for (const url of urls) {
        try {
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
            const events = this.parseYahooFinanceEvents(response.data, url);
            allEvents.push(...events);
            console.log(`   ✅ ${url}: ${events.length} events`);
          }
          
          await this.delay(1000 + Math.random() * 2000);
          
        } catch (error: any) {
          console.log(`   ⚠️ ${url}: ${error.message}`);
        }
      }

      return {
        source,
        success: allEvents.length > 0,
        events: allEvents,
        responseTime: Date.now() - startTime,
        statusCode: 200
      };
      
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
   * Collect from MarketWatch with enhanced parsing
   */
  async collectFromMarketWatch(): Promise<EnhancedCollectionResult> {
    const startTime = Date.now();
    const source = 'MarketWatch';
    
    try {
      console.log('📊 Collecting from MarketWatch Forex News...');
      
      const urls = [
        'https://www.marketwatch.com/investing/currency',
        'https://www.marketwatch.com/newsview/forex',
        'https://www.marketwatch.com/newsview/currency'
      ];

      let allEvents: EnhancedForexEvent[] = [];
      
      for (const url of urls) {
        try {
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
            const events = this.parseMarketWatchEvents(response.data, url);
            allEvents.push(...events);
            console.log(`   ✅ ${url}: ${events.length} events`);
          }
          
          await this.delay(1000 + Math.random() * 2000);
          
        } catch (error: any) {
          console.log(`   ⚠️ ${url}: ${error.message}`);
        }
      }

      return {
        source,
        success: allEvents.length > 0,
        events: allEvents,
        responseTime: Date.now() - startTime,
        statusCode: 200
      };
      
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
   * Collect from all sources with comprehensive coverage
   */
  async collectFromAllSources(): Promise<EnhancedCollectionResult[]> {
    console.log('🚀 Starting Enhanced Multi-Source Collection...\n');
    
    const sources = [
      () => this.collectFromInvestingCom(),
      () => this.collectFromFXStreet(),
      () => this.collectFromYahooFinance(),
      () => this.collectFromMarketWatch()
    ];

    const results: EnhancedCollectionResult[] = [];
    
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
   * Enhanced Investing.com parsing with multiple selectors
   */
  private parseInvestingComEvents(html: string, url: string): EnhancedForexEvent[] {
    const events: EnhancedForexEvent[] = [];
    const $ = cheerio.load(html);
    
    // Try multiple selector patterns
    const selectors = [
      '.economicCalendarRow',
      '.calendarRow', 
      '.eventRow',
      '.ec-table-row',
      '.calendar-table-row',
      '[data-test="economic-calendar-row"]',
      'tr[data-event-id]',
      '.economic-event'
    ];
    
    selectors.forEach(selector => {
      $(selector).each((index, element) => {
        try {
          const $row = $(element);
          
          // Try multiple currency selectors
          const currency = $row.find('.flagCur, .currency, .ccy, .flag, [data-currency]').first().text().trim() ||
                          $row.find('td').eq(0).text().trim();
          
          // Try multiple impact selectors
          const impact = $row.find('.grayFull, .impact, .importance, .level, [data-impact]').attr('title') ||
                        $row.find('.grayFull, .impact, .importance, .level, [data-impact]').attr('data-impact') ||
                        'LOW';
          
          // Try multiple time selectors
          const time = $row.find('.time, .eventTime, .event-time, [data-time]').text().trim() ||
                      $row.find('td').eq(1).text().trim();
          
          // Try multiple event selectors
          const event = $row.find('.event, .eventName, .event-name, .title, [data-event]').text().trim() ||
                       $row.find('td').eq(2).text().trim();
          
          // Try multiple value selectors
          const actual = $row.find('.actual, .actualValue, .actual-value, [data-actual]').text().trim() ||
                        $row.find('td').eq(3).text().trim();
          const forecast = $row.find('.forecast, .forecastValue, .forecast-value, [data-forecast]').text().trim() ||
                          $row.find('td').eq(4).text().trim();
          const previous = $row.find('.previous, .previousValue, .previous-value, [data-previous]').text().trim() ||
                          $row.find('td').eq(5).text().trim();
          
          if (currency && event && currency.length <= 10) { // Basic validation
            events.push({
              currency: this.normalizeCurrency(currency),
              impact: this.normalizeImpact(impact),
              time: time || 'N/A',
              event: event.substring(0, 200), // Limit length
              actual: actual || null,
              forecast: forecast || null,
              previous: previous || null,
              timestamp: new Date(),
              source: 'Investing.com',
              url,
              confidenceScore: this.calculateConfidenceScore(impact),
              sentiment: this.analyzeSentiment(event, actual, forecast, previous),
              eventDate: this.parseEventDate(time)
            });
          }
        } catch (error) {
          // Silently continue to next element
        }
      });
    });
    
    return events;
  }

  /**
   * Enhanced FXStreet parsing
   */
  private parseFXStreetEvents(html: string, url: string): EnhancedForexEvent[] {
    const events: EnhancedForexEvent[] = [];
    const $ = cheerio.load(html);
    
    const selectors = [
      '.calendar-row',
      '.event-row', 
      '.economic-event',
      '.ec-event',
      '.calendar-event',
      '[data-event-id]',
      'tr[class*="event"]'
    ];
    
    selectors.forEach(selector => {
      $(selector).each((index, element) => {
        try {
          const $row = $(element);
          
          const currency = $row.find('.currency, .ccy, .flag, [data-currency]').first().text().trim() ||
                          $row.find('td').eq(0).text().trim();
          
          const impact = $row.find('.impact, .importance, .level, [data-impact]').attr('title') ||
                        $row.find('.impact, .importance, .level, [data-impact]').attr('data-impact') ||
                        'LOW';
          
          const time = $row.find('.time, .event-time, [data-time]').text().trim() ||
                      $row.find('td').eq(1).text().trim();
          
          const event = $row.find('.event, .event-name, .title, [data-event]').text().trim() ||
                       $row.find('td').eq(2).text().trim();
          
          const actual = $row.find('.actual, .actual-value, [data-actual]').text().trim() ||
                        $row.find('td').eq(3).text().trim();
          const forecast = $row.find('.forecast, .forecast-value, [data-forecast]').text().trim() ||
                          $row.find('td').eq(4).text().trim();
          const previous = $row.find('.previous, .previous-value, [data-previous]').text().trim() ||
                          $row.find('td').eq(5).text().trim();
          
          if (currency && event && currency.length <= 10) {
            events.push({
              currency: this.normalizeCurrency(currency),
              impact: this.normalizeImpact(impact),
              time: time || 'N/A',
              event: event.substring(0, 200),
              actual: actual || null,
              forecast: forecast || null,
              previous: previous || null,
              timestamp: new Date(),
              source: 'FXStreet',
              url,
              confidenceScore: this.calculateConfidenceScore(impact),
              sentiment: this.analyzeSentiment(event, actual, forecast, previous),
              eventDate: this.parseEventDate(time)
            });
          }
        } catch (error) {
          // Silently continue
        }
      });
    });
    
    return events;
  }

  /**
   * Enhanced Yahoo Finance parsing
   */
  private parseYahooFinanceEvents(html: string, url: string): EnhancedForexEvent[] {
    const events: EnhancedForexEvent[] = [];
    const $ = cheerio.load(html);
    
    const selectors = [
      '.news-item',
      '.article', 
      '.story',
      '.news-story',
      '.news-article',
      '[data-test="news-item"]',
      '.news-list-item'
    ];
    
    selectors.forEach(selector => {
      $(selector).each((index, element) => {
        try {
          const $row = $(element);
          
          const title = $row.find('.title, .headline, .story-title, .news-title, [data-test="headline"]').text().trim();
          const summary = $row.find('.summary, .excerpt, .description, .news-summary, .story-summary').text().trim();
          const time = $row.find('.time, .timestamp, .date, .news-time, .story-time').text().trim();
          const linkUrl = $row.find('a').attr('href') || '';
          
          if (title) {
            // Extract currencies from title/summary
            const currencies = this.extractCurrencies(title + ' ' + summary);
            
            if (currencies.length > 0) {
              currencies.forEach(currency => {
                events.push({
                  currency,
                  impact: 'MEDIUM', // News articles are typically medium impact
                  time: time || 'N/A',
                  event: title.substring(0, 200),
                  actual: null,
                  forecast: null,
                  previous: null,
                  timestamp: new Date(),
                  source: 'Yahoo Finance',
                  url: linkUrl.startsWith('http') ? linkUrl : `https://finance.yahoo.com${linkUrl}`,
                  confidenceScore: 75, // News articles have good confidence
                  sentiment: this.analyzeSentiment(title, null, null, null),
                  eventDate: this.parseEventDate(time)
                });
              });
            }
          }
        } catch (error) {
          // Silently continue
        }
      });
    });
    
    return events;
  }

  /**
   * MarketWatch parsing
   */
  private parseMarketWatchEvents(html: string, url: string): EnhancedForexEvent[] {
    const events: EnhancedForexEvent[] = [];
    const $ = cheerio.load(html);
    
    const selectors = [
      '.article__content',
      '.news-item',
      '.story',
      '.news-story',
      '[data-test="news-item"]'
    ];
    
    selectors.forEach(selector => {
      $(selector).each((index, element) => {
        try {
          const $row = $(element);
          
          const title = $row.find('.article__headline, .headline, .title, .story-title').text().trim();
          const summary = $row.find('.article__summary, .summary, .excerpt, .description').text().trim();
          const time = $row.find('.article__timestamp, .timestamp, .time, .date').text().trim();
          const linkUrl = $row.find('a').attr('href') || '';
          
          if (title) {
            const currencies = this.extractCurrencies(title + ' ' + summary);
            
            if (currencies.length > 0) {
              currencies.forEach(currency => {
                events.push({
                  currency,
                  impact: 'MEDIUM',
                  time: time || 'N/A',
                  event: title.substring(0, 200),
                  actual: null,
                  forecast: null,
                  previous: null,
                  timestamp: new Date(),
                  source: 'MarketWatch',
                  url: linkUrl.startsWith('http') ? linkUrl : `https://www.marketwatch.com${linkUrl}`,
                  confidenceScore: 70,
                  sentiment: this.analyzeSentiment(title, null, null, null),
                  eventDate: this.parseEventDate(time)
                });
              });
            }
          }
        } catch (error) {
          // Silently continue
        }
      });
    });
    
    return events;
  }

  /**
   * Extract currencies from text with enhanced patterns
   */
  private extractCurrencies(text: string): string[] {
    const currencyPatterns = [
      /\b(USD|EUR|GBP|JPY|AUD|CAD|CHF|NZD|CNY|HKD|SGD|SEK|NOK|DKK|PLN|CZK|HUF|RON|BGN|HRK|TRY|ZAR|BRL|MXN|INR|KRW|THB|MYR|IDR|PHP|VND)\b/gi,
      /\b(US Dollar|Euro|British Pound|Japanese Yen|Australian Dollar|Canadian Dollar|Swiss Franc|New Zealand Dollar|Chinese Yuan|Hong Kong Dollar|Singapore Dollar|Swedish Krona|Norwegian Krone|Danish Krone|Polish Zloty|Czech Koruna|Hungarian Forint|Romanian Leu|Bulgarian Lev|Croatian Kuna|Turkish Lira|South African Rand|Brazilian Real|Mexican Peso|Indian Rupee|South Korean Won|Thai Baht|Malaysian Ringgit|Indonesian Rupiah|Philippine Peso|Vietnamese Dong)\b/gi
    ];
    
    const currencies = new Set<string>();
    
    currencyPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
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
      'Croatian Kuna': 'HRK',
      'Turkish Lira': 'TRY',
      'South African Rand': 'ZAR',
      'Brazilian Real': 'BRL',
      'Mexican Peso': 'MXN',
      'Indian Rupee': 'INR',
      'South Korean Won': 'KRW',
      'Thai Baht': 'THB',
      'Malaysian Ringgit': 'MYR',
      'Indonesian Rupiah': 'IDR',
      'Philippine Peso': 'PHP',
      'Vietnamese Dong': 'VND'
    };
    
    return currencyMap[name] || name;
  }

  /**
   * Normalize currency codes
   */
  private normalizeCurrency(currency: string): string {
    const normalized = currency.trim().toUpperCase();
    // Basic validation - should be 3 letters
    if (normalized.length === 3 && /^[A-Z]{3}$/.test(normalized)) {
      return normalized;
    }
    // Try to extract 3-letter code
    const match = normalized.match(/\b([A-Z]{3})\b/);
    return match ? match[1] : 'USD'; // Default to USD if can't parse
  }

  /**
   * Normalize impact levels
   */
  private normalizeImpact(impact: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    const lower = impact.toLowerCase();
    if (lower.includes('high') || lower.includes('red') || lower.includes('3') || lower.includes('high')) return 'HIGH';
    if (lower.includes('medium') || lower.includes('orange') || lower.includes('2') || lower.includes('medium')) return 'MEDIUM';
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
    const bullishKeywords = ['increase', 'rise', 'higher', 'strong', 'positive', 'growth', 'expansion', 'improvement', 'bullish', 'gain', 'up', 'surge', 'rally'];
    const bearishKeywords = ['decrease', 'fall', 'lower', 'weak', 'negative', 'decline', 'contraction', 'deterioration', 'bearish', 'loss', 'down', 'drop', 'crash'];
    
    const text = (event + ' ' + (actual || '') + ' ' + (forecast || '') + ' ' + (previous || '')).toLowerCase();
    
    const bullishCount = bullishKeywords.filter(keyword => text.includes(keyword)).length;
    const bearishCount = bearishKeywords.filter(keyword => text.includes(keyword)).length;
    
    if (bullishCount > bearishCount) return 'BULLISH';
    if (bearishCount > bullishCount) return 'BEARISH';
    return 'NEUTRAL';
  }

  /**
   * Parse event date from time string
   */
  private parseEventDate(timeStr: string): Date {
    try {
      // Try to parse various time formats
      if (timeStr.includes('Today')) return new Date();
      if (timeStr.includes('Yesterday')) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday;
      }
      
      // Try to parse specific date formats
      const parsed = new Date(timeStr);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
      
      // Default to current date
      return new Date();
    } catch {
      return new Date();
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
