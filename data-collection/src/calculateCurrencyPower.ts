import { Pool } from 'pg';
import { CurrencyPowerCalculator } from './currencyPowerCalculator';

async function calculateCurrencyPowerFromDatabase() {
  console.log('🚀 Starting Currency Power Calculation from Database...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@postgres:5432/forex_app'
  });

  try {
    // Connect to database
    await pool.connect();
    console.log('✅ Connected to database');

    // Get all economic events from 2025
    const query = `
      SELECT 
        currency,
        event_type,
        title,
        description,
        event_date,
        impact,
        sentiment,
        confidence_score,
        source,
        url
      FROM economic_events 
      WHERE event_date >= '2025-01-01'
      ORDER BY event_date DESC
    `;

    const result = await pool.query(query);
    const events = result.rows;

    console.log(`📊 Found ${events.length} events in database from 2025`);

    if (events.length === 0) {
      console.log('⚠️ No events found in database');
      return;
    }

    // Transform database events to match our news format
    const newsData = events.map(event => ({
      currencies: [event.currency],
      currency: event.currency,
      title: event.title,
      description: event.description,
      publishedAt: event.event_date,
      source: event.source,
      url: event.url,
      impact: event.impact,
      sentiment: event.sentiment,
      confidenceScore: event.confidence_score
    }));

    // Calculate currency power scores
    const calculator = new CurrencyPowerCalculator();
    const currencyScores = calculator.calculateCurrencyPower(newsData);

    // Generate and display detailed report
    const report = calculator.generateDetailedReport(currencyScores);
    console.log('\n' + report);

    // Display summary statistics
    console.log('\n📈 **SUMMARY STATISTICS** 📈');
    console.log(`Total Events Analyzed: ${events.length}`);
    console.log(`Currencies Analyzed: ${currencyScores.length}`);
    
    // Show top 5 currencies
    console.log('\n🏆 **TOP 5 CURRENCIES** 🏆');
    currencyScores.slice(0, 5).forEach(score => {
      console.log(`${score.rank}. ${score.currency}: ${score.totalScore}/100 (${score.strength})`);
      console.log(`   Trend: ${score.trend} | News: ${score.newsCount} | Sentiment: ${score.sentimentScore}/100`);
      console.log(`   Impact: ${score.impactScore}/100 | Confidence: ${score.confidenceScore}/100`);
    });

    // Show currency distribution
    console.log('\n📊 **CURRENCY DISTRIBUTION** 📊');
    const currencyCounts = events.reduce((acc, event) => {
      acc[event.currency] = (acc[event.currency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(currencyCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .forEach(([currency, count]) => {
        console.log(`${currency}: ${count} events`);
      });

    // Show sentiment distribution
    console.log('\n😊 **SENTIMENT DISTRIBUTION** 😊');
    const sentimentCounts = events.reduce((acc, event) => {
      acc[event.sentiment] = (acc[event.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(sentimentCounts).forEach(([sentiment, count]) => {
      const emoji = sentiment === 'BULLISH' ? '📈' : sentiment === 'BEARISH' ? '📉' : '➡️';
      console.log(`${emoji} ${sentiment}: ${count} events`);
    });

    // Show impact distribution
    console.log('\n💥 **IMPACT DISTRIBUTION** 💥');
    const impactCounts = events.reduce((acc, event) => {
      acc[event.impact] = (acc[event.impact] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(impactCounts).forEach(([impact, count]) => {
      const emoji = impact === 'HIGH' ? '🔥' : impact === 'MEDIUM' ? '⚡' : '💤';
      console.log(`${emoji} ${impact}: ${count} events`);
    });

    console.log('\n✅ Currency Power Calculation Completed Successfully!');

  } catch (error) {
    console.error('❌ Error calculating currency power:', error);
  } finally {
    await pool.end();
  }
}

// Run the calculation if this file is executed directly
if (require.main === module) {
  calculateCurrencyPowerFromDatabase();
}

export { calculateCurrencyPowerFromDatabase };
