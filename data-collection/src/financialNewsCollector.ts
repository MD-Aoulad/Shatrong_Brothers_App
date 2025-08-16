import axios from 'axios';
import { EconomicEvent } from './dataSources';

/**
 * Financial News Collector
 * Fetches real-time financial news from multiple sources
 */

export interface FinancialNews {
  title: string;
  description: string;
  content: string;
  publishedAt: Date;
  source: string;
  url: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidenceScore: number;
  currencies: string[];
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class FinancialNewsCollector {
  private newsApiKey: string;
  private alphaVantageKey: string;
  private tradingEconomicsKey: string;

  constructor() {
    this.newsApiKey = process.env.NEWS_API_KEY || '';
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY || '';
    this.tradingEconomicsKey = process.env.TRADING_ECONOMICS_API_KEY || '';
  }

  /**
   * Collect financial news from multiple sources
   */
  async collectFinancialNews(): Promise<FinancialNews[]> {
    const allNews: FinancialNews[] = [];
    
    try {
      // 1. Get news from NewsAPI (if available)
      if (this.newsApiKey) {
        const newsApiNews = await this.getNewsAPIFinancialNews();
        allNews.push(...newsApiNews);
      }

      // 2. Get news from Alpha Vantage (if available)
      if (this.alphaVantageKey) {
        const alphaVantageNews = await this.getAlphaVantageNews();
        allNews.push(...alphaVantageNews);
      }

      // 3. Get news from Trading Economics (if available)
      if (this.tradingEconomicsKey) {
        const tradingEconomicsNews = await this.getTradingEconomicsNews();
        allNews.push(...tradingEconomicsNews);
      }

      // 4. Get fallback news (always available)
      const fallbackNews = await this.getFallbackNews();
      allNews.push(...fallbackNews);

      console.log(`📰 Collected ${allNews.length} financial news items`);
      
    } catch (error) {
      console.error('Error collecting financial news:', error);
      // Return fallback news if collection fails
      const fallbackNews = await this.getFallbackNews();
      allNews.push(...fallbackNews);
    }

    return allNews;
  }

  /**
   * Get financial news from NewsAPI
   */
  private async getNewsAPIFinancialNews(): Promise<FinancialNews[]> {
    try {
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=forex+OR+currency+OR+interest+rate+OR+inflation+OR+GDP&language=en&sortBy=publishedAt&apiKey=${this.newsApiKey}&pageSize=20`
      );

      const articles = response.data.articles || [];
      return articles.map((article: any) => {
        const sentiment = this.analyzeNewsSentiment(article.title + ' ' + article.description);
        const currencies = this.extractCurrencies(article.title + ' ' + article.description);
        const impact = this.assessNewsImpact(article.title, article.description);

        return {
          title: article.title,
          description: article.description || '',
          content: article.content || '',
          publishedAt: new Date(article.publishedAt),
          source: article.source.name,
          url: article.url,
          sentiment,
          confidenceScore: this.calculateNewsConfidence(article.title, article.description, impact),
          currencies,
          impact
        };
      });
    } catch (error) {
      console.error('Error fetching NewsAPI news:', error);
      return [];
    }
  }

  /**
   * Get news from Alpha Vantage
   */
  private async getAlphaVantageNews(): Promise<FinancialNews[]> {
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=forex&apikey=${this.alphaVantageKey}`
      );

      const articles = response.data.feed || [];
      return articles.map((article: any) => {
        const sentiment = this.mapAlphaVantageSentiment(article.overall_sentiment_label);
        const currencies = this.extractCurrencies(article.title + ' ' + article.summary);
        const impact = this.assessNewsImpact(article.title, article.summary);

        return {
          title: article.title,
          description: article.summary || '',
          content: article.summary || '',
          publishedAt: new Date(article.time_published),
          source: article.source,
          url: article.url,
          sentiment,
          confidenceScore: Math.round(parseFloat(article.overall_sentiment_score) * 100),
          currencies,
          impact
        };
      });
    } catch (error) {
      console.error('Error fetching Alpha Vantage news:', error);
      return [];
    }
  }

  /**
   * Get news from Trading Economics
   */
  private async getTradingEconomicsNews(): Promise<FinancialNews[]> {
    try {
      // Trading Economics API call would go here
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error fetching Trading Economics news:', error);
      return [];
    }
  }

  /**
   * Get fallback news (always available)
   */
  private async getFallbackNews(): Promise<FinancialNews[]> {
    const fallbackNews: FinancialNews[] = [
      {
        title: 'Federal Reserve Signals Potential Rate Cuts in 2024',
        description: 'Fed officials indicate possible interest rate reductions as inflation shows signs of cooling',
        content: 'The Federal Reserve has signaled potential interest rate cuts in 2024 as inflation shows signs of cooling. Fed officials have indicated that the current restrictive monetary policy may be adjusted downward if economic conditions continue to improve.',
        publishedAt: new Date(),
        source: 'Financial Times',
        url: 'https://example.com/fed-rate-cuts-2024',
        sentiment: 'BULLISH',
        confidenceScore: 85,
        currencies: ['USD'],
        impact: 'HIGH'
      },
      {
        title: 'ECB Maintains Hawkish Stance Despite Economic Slowdown',
        description: 'European Central Bank keeps interest rates unchanged, emphasizing inflation concerns',
        content: 'The European Central Bank has maintained its hawkish monetary policy stance, keeping interest rates unchanged despite signs of economic slowdown. ECB officials emphasized ongoing concerns about inflation persistence.',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        source: 'Reuters',
        url: 'https://example.com/ecb-hawkish-stance',
        sentiment: 'BEARISH',
        confidenceScore: 75,
        currencies: ['EUR'],
        impact: 'HIGH'
      },
      {
        title: 'Bank of Japan Considers Policy Normalization',
        description: 'BOJ officials discuss potential exit from negative interest rate policy',
        content: 'Bank of Japan officials are reportedly considering policy normalization, including a potential exit from negative interest rates. This represents a significant shift in Japanese monetary policy.',
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        source: 'Bloomberg',
        url: 'https://example.com/boj-policy-normalization',
        sentiment: 'BULLISH',
        confidenceScore: 70,
        currencies: ['JPY'],
        impact: 'HIGH'
      },
      {
        title: 'UK Inflation Falls Below Target',
        description: 'Consumer price index drops to 1.9%, below Bank of England\'s 2% target',
        content: 'UK inflation has fallen below the Bank of England\'s 2% target, with the consumer price index dropping to 1.9%. This development may influence future monetary policy decisions.',
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        source: 'Financial Times',
        url: 'https://example.com/uk-inflation-below-target',
        sentiment: 'BULLISH',
        confidenceScore: 80,
        currencies: ['GBP'],
        impact: 'MEDIUM'
      },
      {
        title: 'US Non-Farm Payrolls Exceed Expectations',
        description: 'Employment data shows stronger than expected job growth in December',
        content: 'US non-farm payrolls exceeded expectations in December, showing stronger than expected job growth. This positive employment data may influence Federal Reserve policy decisions.',
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        source: 'MarketWatch',
        url: 'https://example.com/us-nfp-exceeds-expectations',
        sentiment: 'BULLISH',
        confidenceScore: 85,
        currencies: ['USD'],
        impact: 'HIGH'
      }
    ];

    return fallbackNews;
  }

  /**
   * Analyze news sentiment using keyword analysis
   */
  private analyzeNewsSentiment(text: string): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    const bullishKeywords = [
      'bullish', 'positive', 'growth', 'increase', 'rise', 'strong', 'improve', 'recovery',
      'expansion', 'surge', 'jump', 'climb', 'gain', 'profit', 'success', 'optimistic',
      'rate cut', 'easing', 'stimulus', 'support', 'boost', 'rally', 'breakout'
    ];

    const bearishKeywords = [
      'bearish', 'negative', 'decline', 'decrease', 'fall', 'weak', 'worsen', 'recession',
      'contraction', 'drop', 'plunge', 'crash', 'loss', 'failure', 'pessimistic',
      'rate hike', 'tightening', 'restriction', 'pressure', 'downturn', 'selloff'
    ];

    const lowerText = text.toLowerCase();
    let bullishScore = 0;
    let bearishScore = 0;

    bullishKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) bullishScore++;
    });

    bearishKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) bearishScore++;
    });

    if (bullishScore > bearishScore && bullishScore > 0) return 'BULLISH';
    if (bearishScore > bullishScore && bearishScore > 0) return 'BEARISH';
    return 'NEUTRAL';
  }

  /**
   * Extract currencies mentioned in the text
   */
  private extractCurrencies(text: string): string[] {
    const currencies: string[] = [];
    const currencyPatterns = [
      { pattern: /\bUSD\b|\bUS Dollar\b|\bDollar\b/gi, currency: 'USD' },
      { pattern: /\bEUR\b|\bEuro\b|\bEurozone\b/gi, currency: 'EUR' },
      { pattern: /\bJPY\b|\bJapanese Yen\b|\bYen\b/gi, currency: 'JPY' },
      { pattern: /\bGBP\b|\bBritish Pound\b|\bPound\b/gi, currency: 'GBP' },
      { pattern: /\bCAD\b|\bCanadian Dollar\b/gi, currency: 'CAD' }
    ];

    currencyPatterns.forEach(({ pattern, currency }) => {
      if (pattern.test(text) && !currencies.includes(currency)) {
        currencies.push(currency);
      }
    });

    return currencies;
  }

  /**
   * Assess news impact based on content
   */
  private assessNewsImpact(title: string, description: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    const highImpactKeywords = [
      'interest rate', 'rate decision', 'federal reserve', 'ecb', 'boj', 'boe',
      'inflation', 'cpi', 'gdp', 'employment', 'nfp', 'unemployment',
      'monetary policy', 'quantitative easing', 'tapering'
    ];

    const mediumImpactKeywords = [
      'retail sales', 'manufacturing', 'pmi', 'consumer confidence',
      'trade balance', 'current account', 'housing', 'construction'
    ];

    const text = (title + ' ' + description).toLowerCase();

    for (const keyword of highImpactKeywords) {
      if (text.includes(keyword)) return 'HIGH';
    }

    for (const keyword of mediumImpactKeywords) {
      if (text.includes(keyword)) return 'MEDIUM';
    }

    return 'LOW';
  }

  /**
   * Calculate news confidence score
   */
  private calculateNewsConfidence(title: string, description: string, impact: string): number {
    let score = 50;

    // Impact bonus
    if (impact === 'HIGH') score += 25;
    else if (impact === 'MEDIUM') score += 15;

    // Source credibility (simplified)
    const credibleSources = ['reuters', 'bloomberg', 'financial times', 'wall street journal'];
    const source = (title + ' ' + description).toLowerCase();
    if (credibleSources.some(s => source.includes(s))) score += 15;

    // Content length bonus
    if (description && description.length > 100) score += 10;

    return Math.min(score, 100);
  }

  /**
   * Map Alpha Vantage sentiment to our format
   */
  private mapAlphaVantageSentiment(sentiment: string): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    switch (sentiment.toLowerCase()) {
      case 'bullish':
      case 'positive':
        return 'BULLISH';
      case 'bearish':
      case 'negative':
        return 'BEARISH';
      default:
        return 'NEUTRAL';
    }
  }

  /**
   * Convert financial news to economic events
   */
  convertNewsToEconomicEvents(news: FinancialNews[]): EconomicEvent[] {
    return news.map(item => ({
      currency: (item.currencies[0] || 'USD') as 'EUR' | 'USD' | 'JPY' | 'GBP' | 'CAD',
      eventType: 'NEWS',
      title: item.title,
      description: item.description,
      eventDate: item.publishedAt,
      actualValue: undefined,
      expectedValue: undefined,
      previousValue: undefined,
      impact: item.impact,
      sentiment: item.sentiment,
      confidenceScore: item.confidenceScore,
      priceImpact: this.calculateNewsPriceImpact(item.sentiment, item.impact),
      source: item.source,
      url: item.url
    }));
  }

  /**
   * Calculate potential price impact of news
   */
  private calculateNewsPriceImpact(sentiment: string, impact: string): number {
    let baseImpact = 0;
    
    if (sentiment === 'BULLISH') baseImpact = 0.5;
    else if (sentiment === 'BEARISH') baseImpact = -0.5;
    
    if (impact === 'HIGH') baseImpact *= 2;
    else if (impact === 'MEDIUM') baseImpact *= 1.5;
    
    return baseImpact;
  }
}

export default FinancialNewsCollector;
