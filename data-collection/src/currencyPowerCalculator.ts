export interface CurrencyPowerScore {
  currency: string;
  totalScore: number;
  sentimentScore: number;
  impactScore: number;
  confidenceScore: number;
  newsCount: number;
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  highImpactCount: number;
  mediumImpactCount: number;
  lowImpactCount: number;
  averageConfidence: number;
  strength: 'STRONG' | 'MODERATE' | 'WEAK';
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  rank: number;
}

export interface NewsAnalysis {
  currency: string;
  news: any[];
  totalCount: number;
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  highImpactCount: number;
  mediumImpactCount: number;
  lowImpactCount: number;
  averageConfidence: number;
}

export class CurrencyPowerCalculator {
  
  calculateCurrencyPower(newsData: any[]): CurrencyPowerScore[] {
    console.log('🧮 Calculating currency power scores...');
    
    // Group news by currency
    const currencyGroups = this.groupNewsByCurrency(newsData);
    
    // Calculate scores for each currency
    const currencyScores: CurrencyPowerScore[] = [];
    
    for (const [currency, analysis] of Object.entries(currencyGroups)) {
      const score = this.calculateSingleCurrencyScore(currency, analysis);
      currencyScores.push(score);
    }
    
    // Sort by total score (highest first) and assign ranks
    currencyScores.sort((a, b) => b.totalScore - a.totalScore);
    currencyScores.forEach((score, index) => {
      score.rank = index + 1;
    });
    
    console.log(`✅ Currency power calculation completed for ${currencyScores.length} currencies`);
    return currencyScores;
  }

  private groupNewsByCurrency(newsData: any[]): Record<string, NewsAnalysis> {
    const groups: Record<string, NewsAnalysis> = {};
    
    for (const news of newsData) {
      const currencies = news.currencies || [news.currency] || ['USD'];
      
      for (const currency of currencies) {
        if (!groups[currency]) {
          groups[currency] = {
            currency,
            news: [],
            totalCount: 0,
            bullishCount: 0,
            bearishCount: 0,
            neutralCount: 0,
            highImpactCount: 0,
            mediumImpactCount: 0,
            lowImpactCount: 0,
            averageConfidence: 0
          };
        }
        
        groups[currency].news.push(news);
        groups[currency].totalCount++;
        
        // Count sentiment
        switch (news.sentiment) {
          case 'BULLISH':
            groups[currency].bullishCount++;
            break;
          case 'BEARISH':
            groups[currency].bearishCount++;
            break;
          case 'NEUTRAL':
            groups[currency].neutralCount++;
            break;
        }
        
        // Count impact
        switch (news.impact) {
          case 'HIGH':
            groups[currency].highImpactCount++;
            break;
          case 'MEDIUM':
            groups[currency].mediumImpactCount++;
            break;
          case 'LOW':
            groups[currency].lowImpactCount++;
            break;
        }
      }
    }
    
    // Calculate average confidence for each currency
    for (const currency of Object.values(groups)) {
      const totalConfidence = currency.news.reduce((sum, news) => sum + (news.confidenceScore || 0), 0);
      currency.averageConfidence = currency.totalCount > 0 ? totalConfidence / currency.totalCount : 0;
    }
    
    return groups;
  }

  private calculateSingleCurrencyScore(currency: string, analysis: NewsAnalysis): CurrencyPowerScore {
    // Sentiment Score (0-100)
    const sentimentScore = this.calculateSentimentScore(analysis);
    
    // Impact Score (0-100)
    const impactScore = this.calculateImpactScore(analysis);
    
    // Confidence Score (0-100)
    const confidenceScore = Math.round(analysis.averageConfidence);
    
    // Total Score (weighted average)
    const totalScore = Math.round(
      (sentimentScore * 0.4) + (impactScore * 0.35) + (confidenceScore * 0.25)
    );
    
    // Determine strength level
    const strength = this.determineStrength(totalScore);
    
    // Determine trend
    const trend = this.determineTrend(analysis);
    
    return {
      currency,
      totalScore,
      sentimentScore,
      impactScore,
      confidenceScore,
      newsCount: analysis.totalCount,
      bullishCount: analysis.bullishCount,
      bearishCount: analysis.bearishCount,
      neutralCount: analysis.neutralCount,
      highImpactCount: analysis.highImpactCount,
      mediumImpactCount: analysis.mediumImpactCount,
      lowImpactCount: analysis.lowImpactCount,
      averageConfidence: analysis.averageConfidence,
      strength,
      trend,
      rank: 0 // Will be set later
    };
  }

  private calculateSentimentScore(analysis: NewsAnalysis): number {
    if (analysis.totalCount === 0) return 50;
    
    const bullishRatio = analysis.bullishCount / analysis.totalCount;
    const bearishRatio = analysis.bearishCount / analysis.totalCount;
    const neutralRatio = analysis.neutralCount / analysis.totalCount;
    
    // Sentiment score: 0-100
    // 100 = All bullish, 0 = All bearish, 50 = All neutral
    let score = 50; // Start neutral
    
    if (bullishRatio > bearishRatio) {
      // More bullish than bearish
      score = 50 + (bullishRatio - bearishRatio) * 50;
    } else if (bearishRatio > bullishRatio) {
      // More bearish than bullish
      score = 50 - (bearishRatio - bullishRatio) * 50;
    }
    
    // Adjust for neutral news (reduce extreme scores)
    if (neutralRatio > 0.5) {
      score = 50 + (score - 50) * 0.5;
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculateImpactScore(analysis: NewsAnalysis): number {
    if (analysis.totalCount === 0) return 50;
    
    const highImpactRatio = analysis.highImpactCount / analysis.totalCount;
    const mediumImpactRatio = analysis.mediumImpactCount / analysis.totalCount;
    const lowImpactRatio = analysis.lowImpactCount / analysis.totalCount;
    
    // Impact score: 0-100
    // 100 = All high impact, 50 = All medium impact, 0 = All low impact
    const score = (highImpactRatio * 100) + (mediumImpactRatio * 50) + (lowImpactRatio * 0);
    
    return Math.round(score);
  }

  private determineStrength(totalScore: number): 'STRONG' | 'MODERATE' | 'WEAK' {
    if (totalScore >= 75) return 'STRONG';
    if (totalScore >= 50) return 'MODERATE';
    return 'WEAK';
  }

  private determineTrend(analysis: NewsAnalysis): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    if (analysis.totalCount === 0) return 'NEUTRAL';
    
    const bullishRatio = analysis.bullishCount / analysis.totalCount;
    const bearishRatio = analysis.bearishCount / analysis.totalCount;
    
    if (bullishRatio > bearishRatio && bullishRatio > 0.4) return 'BULLISH';
    if (bearishRatio > bullishRatio && bearishRatio > 0.4) return 'BEARISH';
    return 'NEUTRAL';
  }

  generateDetailedReport(currencyScores: CurrencyPowerScore[]): string {
    let report = '📊 **CURRENCY POWER ANALYSIS REPORT** 📊\n\n';
    
    report += `**Analysis Date:** ${new Date().toISOString()}\n`;
    report += `**Total Currencies Analyzed:** ${currencyScores.length}\n\n`;
    
    // Top performers
    report += '🏆 **TOP PERFORMERS** 🏆\n';
    const top3 = currencyScores.slice(0, 3);
    for (const score of top3) {
      report += `${score.rank}. **${score.currency}** - Score: ${score.totalScore}/100 (${score.strength})\n`;
      report += `   Trend: ${score.trend} | News: ${score.newsCount} | Sentiment: ${score.sentimentScore}/100\n`;
      report += `   Impact: ${score.impactScore}/100 | Confidence: ${score.confidenceScore}/100\n\n`;
    }
    
    // Detailed breakdown
    report += '📈 **DETAILED BREAKDOWN** 📈\n';
    for (const score of currencyScores) {
      report += `**${score.currency}** (Rank #${score.rank})\n`;
      report += `  Total Score: ${score.totalScore}/100 (${score.strength})\n`;
      report += `  Trend: ${score.trend}\n`;
      report += `  News Count: ${score.newsCount}\n`;
      report += `  Sentiment: ${score.bullishCount}B / ${score.bearishCount}E / ${score.neutralCount}N\n`;
      report += `  Impact: ${score.highImpactCount}H / ${score.mediumImpactCount}M / ${score.lowImpactCount}L\n`;
      report += `  Confidence: ${score.confidenceScore}/100\n\n`;
    }
    
    return report;
  }
}
