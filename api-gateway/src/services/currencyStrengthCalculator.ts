import { query } from '../config/database';

export interface EconomicIndicator {
  id: string;
  currency: string;
  indicator_type: string;
  indicator_name: string;
  actual_value: number | null;
  expected_value: number | null;
  previous_value: number | null;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  weight: number;
  sentiment_score: number | null;
  event_date: Date;
  source: string;
}

export interface CurrencyStrengthResult {
  currency: string;
  strength_score: number;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence_level: number;
  trend: 'STRENGTHENING' | 'WEAKENING' | 'STABLE';
  tier_breakdown: {
    tier_1_score: number;
    tier_2_score: number;
    tier_3_score: number;
    tier_4_score: number;
    tier_5_score: number;
  };
  indicators_count: number;
  last_update: Date;
}

export interface TierWeights {
  TIER_1: number; // Monetary Policy: 35%
  TIER_2: number; // Inflation & Price Stability: 25%
  TIER_3: number; // Economic Growth: 20%
  TIER_4: number; // Consumer & Business Sentiment: 15%
  TIER_5: number; // External Factors: 5%
}

export class CurrencyStrengthCalculator {
  private static readonly TIER_WEIGHTS: TierWeights = {
    TIER_1: 0.35, // 35%
    TIER_2: 0.25, // 25%
    TIER_3: 0.20, // 20%
    TIER_4: 0.15, // 15%
    TIER_5: 0.05  // 5%
  };

  private static readonly IMPACT_MULTIPLIERS = {
    HIGH: 3.0,
    MEDIUM: 1.5,
    LOW: 1.0
  };

  /**
   * Calculate currency strength for a specific currency
   */
  static async calculateCurrencyStrength(currency: string): Promise<CurrencyStrengthResult> {
    try {
      // Get all economic indicators for the currency
      const indicators = await this.getEconomicIndicators(currency);
      
      if (indicators.length === 0) {
        return this.getDefaultStrength(currency);
      }

      // Calculate sentiment scores for indicators without scores
      const scoredIndicators = indicators.map(indicator => ({
        ...indicator,
        sentiment_score: indicator.sentiment_score || this.calculateSentimentScore(indicator)
      }));

      // Calculate tier scores
      const tierScores = this.calculateTierScores(scoredIndicators);
      
      // Calculate overall strength score
      const strengthScore = this.calculateOverallStrength(tierScores);
      
      // Determine sentiment and trend
      const sentiment = this.determineSentiment(strengthScore);
      const trend = await this.determineTrend(currency, strengthScore);
      const confidenceLevel = this.calculateConfidenceLevel(scoredIndicators);

      const result: CurrencyStrengthResult = {
        currency,
        strength_score: strengthScore,
        sentiment,
        confidence_level: confidenceLevel,
        trend,
        tier_breakdown: tierScores,
        indicators_count: scoredIndicators.length,
        last_update: new Date()
      };

      // Store the result in database
      await this.storeCurrencyStrength(result);

      return result;
    } catch (error) {
      console.error(`Error calculating currency strength for ${currency}:`, error);
      return this.getDefaultStrength(currency);
    }
  }

  /**
   * Get economic indicators for a currency
   */
  private static async getEconomicIndicators(currency: string): Promise<EconomicIndicator[]> {
    const result = await query(`
      SELECT 
        id, currency, indicator_type, indicator_name, 
        actual_value, expected_value, previous_value,
        impact, weight, sentiment_score, event_date, source
      FROM economic_indicators 
      WHERE currency = $1 
      AND event_date >= NOW() - INTERVAL '90 days'
      ORDER BY event_date DESC
    `, [currency]);

    return result.rows.map(row => ({
      ...row,
      event_date: new Date(row.event_date)
    }));
  }

  /**
   * Calculate sentiment score for an indicator
   */
  private static calculateSentimentScore(indicator: EconomicIndicator): number {
    if (!indicator.actual_value || !indicator.expected_value) {
      return 50; // Neutral if no data
    }

    const deviation = ((indicator.actual_value - indicator.expected_value) / indicator.expected_value) * 100;
    
    // Sentiment scoring based on deviation from expected
    if (deviation > 10) return 85; // Strongly bullish
    if (deviation > 5) return 75;  // Bullish
    if (deviation > 2) return 65;  // Slightly bullish
    if (deviation > -2) return 55; // Neutral
    if (deviation > -5) return 45; // Slightly bearish
    if (deviation > -10) return 35; // Bearish
    return 25; // Strongly bearish
  }

  /**
   * Calculate tier scores for each economic tier
   */
  private static calculateTierScores(indicators: EconomicIndicator[]): CurrencyStrengthResult['tier_breakdown'] {
    const tierScores = {
      tier_1_score: 0,
      tier_2_score: 0,
      tier_3_score: 0,
      tier_4_score: 0,
      tier_5_score: 0
    };

    // Group indicators by tier
    const tierGroups = this.groupIndicatorsByTier(indicators);

    // Calculate weighted scores for each tier
    Object.keys(tierGroups).forEach(tier => {
      const tierIndicators = tierGroups[tier as keyof typeof tierGroups];
      if (tierIndicators.length > 0) {
        const tierScore = this.calculateTierScore(tierIndicators);
        tierScores[`${tier.toLowerCase()}_score` as keyof typeof tierScores] = tierScore;
      }
    });

    return tierScores;
  }

  /**
   * Group indicators by their tier
   */
  private static groupIndicatorsByTier(indicators: EconomicIndicator[]): Record<string, EconomicIndicator[]> {
    const tierGroups: Record<string, EconomicIndicator[]> = {
      TIER_1: [],
      TIER_2: [],
      TIER_3: [],
      TIER_4: [],
      TIER_5: []
    };

    // Get tier information from indicator_weights table
    indicators.forEach(indicator => {
      // This would ideally come from a join with indicator_weights table
      // For now, we'll use a mapping based on indicator types
      const tier = this.mapIndicatorToTier(indicator.indicator_type);
      if (tier) {
        tierGroups[tier].push(indicator);
      }
    });

    return tierGroups;
  }

  /**
   * Map indicator type to tier
   */
  private static mapIndicatorToTier(indicatorType: string): string | null {
    const tierMapping: Record<string, string> = {
      // Tier 1: Monetary Policy
      'INTEREST_RATE_DECISION': 'TIER_1',
      'FOMC_MEETING': 'TIER_1',
      'ECB_MEETING': 'TIER_1',
      'BOJ_MEETING': 'TIER_1',
      'BOE_MEETING': 'TIER_1',
      'BOC_MEETING': 'TIER_1',
      'FORWARD_GUIDANCE': 'TIER_1',
      'QUANTITATIVE_EASING': 'TIER_1',

      // Tier 2: Inflation & Price Stability
      'CPI_HEADLINE': 'TIER_2',
      'CPI_CORE': 'TIER_2',
      'PPI': 'TIER_2',
      'PCE': 'TIER_2',
      'WAGE_GROWTH': 'TIER_2',

      // Tier 3: Economic Growth
      'GDP_QUARTERLY': 'TIER_3',
      'GDP_ANNUAL': 'TIER_3',
      'NFP': 'TIER_3',
      'UNEMPLOYMENT_RATE': 'TIER_3',
      'PMI_MANUFACTURING': 'TIER_3',
      'PMI_SERVICES': 'TIER_3',
      'INDUSTRIAL_PRODUCTION': 'TIER_3',
      'CAPACITY_UTILIZATION': 'TIER_3',

      // Tier 4: Consumer & Business Sentiment
      'RETAIL_SALES': 'TIER_4',
      'CONSUMER_CONFIDENCE': 'TIER_4',
      'PERSONAL_INCOME': 'TIER_4',
      'PERSONAL_SPENDING': 'TIER_4',
      'BUSINESS_CONFIDENCE': 'TIER_4',

      // Tier 5: External Factors
      'TRADE_BALANCE': 'TIER_5',
      'CURRENT_ACCOUNT': 'TIER_5',
      'OIL_PRICES': 'TIER_5',
      'GOLD_PRICES': 'TIER_5'
    };

    return tierMapping[indicatorType] || null;
  }

  /**
   * Calculate score for a specific tier
   */
  private static calculateTierScore(indicators: EconomicIndicator[]): number {
    if (indicators.length === 0) return 0;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    indicators.forEach(indicator => {
      const impactMultiplier = this.IMPACT_MULTIPLIERS[indicator.impact];
      const timeDecay = this.calculateTimeDecay(indicator.event_date);
      
      const weightedScore = (indicator.sentiment_score || 50) * 
                           indicator.weight * 
                           impactMultiplier * 
                           timeDecay;
      
      totalWeightedScore += weightedScore;
      totalWeight += indicator.weight;
    });

    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  }

  /**
   * Calculate time decay factor
   */
  private static calculateTimeDecay(eventDate: Date): number {
    const now = new Date();
    const daysDiff = (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff <= 7) return 1.0;      // 100% weight for recent events
    if (daysDiff <= 30) return 0.8;     // 80% weight for recent events
    if (daysDiff <= 90) return 0.6;     // 60% weight for recent events
    return 0.4;                          // 40% weight for historical events
  }

  /**
   * Calculate overall strength score
   */
  private static calculateOverallStrength(tierScores: CurrencyStrengthResult['tier_breakdown']): number {
    const weightedScore = 
      tierScores.tier_1_score * this.TIER_WEIGHTS.TIER_1 +
      tierScores.tier_2_score * this.TIER_WEIGHTS.TIER_2 +
      tierScores.tier_3_score * this.TIER_WEIGHTS.TIER_3 +
      tierScores.tier_4_score * this.TIER_WEIGHTS.TIER_4 +
      tierScores.tier_5_score * this.TIER_WEIGHTS.TIER_5;

    // Normalize to 0-100 scale
    return Math.max(0, Math.min(100, weightedScore));
  }

  /**
   * Determine sentiment based on strength score
   */
  private static determineSentiment(strengthScore: number): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    if (strengthScore >= 65) return 'BULLISH';
    if (strengthScore <= 35) return 'BEARISH';
    return 'NEUTRAL';
  }

  /**
   * Determine trend by comparing with previous strength
   */
  private static async determineTrend(currency: string, currentStrength: number): Promise<'STRENGTHENING' | 'WEAKENING' | 'STABLE'> {
    try {
      const result = await query(`
        SELECT strength_score 
        FROM currency_strength 
        WHERE currency = $1 
        ORDER BY calculation_date DESC 
        LIMIT 1
      `, [currency]);

      if (result.rows.length === 0) return 'STABLE';

      const previousStrength = result.rows[0].strength_score;
      const difference = currentStrength - previousStrength;

      if (difference > 5) return 'STRENGTHENING';
      if (difference < -5) return 'WEAKENING';
      return 'STABLE';
    } catch (error) {
      console.error('Error determining trend:', error);
      return 'STABLE';
    }
  }

  /**
   * Calculate confidence level based on data quality
   */
  private static calculateConfidenceLevel(indicators: EconomicIndicator[]): number {
    if (indicators.length === 0) return 0;

    let totalConfidence = 0;
    let validIndicators = 0;

    indicators.forEach(indicator => {
      if (indicator.actual_value !== null && indicator.expected_value !== null) {
        // Higher confidence for indicators with actual vs expected data
        totalConfidence += 90;
        validIndicators++;
      } else if (indicator.sentiment_score !== null) {
        // Medium confidence for indicators with sentiment scores
        totalConfidence += 70;
        validIndicators++;
      } else {
        // Lower confidence for indicators with limited data
        totalConfidence += 40;
        validIndicators++;
      }
    });

    return validIndicators > 0 ? Math.round(totalConfidence / validIndicators) : 0;
  }

  /**
   * Store currency strength result in database
   */
  private static async storeCurrencyStrength(result: CurrencyStrengthResult): Promise<void> {
    try {
      await query(`
        INSERT INTO currency_strength (
          currency, strength_score, sentiment, confidence_level, trend,
          tier_1_score, tier_2_score, tier_3_score, tier_4_score, tier_5_score,
          indicators_count, calculation_date, last_update
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        result.currency,
        result.strength_score,
        result.sentiment,
        result.confidence_level,
        result.trend,
        result.tier_breakdown.tier_1_score,
        result.tier_breakdown.tier_2_score,
        result.tier_breakdown.tier_3_score,
        result.tier_breakdown.tier_4_score,
        result.tier_breakdown.tier_5_score,
        result.indicators_count,
        result.last_update,
        result.last_update
      ]);
    } catch (error) {
      console.error('Error storing currency strength:', error);
    }
  }

  /**
   * Get default strength when no data is available
   */
  private static getDefaultStrength(currency: string): CurrencyStrengthResult {
    return {
      currency,
      strength_score: 50,
      sentiment: 'NEUTRAL',
      confidence_level: 0,
      trend: 'STABLE',
      tier_breakdown: {
        tier_1_score: 0,
        tier_2_score: 0,
        tier_3_score: 0,
        tier_4_score: 0,
        tier_5_score: 0
      },
      indicators_count: 0,
      last_update: new Date()
    };
  }

  /**
   * Calculate strength for all currencies
   */
  static async calculateAllCurrencyStrengths(): Promise<CurrencyStrengthResult[]> {
    const currencies = ['EUR', 'USD', 'JPY', 'GBP', 'CAD'];
    const results: CurrencyStrengthResult[] = [];

    for (const currency of currencies) {
      const strength = await this.calculateCurrencyStrength(currency);
      results.push(strength);
    }

    return results;
  }

  /**
   * Get historical strength data for a currency
   */
  static async getHistoricalStrength(currency: string, days: number = 30): Promise<any[]> {
    try {
      const result = await query(`
        SELECT 
          strength_score, sentiment, confidence_level, trend,
          tier_1_score, tier_2_score, tier_3_score, tier_4_score, tier_5_score,
          calculation_date
        FROM currency_strength 
        WHERE currency = $1 
        AND calculation_date >= NOW() - INTERVAL '1 day' * $2
        ORDER BY calculation_date ASC
      `, [currency, days]);

      return result.rows;
    } catch (error) {
      console.error('Error getting historical strength:', error);
      return [];
    }
  }

  /**
   * Get currency correlations
   */
  static async getCurrencyCorrelations(): Promise<any[]> {
    try {
      const result = await query(`
        SELECT 
          currency_1, currency_2, correlation_coefficient, 
          calculation_date, period_days, confidence_level
        FROM currency_correlations 
        WHERE calculation_date = (
          SELECT MAX(calculation_date) FROM currency_correlations
        )
        ORDER BY ABS(correlation_coefficient) DESC
      `);

      return result.rows;
    } catch (error) {
      console.error('Error getting currency correlations:', error);
      return [];
    }
  }
}

export default CurrencyStrengthCalculator;

