import axios from 'axios';
import * as cheerio from 'cheerio';

export interface EnhancedForexFactoryEvent {
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
}

export interface EnhancedCollectionResult {
  success: boolean;
  events: EnhancedForexFactoryEvent[];
  error?: string;
  responseTime: number;
  statusCode: number;
  headers: any;
}

export class EnhancedForexFactoryCollector {
  private baseUrl = 'https://www.forexfactory.com/calendar';
  private session: any;
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0'
  ];

  constructor() {
    // Create axios instance with enhanced configuration
    this.session = axios.create({
      timeout: 30000,
      maxRedirects: 5,
      validateStatus: (status) => status < 500, // Accept all status codes < 500
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
      }
    });

    // Add request interceptor for dynamic headers
    this.session.interceptors.request.use((config: any) => {
      const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
      config.headers['User-Agent'] = userAgent;
      
      // Add random viewport dimensions
      const viewports = [
        '1920x1080',
        '1366x768', 
        '1440x900',
        '1536x864',
        '1280x720'
      ];
      const viewport = viewports[Math.floor(Math.random() * viewports.length)];
      config.headers['Viewport-Width'] = viewport.split('x')[0];
      config.headers['Viewport-Height'] = viewport.split('x')[1];
      
      return config;
    });
  }

  /**
   * Build Forex Factory URL with enhanced parameters
   */
  private buildEnhancedUrl(weekParam: string): string {
    // Add random query parameters to make requests look more natural
    const randomParams = [
      `_t=${Date.now()}`,
      `ref=${Math.random().toString(36).substring(7)}`,
      `v=${Math.random().toString(36).substring(7)}`
    ];
    
    const baseUrl = `${this.baseUrl}?week=${weekParam}&permalink=true&impacts=3,2,1,0&event_types=1,2,3,4,5,7,8,9,10,11&currencies=1,2,3,4,5,6,7,8,9`;
    
    return `${baseUrl}&${randomParams.join('&')}`;
  }

  /**
   * Simulate human-like browsing behavior
   */
  private async simulateHumanBehavior(): Promise<void> {
    // Random delay between 2-8 seconds
    const delay = Math.random() * 6000 + 2000;
    await this.delay(delay);
    
    // Sometimes add extra delay (20% chance)
    if (Math.random() < 0.2) {
      const extraDelay = Math.random() * 5000 + 1000;
      console.log(`🤖 Simulating human behavior: extra delay ${Math.round(extraDelay)}ms`);
      await this.delay(extraDelay);
    }
  }

  /**
   * Try multiple collection strategies
   */
  async collectWithMultipleStrategies(weekParam: string): Promise<EnhancedCollectionResult> {
    const strategies = [
      () => this.strategy1_DirectAccess(weekParam),
      () => this.strategy2_ReferrerHeader(weekParam),
      () => this.strategy3_SessionBased(weekParam),
      () => this.strategy4_ProgressiveHeaders(weekParam)
    ];

    for (let i = 0; i < strategies.length; i++) {
      try {
        console.log(`🎯 Trying Strategy ${i + 1}/${strategies.length} for week ${weekParam}`);
        
        const result = await strategies[i]();
        if (result.success) {
          console.log(`✅ Strategy ${i + 1} succeeded!`);
          return result;
        }
        
        console.log(`❌ Strategy ${i + 1} failed: ${result.error}`);
        
        // Wait before trying next strategy
        if (i < strategies.length - 1) {
          await this.delay(3000);
        }
        
      } catch (error: any) {
        console.log(`❌ Strategy ${i + 1} error: ${error.message}`);
      }
    }

    return {
      success: false,
      events: [],
      error: 'All strategies failed',
      responseTime: 0,
      statusCode: 0,
      headers: {}
    };
  }

  /**
   * Strategy 1: Direct access with enhanced headers
   */
  private async strategy1_DirectAccess(weekParam: string): Promise<EnhancedCollectionResult> {
    const url = this.buildEnhancedUrl(weekParam);
    const startTime = Date.now();
    
    try {
      const response = await this.session.get(url);
      const responseTime = Date.now() - startTime;
      
      if (response.status === 200) {
        const events = this.parseEvents(response.data, weekParam);
        return {
          success: true,
          events,
          responseTime,
          statusCode: response.status,
          headers: response.headers
        };
      } else {
        return {
          success: false,
          events: [],
          error: `HTTP ${response.status}`,
          responseTime,
          statusCode: response.status,
          headers: response.headers
        };
      }
    } catch (error: any) {
      return {
        success: false,
        events: [],
        error: error.message,
        responseTime: Date.now() - startTime,
        statusCode: 0,
        headers: {}
      };
    }
  }

  /**
   * Strategy 2: Use referrer header to appear coming from search
   */
  private async strategy2_ReferrerHeader(weekParam: string): Promise<EnhancedCollectionResult> {
    const url = this.buildEnhancedUrl(weekParam);
    const startTime = Date.now();
    
    try {
      const response = await this.session.get(url, {
        headers: {
          'Referer': 'https://www.google.com/search?q=forex+factory+economic+calendar',
          'Origin': 'https://www.google.com'
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.status === 200) {
        const events = this.parseEvents(response.data, weekParam);
        return {
          success: true,
          events,
          responseTime,
          statusCode: response.status,
          headers: response.headers
        };
      } else {
        return {
          success: false,
          events: [],
          error: `HTTP ${response.status}`,
          responseTime,
          statusCode: response.status,
          headers: response.headers
        };
      }
    } catch (error: any) {
      return {
        success: false,
        events: [],
        error: error.message,
        responseTime: Date.now() - startTime,
        statusCode: 0,
        headers: {}
      };
    }
  }

  /**
   * Strategy 3: Session-based with cookies
   */
  private async strategy3_SessionBased(weekParam: string): Promise<EnhancedCollectionResult> {
    const startTime = Date.now();
    
    try {
      // First, visit the main page to get cookies
      console.log('🍪 Getting session cookies...');
      await this.session.get('https://www.forexfactory.com');
      await this.delay(2000);
      
      // Then try to access the calendar
      const url = this.buildEnhancedUrl(weekParam);
      const response = await this.session.get(url);
      
      const responseTime = Date.now() - startTime;
      
      if (response.status === 200) {
        const events = this.parseEvents(response.data, weekParam);
        return {
          success: true,
          events,
          responseTime,
          statusCode: response.status,
          headers: response.headers
        };
      } else {
        return {
          success: false,
          events: [],
          error: `HTTP ${response.status}`,
          responseTime,
          statusCode: response.status,
          headers: response.headers
        };
      }
    } catch (error: any) {
      return {
        success: false,
        events: [],
        error: error.message,
        responseTime: Date.now() - startTime,
        statusCode: 0,
        headers: {}
      };
    }
  }

  /**
   * Strategy 4: Progressive headers (start minimal, add more if needed)
   */
  private async strategy4_ProgressiveHeaders(weekParam: string): Promise<EnhancedCollectionResult> {
    const url = this.buildEnhancedUrl(weekParam);
    const startTime = Date.now();
    
    try {
      // Start with minimal headers
      const response = await this.session.get(url, {
        headers: {
          'User-Agent': this.userAgents[0],
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.status === 200) {
        const events = this.parseEvents(response.data, weekParam);
        return {
          success: true,
          events,
          responseTime,
          statusCode: response.status,
          headers: response.headers
        };
      } else {
        return {
          success: false,
          events: [],
          error: `HTTP ${response.status}`,
          responseTime,
          statusCode: response.status,
          headers: response.headers
        };
      }
    } catch (error: any) {
      return {
        success: false,
        events: [],
        error: error.message,
        responseTime: Date.now() - startTime,
        statusCode: 0,
        headers: {}
      };
    }
  }

  /**
   * Parse events from HTML response
   */
  private parseEvents(html: string, weekParam: string): EnhancedForexFactoryEvent[] {
    const events: EnhancedForexFactoryEvent[] = [];
    const $ = cheerio.load(html);
    
    // Look for calendar events
    $('.calendar__row, .calendar-row, .event-row').each((index, element) => {
      try {
        const $row = $(element);
        
        // Try multiple selectors for different page layouts
        const currency = $row.find('.calendar__currency, .currency, .ccy').text().trim();
        const impact = $row.find('.calendar__impact, .impact, .importance').attr('title') || 'LOW';
        const time = $row.find('.calendar__time, .time, .event-time').text().trim();
        const event = $row.find('.calendar__event, .event, .event-name').text().trim();
        const actual = $row.find('.calendar__actual, .actual, .actual-value').text().trim();
        const forecast = $row.find('.calendar__forecast, .forecast, .forecast-value').text().trim();
        const previous = $row.find('.calendar__previous, .previous, .previous-value').text().trim();
        
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
            source: 'Forex Factory Calendar',
            url: `https://www.forexfactory.com/calendar?week=${weekParam}`
          });
        }
      } catch (error) {
        console.warn('Warning: Could not parse event row:', error);
      }
    });
    
    return events;
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
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
