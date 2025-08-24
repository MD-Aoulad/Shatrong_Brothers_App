import { EnhancedForexFactoryCollector } from './enhancedForexFactoryCollector';

async function testEnhancedCollector() {
  console.log('🧪 Testing Enhanced Forex Factory Collector\n');
  
  const collector = new EnhancedForexFactoryCollector();
  
  // Test weeks from different months
  const testWeeks = [
    'jan6.2025',   // January
    'feb3.2025',   // February
    'mar3.2025',   // March
    'aug4.2025'    // August (current)
  ];
  
  console.log(`🎯 Testing ${testWeeks.length} weeks with enhanced anti-detection strategies\n`);
  
  for (let i = 0; i < testWeeks.length; i++) {
    const weekParam = testWeeks[i];
    console.log(`\n📅 Testing Week ${i + 1}/${testWeeks.length}: ${weekParam}`);
    console.log('='.repeat(50));
    
    try {
      const result = await collector.collectWithMultipleStrategies(weekParam);
      
      if (result.success) {
        console.log(`✅ SUCCESS! Collected ${result.events.length} events`);
        console.log(`📊 Response Time: ${result.responseTime}ms`);
        console.log(`📡 Status Code: ${result.statusCode}`);
        
        if (result.events.length > 0) {
          console.log('\n📰 Sample Events:');
          result.events.slice(0, 3).forEach((event, index) => {
            console.log(`   ${index + 1}. ${event.currency} - ${event.event} (${event.impact})`);
          });
          
          if (result.events.length > 3) {
            console.log(`   ... and ${result.events.length - 3} more events`);
          }
        }
        
        // Show currency breakdown
        const currencyCounts = result.events.reduce((acc, event) => {
          acc[event.currency] = (acc[event.currency] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        console.log('\n💱 Currency Breakdown:');
        Object.entries(currencyCounts)
          .sort(([,a], [,b]) => b - a)
          .forEach(([currency, count]) => {
            console.log(`   ${currency}: ${count} events`);
          });
        
        // Show impact breakdown
        const impactCounts = result.events.reduce((acc, event) => {
          acc[event.impact] = (acc[event.impact] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        console.log('\n🎯 Impact Breakdown:');
        Object.entries(impactCounts)
          .sort(([,a], [,b]) => b - a)
          .forEach(([impact, count]) => {
            console.log(`   ${impact}: ${count} events`);
          });
        
      } else {
        console.log(`❌ FAILED: ${result.error}`);
        console.log(`📊 Response Time: ${result.responseTime}ms`);
        console.log(`📡 Status Code: ${result.statusCode}`);
      }
      
    } catch (error: any) {
      console.log(`❌ ERROR: ${error.message}`);
    }
    
    // Add delay between weeks
    if (i < testWeeks.length - 1) {
      console.log('\n⏳ Waiting 5 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 ENHANCED COLLECTOR TEST COMPLETED');
  console.log('='.repeat(60));
  console.log('💡 Key Features Tested:');
  console.log('   • Multiple anti-detection strategies');
  console.log('   • Enhanced headers and user agents');
  console.log('   • Session management and cookies');
  console.log('   • Progressive header approach');
  console.log('   • Human-like browsing simulation');
  console.log('\n🚀 Next Steps:');
  console.log('   • If successful: Integrate with main collection service');
  console.log('   • If failed: Consider alternative data sources');
  console.log('   • Always: Respect rate limits and terms of service');
}

if (require.main === module) {
  testEnhancedCollector().catch(console.error);
}

export { testEnhancedCollector };
