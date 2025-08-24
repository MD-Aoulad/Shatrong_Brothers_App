import { ComprehensiveDataCollector } from './comprehensiveDataCollector';
import { Pool } from 'pg';

interface CollectedEvent {
  currency: string;
  impact: string;
  time: string;
  event: string;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
  timestamp: string;
  weekStart: Date;
  weekEnd: Date;
  source: string;
}

class SpecificWeekCollector {
  private collector: ComprehensiveDataCollector;
  private pool: Pool;

  constructor() {
    this.collector = new ComprehensiveDataCollector();
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@postgres:5432/forex_app'
    });
  }

  /**
   * Collect data from specific weeks to demonstrate the system
   */
  async collectSpecificWeeks() {
    console.log('🎯 Collecting Data from Specific Weeks\n');
    
    // Define specific weeks to test (covering different months)
    const testWeeks = [
      'jan6.2025',   // January 6-12, 2025
      'feb3.2025',   // February 3-9, 2025
      'mar3.2025',   // March 3-9, 2025
      'apr7.2025',   // April 7-13, 2025
      'may5.2025',   // May 5-11, 2025
      'jun2.2025',   // June 2-8, 2025
      'jul7.2025',   // July 7-13, 2025
      'aug4.2025',   // August 4-10, 2025 (current week)
      'sep1.2025',   // September 1-7, 2025
      'oct6.2025',   // October 6-12, 2025
      'nov3.2025',   // November 3-9, 2025
      'dec1.2025'    // December 1-7, 2025
    ];

    const allEvents: CollectedEvent[] = [];
    let successfulWeeks = 0;
    let failedWeeks = 0;

    console.log(`📅 Testing ${testWeeks.length} weeks across different months of 2025\n`);

    for (let i = 0; i < testWeeks.length; i++) {
      const weekParam = testWeeks[i];
      console.log(`\n🔍 Week ${i + 1}/${testWeeks.length}: ${weekParam}`);
      
      try {
        // Use the comprehensive collector's fetch method
        const weekData = await (this.collector as any).fetchWeekData(weekParam);
        
        if (weekData.success && weekData.events.length > 0) {
          successfulWeeks++;
          console.log(`✅ Success: ${weekData.events.length} events collected`);
          
          // Transform events to include week information
          const transformedEvents = weekData.events.map((event: any) => ({
            ...event,
            weekStart: weekData.weekStart,
            weekEnd: weekData.weekEnd,
            source: 'Forex Factory Calendar'
          }));
          
          allEvents.push(...transformedEvents);
          
                     // Show sample events
           if (transformedEvents.length > 0) {
             console.log(`📊 Sample events from ${weekParam}:`);
             transformedEvents.slice(0, 3).forEach((event: CollectedEvent, index: number) => {
               console.log(`   ${index + 1}. ${event.currency} - ${event.event} (${event.impact})`);
             });
             if (transformedEvents.length > 3) {
               console.log(`   ... and ${transformedEvents.length - 3} more events`);
             }
           }
        } else {
          failedWeeks++;
          console.log(`❌ Failed: ${weekData.error || 'No events found'}`);
        }
        
        // Add delay between requests
        if (i < testWeeks.length - 1) {
          const delay = Math.random() * 2000 + 1000; // 1-3 seconds
          console.log(`⏳ Waiting ${Math.round(delay)}ms...`);
          await this.delay(delay);
        }
        
      } catch (error: any) {
        failedWeeks++;
        console.log(`❌ Error: ${error.message}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 COLLECTION SUMMARY');
    console.log('='.repeat(60));
    console.log(`🌍 Total Weeks Tested: ${testWeeks.length}`);
    console.log(`✅ Successful Weeks: ${successfulWeeks}`);
    console.log(`❌ Failed Weeks: ${failedWeeks}`);
    console.log(`📰 Total Events Collected: ${allEvents.length}`);
    console.log(`📈 Success Rate: ${((successfulWeeks / testWeeks.length) * 100).toFixed(1)}%`);
    
    if (allEvents.length > 0) {
      console.log('\n📅 DATE RANGE COVERED:');
      const dates = allEvents.map(e => e.weekStart).sort((a, b) => a.getTime() - b.getTime());
      console.log(`   Earliest: ${dates[0].toDateString()}`);
      console.log(`   Latest: ${dates[dates.length - 1].toDateString()}`);
      
      console.log('\n💱 CURRENCY BREAKDOWN:');
      const currencyCounts = allEvents.reduce((acc, event) => {
        acc[event.currency] = (acc[event.currency] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      Object.entries(currencyCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([currency, count]) => {
          console.log(`   ${currency}: ${count} events`);
        });
      
      console.log('\n🎯 IMPACT BREAKDOWN:');
      const impactCounts = allEvents.reduce((acc, event) => {
        acc[event.impact] = (acc[event.impact] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      Object.entries(impactCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([impact, count]) => {
          console.log(`   ${impact}: ${count} events`);
        });
    }

    console.log('\n🚀 NEXT STEPS:');
    console.log('• Run full year collection: npm run collect:comprehensive');
    console.log('• Store events in database for currency power calculation');
    console.log('• Set up automated daily collection');
    
    return {
      totalWeeks: testWeeks.length,
      successfulWeeks,
      failedWeeks,
      totalEvents: allEvents.length,
      events: allEvents
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async close() {
    await this.pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  const collector = new SpecificWeekCollector();
  
  collector.collectSpecificWeeks()
    .then(result => {
      console.log('\n✅ Collection completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Collection failed:', error);
      process.exit(1);
    })
    .finally(() => {
      collector.close();
    });
}

export { SpecificWeekCollector };
