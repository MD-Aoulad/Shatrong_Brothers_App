import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ForexFactoryEvent {
  id: string;
  currency: string;
  eventType: string;
  title: string;
  description: string;
  eventDate: Date;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidenceScore: number;
  source: string;
  actualValue?: number | null;
  expectedValue?: number | null;
  previousValue?: number | null;
  url?: string;
}

export interface ForexFactoryCalendarData {
  events: ForexFactoryEvent[];
  lastUpdate: Date;
  source: 'Forex Factory Calendar' | 'Forex Factory Calendar (Fallback)' | 'Alternative Source';
  totalEvents: number;
  highImpactEvents: number;
  mediumImpactEvents: number;
  lowImpactEvents: number;
}

export class ForexFactoryCalendarService {
  private baseUrl = 'https://www.forexfactory.com/calendar';
  
  // Multiple user agents to rotate
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
  ];

  /**
   * Get economic calendar data from Forex Factory with fallback strategies
   */
  async getCalendarData(week?: string): Promise<ForexFactoryCalendarData> {
    try {
      console.log('🌐 Attempting to fetch Forex Factory economic calendar...');
      
      // Try multiple approaches
      const data = await this.tryMultipleApproaches(week);
      
      if (data.events.length > 0) {
        console.log(`✅ Successfully got ${data.events.length} real economic events from Forex Factory`);
        return data;
      }
      
      // If all attempts fail, return fallback data
      console.log('⚠️ All Forex Factory attempts failed, using fallback data');
      return this.getFallbackCalendarData();
      
    } catch (error) {
      console.error('❌ Error in Forex Factory calendar collection:', error);
      return this.getFallbackCalendarData();
    }
  }

  /**
   * Try multiple approaches to bypass Cloudflare
   */
  private async tryMultipleApproaches(week?: string): Promise<ForexFactoryCalendarData> {
    const approaches = [
      () => this.tryDirectAccess(week),
      () => this.tryWithRotatingUserAgent(week),
      () => this.tryWithDelayedRequest(week),
      () => this.tryAlternativeEndpoints(week)
    ];

    for (const approach of approaches) {
      try {
        const result = await approach();
        if (result.events.length > 0) {
          return result;
        }
             } catch (error) {
         console.log(`⚠️ Approach failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
         continue;
       }
    }

    return { events: [], lastUpdate: new Date(), source: 'Alternative Source', totalEvents: 0, highImpactEvents: 0, mediumImpactEvents: 0, lowImpactEvents: 0 };
  }

  /**
   * Try direct access with basic headers
   */
  private async tryDirectAccess(week?: string): Promise<ForexFactoryCalendarData> {
    const url = this.buildCalendarUrl(week);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': this.userAgents[0],
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      },
      timeout: 20000
    });

    if (response.status === 200 && !response.data.includes('Just a moment')) {
      return this.parseCalendarHTML(response.data);
    }
    
    throw new Error('Cloudflare protection detected');
  }

  /**
   * Try with rotating user agents
   */
  private async tryWithRotatingUserAgent(week?: string): Promise<ForexFactoryCalendarData> {
    const randomUserAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    const url = this.buildCalendarUrl(week);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': randomUserAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 20000
    });

    if (response.status === 200 && !response.data.includes('Just a moment')) {
      return this.parseCalendarHTML(response.data);
    }
    
    throw new Error('Cloudflare protection still active');
  }

  /**
   * Try with delayed request
   */
  private async tryWithDelayedRequest(week?: string): Promise<ForexFactoryCalendarData> {
    // Wait 2 seconds before making request
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const url = this.buildCalendarUrl(week);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': this.userAgents[2],
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 25000
    });

    if (response.status === 200 && !response.data.includes('Just a moment')) {
      return this.parseCalendarHTML(response.data);
    }
    
    throw new Error('Delayed request failed');
  }

  /**
   * Try alternative endpoints
   */
  private async tryAlternativeEndpoints(week?: string): Promise<ForexFactoryCalendarData> {
    // Try different URL patterns
    const alternativeUrls = [
      this.buildCalendarUrl(week),
      `https://www.forexfactory.com/calendar?week=${week || 'aug10.2025'}`,
      `https://www.forexfactory.com/calendar?week=${week || 'aug10.2025'}&impacts=3,2,1,0`
    ];

    for (const url of alternativeUrls) {
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': this.userAgents[3],
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive'
          },
          timeout: 15000
        });

        if (response.status === 200 && !response.data.includes('Just a moment')) {
          return this.parseCalendarHTML(response.data);
        }
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('All alternative endpoints failed');
  }

  /**
   * Build calendar URL with parameters
   */
  private buildCalendarUrl(week?: string): string {
    const weekParam = week || 'aug10.2025';
    return `${this.baseUrl}?week=${weekParam}&permalink=true&impacts=3,2,1,0&event_types=1,2,3,4,5,7,8,9,10,11&currencies=1,2,3,4,5,6,7,8,9`;
  }

  /**
   * Parse the HTML calendar data from Forex Factory
   */
  private parseCalendarHTML(html: string): ForexFactoryCalendarData {
    try {
      const $ = cheerio.load(html);
      const events: ForexFactoryEvent[] = [];
      
      // Forex Factory calendar structure
      $('.calendar__row').each((index, element) => {
        try {
          const $row = $(element);
          
          // Skip header rows
          if ($row.hasClass('calendar__row--header')) {
            return;
          }

          // Extract event data
          const time = $row.find('.calendar__time').text().trim();
          const currency = $row.find('.calendar__currency').text().trim();
          const impact = $row.find('.calendar__impact').attr('title') || '';
          const event = $row.find('.calendar__event').text().trim();
          const actual = $row.find('.calendar__actual').text().trim();
          const forecast = $row.find('.calendar__forecast').text().trim();
          const previous = $row.find('.calendar__previous').text().trim();
          
          // Skip if no currency or event
          if (!currency || !event) {
            return;
          }

          // Parse date and time
          const eventDate = this.parseEventDateTime(time);
          
          // Determine impact level
          const impactLevel = this.parseImpactLevel(impact);
          
          // Determine sentiment
          const sentiment = this.calculateSentiment(actual, forecast, previous);
          
          // Calculate confidence score
          const confidenceScore = this.calculateConfidenceScore(impactLevel, actual, forecast);
          
          // Create event object
          const forexEvent: ForexFactoryEvent = {
            id: `ff-${Date.now()}-${index}`,
            currency: this.normalizeCurrency(currency),
            eventType: this.categorizeEvent(event),
            title: event,
            description: event,
            eventDate,
            impact: impactLevel,
            sentiment,
            confidenceScore,
            source: 'Forex Factory',
            actualValue: this.parseNumericValue(actual),
            expectedValue: this.parseNumericValue(forecast),
            previousValue: this.parseNumericValue(previous),
            url: `https://www.forexfactory.com/calendar?week=${this.getCurrentWeek()}`
          };

          events.push(forexEvent);

        } catch (rowError) {
          console.log(`⚠️ Error parsing row ${index}:`, rowError);
        }
      });

      return {
        events,
        lastUpdate: new Date(),
        source: 'Forex Factory Calendar',
        totalEvents: events.length,
        highImpactEvents: events.filter(e => e.impact === 'HIGH').length,
        mediumImpactEvents: events.filter(e => e.impact === 'MEDIUM').length,
        lowImpactEvents: events.filter(e => e.impact === 'LOW').length
      };

    } catch (error) {
      console.error('❌ Error parsing HTML:', error);
      return {
        events: [],
        lastUpdate: new Date(),
        source: 'Forex Factory Calendar (Fallback)',
        totalEvents: 0,
        highImpactEvents: 0,
        mediumImpactEvents: 0,
        lowImpactEvents: 0
      };
    }
  }

  /**
   * Parse event date and time
   */
  private parseEventDateTime(timeStr: string): Date {
    try {
      const now = new Date();
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      // Create date for today with the specified time
      const eventDate = new Date(now);
      eventDate.setHours(hours, minutes, 0, 0);
      
      // If the time has passed today, assume it's for tomorrow
      if (eventDate < now) {
        eventDate.setDate(eventDate.getDate() + 1);
      }
      
      return eventDate;
    } catch (error) {
      // Return current date if parsing fails
      return new Date();
    }
  }

  /**
   * Parse impact level from Forex Factory
   */
  private parseImpactLevel(impact: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    const lowerImpact = impact.toLowerCase();
    
    if (lowerImpact.includes('high') || lowerImpact.includes('3')) {
      return 'HIGH';
    } else if (lowerImpact.includes('medium') || lowerImpact.includes('2')) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }

  /**
   * Calculate sentiment based on actual vs forecast vs previous
   */
  private calculateSentiment(actual: string, forecast: string, previous: string): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    try {
      const actualVal = this.parseNumericValue(actual);
      const forecastVal = this.parseNumericValue(forecast);
      const previousVal = this.parseNumericValue(previous);
      
      if (actualVal !== null && forecastVal !== null) {
        const difference = ((actualVal - forecastVal) / Math.abs(forecastVal)) * 100;
        
        if (difference > 10) return 'BULLISH';
        if (difference < -10) return 'BEARISH';
      }
      
      if (actualVal !== null && previousVal !== null) {
        const change = ((actualVal - previousVal) / Math.abs(previousVal)) * 100;
        
        if (change > 5) return 'BULLISH';
        if (change < -5) return 'BEARISH';
      }
      
      return 'NEUTRAL';
    } catch (error) {
      return 'NEUTRAL';
    }
  }

  /**
   * Calculate confidence score based on impact and data availability
   */
  private calculateConfidenceScore(impact: string, actual: string, forecast: string): number {
    let score = 50; // Base score
    
    // Impact bonus
    if (impact === 'HIGH') score += 30;
    else if (impact === 'MEDIUM') score += 20;
    else score += 10;
    
    // Data availability bonus
    if (actual && actual !== '-') score += 10;
    if (forecast && forecast !== '-') score += 10;
    
    return Math.min(score, 95); // Cap at 95%
  }

  /**
   * Normalize currency codes
   */
  private normalizeCurrency(currency: string): string {
    const currencyMap: Record<string, string> = {
      'USD': 'USD',
      'EUR': 'EUR',
      'GBP': 'GBP',
      'JPY': 'JPY',
      'CAD': 'CAD',
      'AUD': 'AUD',
      'NZD': 'NZD',
      'CHF': 'CHF',
      'CNY': 'CNY',
      'SEK': 'SEK',
      'NOK': 'NOK',
      'DKK': 'DKK',
      'PLN': 'PLN',
      'CZK': 'CZK',
      'HUF': 'HUF',
      'RUB': 'RUB',
      'TRY': 'TRY',
      'ZAR': 'ZAR',
      'BRL': 'BRL',
      'MXN': 'MXN',
      'INR': 'INR',
      'SGD': 'SGD',
      'HKD': 'HKD',
      'KRW': 'KRW'
    };
    
    return currencyMap[currency] || currency;
  }

  /**
   * Categorize event types
   */
  private categorizeEvent(eventTitle: string): string {
    const title = eventTitle.toLowerCase();
    
    if (title.includes('rate') || title.includes('interest')) return 'INTEREST_RATE';
    if (title.includes('cpi') || title.includes('inflation')) return 'CPI';
    if (title.includes('gdp')) return 'GDP';
    if (title.includes('employment') || title.includes('nfp') || title.includes('jobs')) return 'EMPLOYMENT';
    if (title.includes('pmi') || title.includes('manufacturing')) return 'PMI';
    if (title.includes('retail') || title.includes('sales')) return 'RETAIL_SALES';
    if (title.includes('trade') || title.includes('balance')) return 'TRADE_BALANCE';
    if (title.includes('speech') || title.includes('statement')) return 'CENTRAL_BANK';
    
    return 'ECONOMIC';
  }

  /**
   * Parse numeric values from strings
   */
  private parseNumericValue(value: string): number | null {
    if (!value || value === '-' || value === 'N/A') {
      return null;
    }
    
    try {
      // Remove common non-numeric characters
      const cleanValue = value.replace(/[^\d.-]/g, '');
      const parsed = parseFloat(cleanValue);
      
      return isNaN(parsed) ? null : parsed;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get current week in Forex Factory format
   */
  private getCurrentWeek(): string {
    const now = new Date();
    const month = now.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
    const day = now.getDate();
    const year = now.getFullYear();
    
    return `${month}${day}.${year}`;
  }

  /**
   * Get fallback calendar data if scraping fails
   */
  private getFallbackCalendarData(): ForexFactoryCalendarData {
    console.log('⚠️ Using fallback calendar data...');
    
    const fallbackEvents: ForexFactoryEvent[] = [
      {
        id: 'ff-fallback-1',
        currency: 'USD',
        eventType: 'EMPLOYMENT',
        title: 'US Non-Farm Payrolls',
        description: 'Monthly employment report from the US Department of Labor',
        eventDate: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8:30 AM EST
        impact: 'HIGH',
        sentiment: 'NEUTRAL',
        confidenceScore: 85,
        source: 'Forex Factory (Fallback)',
        expectedValue: 185000,
        previousValue: 187000
      },
      {
        id: 'ff-fallback-2',
        currency: 'EUR',
        eventType: 'INTEREST_RATE',
        title: 'ECB Interest Rate Decision',
        description: 'European Central Bank monetary policy decision',
        eventDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12:45 PM EST
        impact: 'HIGH',
        sentiment: 'NEUTRAL',
        confidenceScore: 90,
        source: 'Forex Factory (Fallback)',
        expectedValue: 4.5,
        previousValue: 4.5
      }
    ];

    return {
      events: fallbackEvents,
      lastUpdate: new Date(),
      source: 'Forex Factory Calendar (Fallback)',
      totalEvents: fallbackEvents.length,
      highImpactEvents: fallbackEvents.filter(e => e.impact === 'HIGH').length,
      mediumImpactEvents: fallbackEvents.filter(e => e.impact === 'MEDIUM').length,
      lowImpactEvents: fallbackEvents.filter(e => e.impact === 'LOW').length
    };
  }

  // Get current week's calendar
  async getCurrentWeekCalendar(): Promise<ForexFactoryCalendarData> {
    return this.getCalendarData();
  }

  // Get calendar for specific week
  async getCalendarForWeek(week: string): Promise<ForexFactoryCalendarData> {
    return this.getCalendarData(week);
  }

  /**
   * Get calendar data for next week
   */
  async getNextWeekCalendar(): Promise<ForexFactoryCalendarData> {
    const nextWeek = this.getNextWeek();
    return this.getCalendarData(nextWeek);
  }

  /**
   * Get next week in Forex Factory format
   */
  private getNextWeek(): string {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const month = nextWeek.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
    const day = nextWeek.getDate();
    const year = nextWeek.getFullYear();
    
    return `${month}${day}.${year}`;
  }
}
