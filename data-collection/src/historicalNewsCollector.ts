import axios from 'axios';

export interface HistoricalNewsItem {
  title: string;
  description: string;
  publishedAt: string;
  source: string;
  url: string;
  currencies: string[];
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidenceScore: number;
}

export class HistoricalNewsCollector {
  private apiKey: string;
  private baseUrl = 'https://newsapi.org/v2';

  constructor() {
    this.apiKey = process.env.NEWS_API_KEY || 'demo-key';
  }

  async collectHistoricalNews(startDate: string, endDate: string): Promise<HistoricalNewsItem[]> {
    console.log(`📰 Collecting historical news from ${startDate} to ${endDate}...`);
    
    const allNews: HistoricalNewsItem[] = [];
    let page = 1;
    const pageSize = 100; // Maximum allowed by News API
    
    try {
      while (true) {
        console.log(`📰 Fetching page ${page}...`);
        
        const response = await axios.get(`${this.baseUrl}/everything`, {
          params: {
            q: 'forex OR currency OR interest rate OR inflation OR GDP OR central bank OR monetary policy',
            language: 'en',
            sortBy: 'publishedAt',
            from: startDate,
            to: endDate,
            pageSize: pageSize,
            page: page,
            apiKey: this.apiKey
          },
          timeout: 30000
        });

        if (response.data.status === 'error') {
          console.log(`⚠️ API Error: ${response.data.message}`);
          break;
        }

        const articles = response.data.articles || [];
        
        if (articles.length === 0) {
          console.log(`✅ No more articles found. Total collected: ${allNews.length}`);
          break;
        }

        // Process articles
        for (const article of articles) {
          const newsItem = this.processArticle(article);
          if (newsItem) {
            allNews.push(newsItem);
          }
        }

        console.log(`📰 Page ${page}: ${articles.length} articles, Total: ${allNews.length}`);
        
        // Check if we've reached the limit (News API has rate limits)
        if (page >= 10) { // Limit to 10 pages to avoid rate limiting
          console.log(`⚠️ Reached page limit to avoid rate limiting. Total collected: ${allNews.length}`);
          break;
        }
        
        page++;
        
        // Add delay to avoid rate limiting
        await this.delay(1000);
      }

      console.log(`🎉 Historical news collection completed! Total: ${allNews.length} articles`);
      return allNews;

    } catch (error) {
      console.error('❌ Error collecting historical news:', error);
      return allNews; // Return what we have so far
    }
  }

  private processArticle(article: any): HistoricalNewsItem | null {
    try {
      // Extract currencies from title and description
      const currencies = this.extractCurrencies(article.title + ' ' + article.description);
      
      // Determine impact based on source and content
      const impact = this.determineImpact(article.source.name, article.title);
      
      // Analyze sentiment
      const sentiment = this.analyzeSentiment(article.title, article.description);
      
      // Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(article.source.name, sentiment);
      
      return {
        title: article.title || 'No Title',
        description: article.description || 'No Description',
        publishedAt: article.publishedAt || new Date().toISOString(),
        source: article.source.name || 'Unknown Source',
        url: article.url || '',
        currencies: currencies.length > 0 ? currencies : ['USD'], // Default to USD if no currency found
        impact,
        sentiment,
        confidenceScore
      };
    } catch (error) {
      console.error('❌ Error processing article:', error);
      return null;
    }
  }

  private extractCurrencies(text: string): string[] {
    const currencyPatterns = {
      'USD': /\b(USD|dollar|dollars|US\s*currency|Federal\s*Reserve)\b/gi,
      'EUR': /\b(EUR|euro|euros|ECB|European\s*Central\s*Bank)\b/gi,
      'GBP': /\b(GBP|pound|pounds|sterling|Bank\s*of\s*England|BOE)\b/gi,
      'JPY': /\b(JPY|yen|Bank\s*of\s*Japan|BOJ)\b/gi,
      'AUD': /\b(AUD|Australian\s*dollar|Reserve\s*Bank\s*of\s*Australia|RBA)\b/gi,
      'CAD': /\b(CAD|Canadian\s*dollar|Bank\s*of\s*Canada|BOC)\b/gi,
      'CHF': /\b(CHF|Swiss\s*franc|Swiss\s*National\s*Bank|SNB)\b/gi,
      'NZD': /\b(NZD|New\s*Zealand\s*dollar|Reserve\s*Bank\s*of\s*New\s*Zealand|RBNZ)\b/gi,
      'CNY': /\b(CNY|yuan|renminbi|People\s*Bank\s*of\s*China|PBOC)\b/gi
    };

    const foundCurrencies: string[] = [];
    
    for (const [currency, pattern] of Object.entries(currencyPatterns)) {
      if (pattern.test(text)) {
        foundCurrencies.push(currency);
      }
    }

    return [...new Set(foundCurrencies)]; // Remove duplicates
  }

  private determineImpact(source: string, title: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    const highImpactSources = ['Reuters', 'Bloomberg', 'CNBC', 'Financial Times', 'Wall Street Journal'];
    const highImpactKeywords = ['Federal Reserve', 'ECB', 'BOE', 'BOJ', 'interest rate', 'inflation', 'GDP', 'employment'];
    
    if (highImpactSources.includes(source)) return 'HIGH';
    
    const titleLower = title.toLowerCase();
    if (highImpactKeywords.some(keyword => titleLower.includes(keyword.toLowerCase()))) {
      return 'HIGH';
    }
    
    return 'MEDIUM'; // Default to medium for historical analysis
  }

  private analyzeSentiment(title: string, description: string): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    const bullishKeywords = ['bullish', 'positive', 'growth', 'increase', 'rise', 'strong', 'recovery', 'expansion', 'optimistic'];
    const bearishKeywords = ['bearish', 'negative', 'decline', 'fall', 'weak', 'recession', 'contraction', 'pessimistic', 'downturn'];
    
    const text = (title + ' ' + description).toLowerCase();
    
    const bullishCount = bullishKeywords.filter(keyword => text.includes(keyword)).length;
    const bearishCount = bearishKeywords.filter(keyword => text.includes(keyword)).length;
    
    if (bullishCount > bearishCount) return 'BULLISH';
    if (bearishCount > bullishCount) return 'BEARISH';
    return 'NEUTRAL';
  }

  private calculateConfidenceScore(source: string, sentiment: string): number {
    const reliableSources = ['Reuters', 'Bloomberg', 'CNBC', 'Financial Times', 'Wall Street Journal'];
    const baseScore = reliableSources.includes(source) ? 80 : 60;
    
    // Adjust based on sentiment clarity
    if (sentiment === 'NEUTRAL') {
      return Math.max(50, baseScore - 20);
    }
    
    return Math.min(100, baseScore + 10);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
