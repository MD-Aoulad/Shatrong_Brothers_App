import { MultiSourceCollector } from './multiSourceCollector';

async function testMultiSourceCollection() {
  console.log('🧪 Testing Multi-Source Data Collection\n');
  console.log('🎯 This will test alternative data sources since Forex Factory is blocked\n');
  
  const collector = new MultiSourceCollector();
  
  try {
    // Test collection from all sources
    const results = await collector.collectFromAllSources();
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 MULTI-SOURCE COLLECTION RESULTS');
    console.log('='.repeat(70));
    
    let totalEvents = 0;
    let successfulSources = 0;
    
    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.source}`);
      console.log('   Status: ' + (result.success ? '✅ SUCCESS' : '❌ FAILED'));
      
      if (result.success) {
        successfulSources++;
        totalEvents += result.events.length;
        console.log(`   Events Collected: ${result.events.length}`);
        console.log(`   Response Time: ${result.responseTime}ms`);
        console.log(`   Status Code: ${result.statusCode}`);
        
        if (result.events.length > 0) {
          console.log('   📰 Sample Events:');
          result.events.slice(0, 3).forEach((event, eventIndex) => {
            console.log(`      ${eventIndex + 1}. ${event.currency} - ${event.event} (${event.impact})`);
            console.log(`         Sentiment: ${event.sentiment} | Confidence: ${event.confidenceScore}%`);
          });
          
          if (result.events.length > 3) {
            console.log(`      ... and ${result.events.length - 3} more events`);
          }
        }
        
        // Show currency breakdown for this source
        const currencyCounts = result.events.reduce((acc, event) => {
          acc[event.currency] = (acc[event.currency] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        if (Object.keys(currencyCounts).length > 0) {
          console.log('   💱 Currency Breakdown:');
          Object.entries(currencyCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5) // Show top 5
            .forEach(([currency, count]) => {
              console.log(`      ${currency}: ${count} events`);
            });
        }
        
      } else {
        console.log(`   Error: ${result.error}`);
        console.log(`   Response Time: ${result.responseTime}ms`);
        console.log(`   Status Code: ${result.statusCode}`);
      }
    });
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📈 COLLECTION SUMMARY');
    console.log('='.repeat(70));
    console.log(`🌍 Total Sources Tested: ${results.length}`);
    console.log(`✅ Successful Sources: ${successfulSources}`);
    console.log(`❌ Failed Sources: ${results.length - successfulSources}`);
    console.log(`📰 Total Events Collected: ${totalEvents.toLocaleString()}`);
    console.log(`📊 Success Rate: ${((successfulSources / results.length) * 100).toFixed(1)}%`);
    
    if (totalEvents > 0) {
      // Aggregate all events for analysis
      const allEvents = results.flatMap(r => r.events);
      
      console.log('\n🎯 OVERALL DATA ANALYSIS:');
      
      // Currency distribution
      const currencyCounts = allEvents.reduce((acc, event) => {
        acc[event.currency] = (acc[event.currency] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log('💱 Top Currencies by Event Count:');
      Object.entries(currencyCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([currency, count], index) => {
          console.log(`   ${index + 1}. ${currency}: ${count} events`);
        });
      
      // Impact distribution
      const impactCounts = allEvents.reduce((acc, event) => {
        acc[event.impact] = (acc[event.impact] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log('\n🎯 Impact Level Distribution:');
      Object.entries(impactCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([impact, count]) => {
          const percentage = ((count / totalEvents) * 100).toFixed(1);
          console.log(`   ${impact}: ${count} events (${percentage}%)`);
        });
      
      // Sentiment distribution
      const sentimentCounts = allEvents.reduce((acc, event) => {
        acc[event.sentiment] = (acc[event.sentiment] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log('\n📊 Sentiment Distribution:');
      Object.entries(sentimentCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([sentiment, count]) => {
          const percentage = ((count / totalEvents) * 100).toFixed(1);
          console.log(`   ${sentiment}: ${count} events (${percentage}%)`);
        });
      
      // Source distribution
      const sourceCounts = allEvents.reduce((acc, event) => {
        acc[event.source] = (acc[event.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log('\n📰 Events by Source:');
      Object.entries(sourceCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([source, count]) => {
          const percentage = ((count / totalEvents) * 100).toFixed(1);
          console.log(`   ${source}: ${count} events (${percentage}%)`);
        });
    }
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('• If successful: Integrate with main collection service');
    console.log('• Store events in database for currency power calculation');
    console.log('• Set up automated daily collection from multiple sources');
    console.log('• Consider adding more data sources for comprehensive coverage');
    
  } catch (error: any) {
    console.error('\n❌ Multi-source collection failed:', error.message);
  }
}

if (require.main === module) {
  testMultiSourceCollection().catch(console.error);
}

export { testMultiSourceCollection };
