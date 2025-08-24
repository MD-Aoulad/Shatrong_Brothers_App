import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ForexFactoryWeekData {
  weekStart: Date;
  weekEnd: Date;
  url: string;
  events: any[];
  success: boolean;
  error?: string;
}

export interface ComprehensiveCollectionResult {
  totalWeeks: number;
  successfulWeeks: number;
  failedWeeks: number;
  totalEvents: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  weeklyResults: ForexFactoryWeekData[];
  summary: string;
}

export class ComprehensiveDataCollector {
  private baseUrl = 'https://www.forexfactory.com/calendar';
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  ];

  /**
   * Generate week parameters for the entire year
   */
  private generateWeekParameters(year: number = 2025): string[] {
    const weeks: string[] = [];
    
    // Generate weeks for each month
    for (let month = 0; month < 12; month++) {
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const monthName = monthNames[month];
      
      // Get first day of month
      const firstDay = new Date(year, month, 1);
      const firstWeekStart = this.getWeekStart(firstDay);
      
      // Generate weeks for this month
      let currentWeek = firstWeekStart;
      while (currentWeek.getMonth() === month) {
        const weekParam = this.formatWeekParameter(currentWeek);
        weeks.push(weekParam);
        
        // Move to next week
        currentWeek.setDate(currentWeek.getDate() + 7);
      }
    }
    
    return weeks;
  }

  /**
   * Get the start of the week (Monday) for a given date
   */
  private getWeekStart(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(date.setDate(diff));
  }

  /**
   * Format date for Forex Factory week parameter
   */
  private formatWeekParameter(date: Date): string {
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${month}${day}.${year}`;
  }

  /**
   * Build Forex Factory URL for a specific week
   */
  private buildWeekUrl(weekParam: string): string {
    return `${this.baseUrl}?week=${weekParam}&permalink=true&impacts=3,2,1,0&event_types=1,2,3,4,5,7,8,9,10,11&currencies=1,2,3,4,5,6,7,8,9`;
  }

  /**
   * Fetch data for a specific week
   */
  private async fetchWeekData(weekParam: string): Promise<ForexFactoryWeekData> {
    const url = this.buildWeekUrl(weekParam);
    const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    
    try {
      console.log(`📅 Fetching week: ${weekParam} from ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0'
        },
        timeout: 30000
      });

      if (response.status === 200) {
        const $ = cheerio.load(response.data);
        const events = this.parseCalendarEvents($);
        
        // Parse week dates from the week parameter
        const weekStart = this.parseWeekParameter(weekParam);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        return {
          weekStart,
          weekEnd,
          url,
          events,
          success: true
        };
      } else {
        return {
          weekStart: new Date(),
          weekEnd: new Date(),
          url,
          events: [],
          success: false,
          error: `HTTP ${response.status}`
        };
      }
    } catch (error: any) {
      console.error(`❌ Error fetching week ${weekParam}:`, error.message);
      return {
        weekStart: new Date(),
        weekEnd: new Date(),
        url,
        events: [],
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Parse week parameter back to Date
   */
  private parseWeekParameter(weekParam: string): Date {
    const match = weekParam.match(/([a-z]{3})(\d+)\.(\d{4})/);
    if (!match) {
      throw new Error(`Invalid week parameter: ${weekParam}`);
    }
    
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const month = monthNames.indexOf(match[1].toLowerCase());
    const day = parseInt(match[2]);
    const year = parseInt(match[3]);
    
    return new Date(year, month, day);
  }

  /**
   * Parse calendar events from HTML
   */
  private parseCalendarEvents($: cheerio.CheerioAPI): any[] {
    const events: any[] = [];
    
    // Look for calendar event rows
    $('.calendar__row').each((index, element) => {
      try {
        const $row = $(element);
        
        // Extract basic event info
        const currency = $row.find('.calendar__currency').text().trim();
        const impact = $row.find('.calendar__impact').attr('title') || 'LOW';
        const time = $row.find('.calendar__time').text().trim();
        const event = $row.find('.calendar__event').text().trim();
        const actual = $row.find('.calendar__actual').text().trim();
        const forecast = $row.find('.calendar__forecast').text().trim();
        const previous = $row.find('.calendar__previous').text().trim();
        
        if (currency && event) {
          events.push({
            currency,
            impact: this.normalizeImpact(impact),
            time,
            event,
            actual: actual || null,
            forecast: forecast || null,
            previous: previous || null,
            timestamp: new Date().toISOString()
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
    if (lower.includes('high') || lower.includes('red')) return 'HIGH';
    if (lower.includes('medium') || lower.includes('orange')) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Collect data for the entire year
   */
  async collectYearData(year: number = 2025): Promise<ComprehensiveCollectionResult> {
    console.log(`🚀 Starting comprehensive data collection for ${year}...`);
    
    const weekParams = this.generateWeekParameters(year);
    const weeklyResults: ForexFactoryWeekData[] = [];
    let totalEvents = 0;
    let successfulWeeks = 0;
    let failedWeeks = 0;
    
    console.log(`📅 Generated ${weekParams.length} weeks to collect`);
    
    // Collect data for each week with delays to avoid rate limiting
    for (let i = 0; i < weekParams.length; i++) {
      const weekParam = weekParams[i];
      console.log(`\n📊 Processing week ${i + 1}/${weekParams.length}: ${weekParam}`);
      
      const weekData = await this.fetchWeekData(weekParam);
      weeklyResults.push(weekData);
      
      if (weekData.success) {
        successfulWeeks++;
        totalEvents += weekData.events.length;
        console.log(`✅ Week ${weekParam}: ${weekData.events.length} events collected`);
      } else {
        failedWeeks++;
        console.log(`❌ Week ${weekParam}: Failed - ${weekData.error}`);
      }
      
      // Add delay between requests to avoid rate limiting
      if (i < weekParams.length - 1) {
        const delay = Math.random() * 2000 + 1000; // 1-3 seconds
        console.log(`⏳ Waiting ${Math.round(delay)}ms before next request...`);
        await this.delay(delay);
      }
    }
    
    // Calculate date range
    const startDate = weeklyResults.length > 0 ? weeklyResults[0].weekStart : new Date();
    const endDate = weeklyResults.length > 0 ? weeklyResults[weeklyResults.length - 1].weekEnd : new Date();
    
    const result: ComprehensiveCollectionResult = {
      totalWeeks: weekParams.length,
      successfulWeeks,
      failedWeeks,
      totalEvents,
      dateRange: { start: startDate, end: endDate },
      weeklyResults,
      summary: this.generateSummary(successfulWeeks, failedWeeks, totalEvents, startDate, endDate)
    };
    
    console.log('\n' + result.summary);
    return result;
  }

  /**
   * Generate summary report
   */
  private generateSummary(successful: number, failed: number, events: number, start: Date, end: Date): string {
    const total = successful + failed;
    const successRate = total > 0 ? ((successful / total) * 100).toFixed(1) : '0';
    
    return `
📊 COMPREHENSIVE DATA COLLECTION SUMMARY
==========================================
📅 Date Range: ${start.toDateString()} to ${end.toDateString()}
🌍 Total Weeks: ${total}
✅ Successful: ${successful} (${successRate}%)
❌ Failed: ${failed} (${100 - parseFloat(successRate)}%)
📰 Total Events: ${events.toLocaleString()}
📈 Success Rate: ${successRate}%
    `.trim();
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
