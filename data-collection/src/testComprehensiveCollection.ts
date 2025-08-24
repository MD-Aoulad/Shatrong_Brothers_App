import { ComprehensiveDataCollector } from './comprehensiveDataCollector';

async function testComprehensiveCollection() {
  console.log('🧪 Testing Comprehensive Data Collection System\n');
  
  const collector = new ComprehensiveDataCollector();
  
  // Test 1: Show generated week parameters
  console.log('📅 TEST 1: Generated Week Parameters for 2025');
  console.log('==============================================');
  
  // We'll test with a smaller range first (just a few months)
  const testYear = 2025;
  const testMonths = ['jan', 'feb', 'mar', 'apr', 'may'];
  
  for (const month of testMonths) {
    const monthIndex = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(month);
    const firstDay = new Date(testYear, monthIndex, 1);
    
    // Generate weeks for this month
    let currentWeek = new Date(firstDay);
    currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1); // Start of week (Monday)
    
    let weekCount = 0;
    while (currentWeek.getMonth() === monthIndex && weekCount < 5) { // Limit to 5 weeks per month for demo
      const weekParam = `${month}${currentWeek.getDate()}.${testYear}`;
      const url = `https://www.forexfactory.com/calendar?week=${weekParam}&permalink=true&impacts=3,2,1,0&event_types=1,2,3,4,5,7,8,9,10,11&currencies=1,2,3,4,5,6,7,8,9`;
      
      console.log(`📅 ${month.toUpperCase()} ${currentWeek.getDate()}, ${testYear}:`);
      console.log(`   Week Parameter: ${weekParam}`);
      console.log(`   URL: ${url}`);
      console.log(`   Date Range: ${currentWeek.toDateString()} - ${new Date(currentWeek.getTime() + 6 * 24 * 60 * 60 * 1000).toDateString()}`);
      console.log('');
      
      currentWeek.setDate(currentWeek.getDate() + 7);
      weekCount++;
    }
  }
  
  // Test 2: Show how the collector would work
  console.log('🚀 TEST 2: Comprehensive Collector Demo');
  console.log('=======================================');
  console.log('The comprehensive collector will:');
  console.log('• Generate week parameters for each month of 2025');
  console.log('• Fetch data from each week with proper delays');
  console.log('• Handle rate limiting and Cloudflare protection');
  console.log('• Parse economic events from HTML responses');
  console.log('• Provide detailed success/failure reporting');
  console.log('');
  
  // Test 3: Show sample URL variations
  console.log('🔗 TEST 3: Sample URL Variations');
  console.log('=================================');
  
  const sampleWeeks = [
    'jan6.2025',   // First week of January
    'feb3.2025',   // First week of February  
    'mar3.2025',   // First week of March
    'apr7.2025',   // First week of April
    'may5.2025',   // First week of May
    'jun2.2025',   // First week of June
    'jul7.2025',   // First week of July
    'aug4.2025',   // First week of August
    'sep1.2025',   // First week of September
    'oct6.2025',   // First week of October
    'nov3.2025',   // First week of November
    'dec1.2025'    // First week of December
  ];
  
  sampleWeeks.forEach((week, index) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const monthIndex = Math.floor(index / 4); // Rough mapping
    
    console.log(`📅 ${monthNames[monthIndex] || 'Unknown'} 2025:`);
    console.log(`   Week: ${week}`);
    console.log(`   URL: https://www.forexfactory.com/calendar?week=${week}&permalink=true&impacts=3,2,1,0&event_types=1,2,3,4,5,7,8,9,10,11&currencies=1,2,3,4,5,6,7,8,9`);
    console.log('');
  });
  
  console.log('💡 KEY INSIGHTS:');
  console.log('==================');
  console.log('• Each week parameter (e.g., "jan6.2025") represents a Monday start');
  console.log('• The system automatically generates all weeks for the entire year');
  console.log('• Built-in delays prevent rate limiting and Cloudflare detection');
  console.log('• Comprehensive error handling for failed requests');
  console.log('• Detailed reporting on success rates and data coverage');
  console.log('');
  
  console.log('🚀 Ready to collect comprehensive 2025 data!');
  console.log('Run: npm run collect:comprehensive to start full collection');
}

if (require.main === module) {
  testComprehensiveCollection().catch(console.error);
}

export { testComprehensiveCollection };
