import express from 'express';
import CurrencyStrengthCalculator from '../services/currencyStrengthCalculator';
import { query } from '../config/database';

const router = express.Router();

// Get currency strength for all currencies
router.get('/', async (req, res) => {
  try {
    console.log('📊 Calculating currency strengths for all currencies...');
    
    const strengths = await CurrencyStrengthCalculator.calculateAllCurrencyStrengths();
    
    console.log(`✅ Calculated strengths for ${strengths.length} currencies`);
    
    return res.json({
      success: true,
      data: strengths,
      timestamp: new Date().toISOString(),
      calculation_method: 'Enhanced Economic Framework',
      description: 'Currency strength based on 50+ economic indicators across 5 tiers'
    });
  } catch (error) {
    console.error('❌ Error calculating currency strengths:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to calculate currency strengths',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get currency strength for a specific currency
router.get('/:currency', async (req, res) => {
  try {
    const { currency } = req.params;
    const validCurrencies = ['EUR', 'USD', 'JPY', 'GBP', 'CAD'];
    
    if (!validCurrencies.includes(currency.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid currency',
        valid_currencies: validCurrencies
      });
    }

    console.log(`📊 Calculating currency strength for ${currency}...`);
    
    const strength = await CurrencyStrengthCalculator.calculateCurrencyStrength(currency.toUpperCase());
    
    console.log(`✅ Calculated strength for ${currency}: ${strength.strength_score}/100`);
    
    return res.json({
      success: true,
      data: strength,
      timestamp: new Date().toISOString(),
      calculation_method: 'Enhanced Economic Framework',
      description: `Currency strength for ${currency} based on economic indicators`
    });
  } catch (error) {
    console.error(`❌ Error calculating currency strength for ${req.params.currency}:`, error);
    return res.status(500).json({
      success: false,
      error: 'Failed to calculate currency strength',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get historical strength data for a currency
router.get('/:currency/history', async (req, res) => {
  try {
    const { currency } = req.params;
    const { days = 30 } = req.query;
    const validCurrencies = ['EUR', 'USD', 'JPY', 'GBP', 'CAD'];
    
    if (!validCurrencies.includes(currency.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid currency',
        valid_currencies: validCurrencies
      });
    }

    const daysNumber = parseInt(days as string) || 30;
    
    if (daysNumber < 1 || daysNumber > 365) {
      return res.status(400).json({
        success: false,
        error: 'Invalid days parameter',
        valid_range: '1-365 days'
      });
    }

    console.log(`📈 Getting historical strength data for ${currency} (${daysNumber} days)...`);
    
    const history = await CurrencyStrengthCalculator.getHistoricalStrength(currency.toUpperCase(), daysNumber);
    
    console.log(`✅ Retrieved ${history.length} historical data points for ${currency}`);
    
    return res.json({
      success: true,
      data: {
        currency: currency.toUpperCase(),
        period_days: daysNumber,
        data_points: history.length,
        history: history
      },
      timestamp: new Date().toISOString(),
      description: `Historical strength data for ${currency} over ${daysNumber} days`
    });
  } catch (error) {
    console.error(`❌ Error getting historical strength for ${req.params.currency}:`, error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get historical strength data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get currency correlations
router.get('/correlations/all', async (req, res) => {
  try {
    console.log('🔗 Getting currency correlations...');
    
    const correlations = await CurrencyStrengthCalculator.getCurrencyCorrelations();
    
    console.log(`✅ Retrieved ${correlations.length} currency correlations`);
    
    return res.json({
      success: true,
      data: {
        correlations: correlations,
        total_pairs: correlations.length,
        calculation_date: correlations[0]?.calculation_date || null,
        period_days: correlations[0]?.period_days || null
      },
      timestamp: new Date().toISOString(),
      description: 'Cross-currency correlation analysis'
    });
  } catch (error) {
    console.error('❌ Error getting currency correlations:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get currency correlations',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get economic indicators for a currency
router.get('/:currency/indicators', async (req, res) => {
  try {
    const { currency } = req.params;
    const { days = 90, tier } = req.query;
    const validCurrencies = ['EUR', 'USD', 'JPY', 'GBP', 'CAD'];
    
    if (!validCurrencies.includes(currency.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid currency',
        valid_currencies: validCurrencies
      });
    }

    const daysNumber = parseInt(days as string) || 90;
    
    if (daysNumber < 1 || daysNumber > 365) {
      return res.status(400).json({
        success: false,
        error: 'Invalid days parameter',
        valid_range: '1-365 days'
      });
    }

    let sqlQuery = `
      SELECT 
        ei.*,
        iw.tier,
        iw.category,
        iw.subcategory
      FROM economic_indicators ei
      LEFT JOIN indicator_weights iw ON ei.indicator_type = iw.indicator_type
      WHERE ei.currency = $1 
      AND ei.event_date >= NOW() - INTERVAL '1 day' * $2
    `;
    
    const params: (string | number)[] = [currency.toUpperCase(), daysNumber];
    
    if (tier && ['TIER_1', 'TIER_2', 'TIER_3', 'TIER_4', 'TIER_5'].includes(tier as string)) {
      sqlQuery += ` AND iw.tier = $3`;
      params.push(tier as string);
    }
    
    sqlQuery += ` ORDER BY ei.event_date DESC`;

    console.log(`📊 Getting economic indicators for ${currency} (${daysNumber} days)...`);
    
    const result = await query(sqlQuery, params);
    
    console.log(`✅ Retrieved ${result.rows.length} economic indicators for ${currency}`);
    
    return res.json({
      success: true,
      data: {
        currency: currency.toUpperCase(),
        period_days: daysNumber,
        indicators_count: result.rows.length,
        indicators: result.rows
      },
      timestamp: new Date().toISOString(),
      description: `Economic indicators for ${currency} over ${daysNumber} days`
    });
  } catch (error) {
    console.error(`❌ Error getting economic indicators for ${req.params.currency}:`, error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get economic indicators',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get economic calendar for upcoming events
router.get('/calendar/upcoming', async (req, res) => {
  try {
    const { currency, days = 30 } = req.query;
    const daysNumber = parseInt(days as string) || 30;
    
    if (daysNumber < 1 || daysNumber > 90) {
      return res.status(400).json({
        success: false,
        error: 'Invalid days parameter',
        valid_range: '1-90 days'
      });
    }

    let sqlQuery = `
      SELECT 
        ec.*,
        iw.tier,
        iw.category,
        iw.subcategory
      FROM economic_calendar ec
      LEFT JOIN indicator_weights iw ON ec.indicator_type = iw.indicator_type
      WHERE ec.event_date >= NOW() 
      AND ec.event_date <= NOW() + INTERVAL '1 day' * $1
    `;
    
    const params: (string | number)[] = [daysNumber];
    
    if (currency && ['EUR', 'USD', 'JPY', 'GBP', 'CAD'].includes(currency as string)) {
      sqlQuery += ` AND ec.currency = $2`;
      params.push(currency as string);
    }
    
    sqlQuery += ` ORDER BY ec.event_date ASC, ec.weight DESC`;

    console.log(`📅 Getting economic calendar for next ${daysNumber} days...`);
    
    const result = await query(sqlQuery, params);
    
    console.log(`✅ Retrieved ${result.rows.length} upcoming economic events`);
    
    return res.json({
      success: true,
      data: {
        period_days: daysNumber,
        events_count: result.rows.length,
        events: result.rows
      },
      timestamp: new Date().toISOString(),
      description: `Economic calendar for next ${daysNumber} days`
    });
  } catch (error) {
    console.error('❌ Error getting economic calendar:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get economic calendar',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Force recalculation of all currency strengths
router.post('/recalculate', async (req, res) => {
  try {
    console.log('🔄 Force recalculating all currency strengths...');
    
    const strengths = await CurrencyStrengthCalculator.calculateAllCurrencyStrengths();
    
    console.log(`✅ Recalculated strengths for ${strengths.length} currencies`);
    
    return res.json({
      success: true,
      message: 'Currency strengths recalculated successfully',
      data: {
        currencies_processed: strengths.length,
        currencies: strengths.map(s => s.currency),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error recalculating currency strengths:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to recalculate currency strengths',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

