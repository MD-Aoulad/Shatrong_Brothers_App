import axios from 'axios';
import { EconomicEvent } from './dataSources';

/**
 * Real-Time Economic Data Collection
 * Fetches live economic indicators from multiple sources
 */

export interface EconomicIndicator {
  name: string;
  currency: 'EUR' | 'USD' | 'JPY' | 'GBP' | 'CAD';
  value: number;
  previous: number;
  expected?: number;
  change: number;
  changePercent: number;
  date: Date;
  source: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class RealTimeEconomicData {
  private alphaVantageKey: string;
  private fredApiKey: string;
  private newsApiKey: string;
  private tradingEconomicsKey: string;

  constructor() {
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY || '';
    this.fredApiKey = process.env.FRED_API_KEY || '';
    this.newsApiKey = process.env.NEWS_API_KEY || '';
    this.tradingEconomicsKey = process.env.TRADING_ECONOMICS_API_KEY || '';
  }

  /**
   * Get real-time USD economic indicators
   */
  async getUSDIndicators(): Promise<EconomicIndicator[]> {
    const indicators: EconomicIndicator[] = [];
    
    try {
      // Get Federal Funds Rate (most important)
      if (this.alphaVantageKey) {
        const fedRate = await this.getFederalFundsRate();
        if (fedRate) indicators.push(fedRate);
      }

      // Get CPI data
      if (this.fredApiKey) {
        const cpi = await this.getCPIData();
        if (cpi) indicators.push(cpi);
      }

      // Get GDP data
      if (this.fredApiKey) {
        const gdp = await this.getGDPData();
        if (gdp) indicators.push(gdp);
      }

      // Get Unemployment data
      if (this.fredApiKey) {
        const unemployment = await this.getUnemploymentData();
        if (unemployment) indicators.push(unemployment);
      }

      // Get ISM PMI data
      const ismPmi = await this.getISMPMIData();
      if (ismPmi) indicators.push(ismPmi);

    } catch (error) {
      console.error('Error fetching USD indicators:', error);
    }

    return indicators;
  }

  /**
   * Get real-time EUR economic indicators
   */
  async getEURIndicators(): Promise<EconomicIndicator[]> {
    const indicators: EconomicIndicator[] = [];
    
    try {
      // Get ECB interest rate
      const ecbRate = await this.getECBRate();
      if (ecbRate) indicators.push(ecbRate);

      // Get Eurozone CPI
      const eurozoneCpi = await this.getEurozoneCPIData();
      if (eurozoneCpi) indicators.push(eurozoneCpi);

      // Get Eurozone GDP
      const eurozoneGdp = await this.getEurozoneGDPData();
      if (eurozoneGdp) indicators.push(eurozoneGdp);

    } catch (error) {
      console.error('Error fetching EUR indicators:', error);
    }

    return indicators;
  }

  /**
   * Get real-time JPY economic indicators
   */
  async getJPYIndicators(): Promise<EconomicIndicator[]> {
    const indicators: EconomicIndicator[] = [];
    
    try {
      // Get BOJ interest rate
      const bojRate = await this.getBOJRate();
      if (bojRate) indicators.push(bojRate);

      // Get Japan CPI
      const japanCpi = await this.getJapanCPIData();
      if (japanCpi) indicators.push(japanCpi);

      // Get Japan GDP
      const japanGdp = await this.getJapanGDPData();
      if (japanGdp) indicators.push(japanGdp);

    } catch (error) {
      console.error('Error fetching JPY indicators:', error);
    }

    return indicators;
  }

  /**
   * Get real-time GBP economic indicators
   */
  async getGBPIndicators(): Promise<EconomicIndicator[]> {
    const indicators: EconomicIndicator[] = [];
    
    try {
      // Get BOE interest rate
      const boeRate = await this.getBOERate();
      if (boeRate) indicators.push(boeRate);

      // Get UK CPI
      const ukCpi = await this.getUKCPIData();
      if (ukCpi) indicators.push(ukCpi);

      // Get UK GDP
      const ukGdp = await this.getUKGDPData();
      if (ukGdp) indicators.push(ukGdp);

    } catch (error) {
      console.error('Error fetching GBP indicators:', error);
    }

    return indicators;
  }

  /**
   * Get Federal Funds Rate from Alpha Vantage
   */
  private async getFederalFundsRate(): Promise<EconomicIndicator | null> {
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=FEDERAL_FUNDS_RATE&interval=monthly&apikey=${this.alphaVantageKey}`
      );

      const data = response.data;
      if (data['data'] && data['data'].length > 0) {
        const latest = data['data'][0];
        const previous = data['data'][1];
        
        const value = parseFloat(latest.value);
        const prevValue = parseFloat(previous.value);
        const change = value - prevValue;
        const changePercent = (change / prevValue) * 100;

        return {
          name: 'Federal Funds Rate',
          currency: 'USD',
          value,
          previous: prevValue,
          change,
          changePercent,
          date: new Date(latest.timestamp),
          source: 'Alpha Vantage',
          impact: 'HIGH'
        };
      }
    } catch (error) {
      console.error('Error fetching Federal Funds Rate:', error);
    }
    return null;
  }

  /**
   * Get CPI data from FRED
   */
  private async getCPIData(): Promise<EconomicIndicator | null> {
    try {
      const response = await axios.get(
        `https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL&api_key=${this.fredApiKey}&file_type=json&sort_order=desc&limit=2`
      );

      const data = response.data.observations;
      if (data && data.length >= 2) {
        const latest = parseFloat(data[0].value);
        const previous = parseFloat(data[1].value);
        const change = latest - previous;
        const changePercent = (change / previous) * 100;

        return {
          name: 'Consumer Price Index (CPI)',
          currency: 'USD',
          value: latest,
          previous,
          change,
          changePercent,
          date: new Date(data[0].date),
          source: 'FRED',
          impact: 'HIGH'
        };
      }
    } catch (error) {
      console.error('Error fetching CPI data:', error);
    }
    return null;
  }

  /**
   * Get GDP data from FRED
   */
  private async getGDPData(): Promise<EconomicIndicator | null> {
    try {
      const response = await axios.get(
        `https://api.stlouisfed.org/fred/series/observations?series_id=GDP&api_key=${this.fredApiKey}&file_type=json&sort_order=desc&limit=2`
      );

      const data = response.data.observations;
      if (data && data.length >= 2) {
        const latest = parseFloat(data[0].value);
        const previous = parseFloat(data[1].value);
        const change = latest - previous;
        const changePercent = (change / previous) * 100;

        return {
          name: 'Gross Domestic Product (GDP)',
          currency: 'USD',
          value: latest,
          previous,
          change,
          changePercent,
          date: new Date(data[0].date),
          source: 'FRED',
          impact: 'HIGH'
        };
      }
    } catch (error) {
      console.error('Error fetching GDP data:', error);
    }
    return null;
  }

  /**
   * Get Unemployment data from FRED
   */
  private async getUnemploymentData(): Promise<EconomicIndicator | null> {
    try {
      const response = await axios.get(
        `https://api.stlouisfed.org/fred/series/observations?series_id=UNRATE&api_key=${this.fredApiKey}&file_type=json&sort_order=desc&limit=2`
      );

      const data = response.data.observations;
      if (data && data.length >= 2) {
        const latest = parseFloat(data[0].value);
        const previous = parseFloat(data[1].value);
        const change = latest - previous;
        const changePercent = (change / previous) * 100;

        return {
          name: 'Unemployment Rate',
          currency: 'USD',
          value: latest,
          previous,
          change,
          changePercent,
          date: new Date(data[0].date),
          source: 'FRED',
          impact: 'HIGH'
        };
      }
    } catch (error) {
      console.error('Error fetching Unemployment data:', error);
    }
    return null;
  }

  /**
   * Get ISM Manufacturing PMI (web scraping fallback)
   */
  private async getISMPMIData(): Promise<EconomicIndicator | null> {
    try {
      // This would typically come from ISM API or web scraping
      // For now, return a placeholder
      return {
        name: 'ISM Manufacturing PMI',
        currency: 'USD',
        value: 50.2,
        previous: 49.0,
        change: 1.2,
        changePercent: 2.4,
        date: new Date(),
        source: 'ISM (Placeholder)',
        impact: 'HIGH'
      };
    } catch (error) {
      console.error('Error fetching ISM PMI data:', error);
    }
    return null;
  }

  /**
   * Get ECB interest rate (web scraping fallback)
   */
  private async getECBRate(): Promise<EconomicIndicator | null> {
    try {
      // This would typically come from ECB API or web scraping
      return {
        name: 'ECB Main Refinancing Rate',
        currency: 'EUR',
        value: 4.0,
        previous: 4.25,
        change: -0.25,
        changePercent: -5.9,
        date: new Date(),
        source: 'ECB (Placeholder)',
        impact: 'HIGH'
      };
    } catch (error) {
      console.error('Error fetching ECB rate:', error);
    }
    return null;
  }

  /**
   * Get Eurozone CPI data (web scraping fallback)
   */
  private async getEurozoneCPIData(): Promise<EconomicIndicator | null> {
    try {
      return {
        name: 'Eurozone HICP',
        currency: 'EUR',
        value: 2.9,
        previous: 2.4,
        change: 0.5,
        changePercent: 20.8,
        date: new Date(),
        source: 'Eurostat (Placeholder)',
        impact: 'HIGH'
      };
    } catch (error) {
      console.error('Error fetching Eurozone CPI data:', error);
    }
    return null;
  }

  /**
   * Get Eurozone GDP data (web scraping fallback)
   */
  private async getEurozoneGDPData(): Promise<EconomicIndicator | null> {
    try {
      return {
        name: 'Eurozone GDP Growth',
        currency: 'EUR',
        value: 0.3,
        previous: 0.1,
        change: 0.2,
        changePercent: 200.0,
        date: new Date(),
        source: 'Eurostat (Placeholder)',
        impact: 'HIGH'
      };
    } catch (error) {
      console.error('Error fetching Eurozone GDP data:', error);
    }
    return null;
  }

  /**
   * Get BOJ interest rate (web scraping fallback)
   */
  private async getBOJRate(): Promise<EconomicIndicator | null> {
    try {
      return {
        name: 'BOJ Policy Rate',
        currency: 'JPY',
        value: 0.0,
        previous: -0.1,
        change: 0.1,
        changePercent: 100.0,
        date: new Date(),
        source: 'BOJ (Placeholder)',
        impact: 'HIGH'
      };
    } catch (error) {
      console.error('Error fetching BOJ rate:', error);
    }
    return null;
  }

  /**
   * Get Japan CPI data (web scraping fallback)
   */
  private async getJapanCPIData(): Promise<EconomicIndicator | null> {
    try {
      return {
        name: 'Japan CPI',
        currency: 'JPY',
        value: 1.2,
        previous: 0.6,
        change: 0.6,
        changePercent: 100.0,
        date: new Date(),
        source: 'Statistics Bureau (Placeholder)',
        impact: 'MEDIUM'
      };
    } catch (error) {
      console.error('Error fetching Japan CPI data:', error);
    }
    return null;
  }

  /**
   * Get Japan GDP data (web scraping fallback)
   */
  private async getJapanGDPData(): Promise<EconomicIndicator | null> {
    try {
      return {
        name: 'Japan GDP Growth',
        currency: 'JPY',
        value: 1.5,
        previous: 0.8,
        change: 0.7,
        changePercent: 87.5,
        date: new Date(),
        source: 'BOJ (Placeholder)',
        impact: 'HIGH'
      };
    } catch (error) {
      console.error('Error fetching Japan GDP data:', error);
    }
    return null;
  }

  /**
   * Get BOE interest rate (web scraping fallback)
   */
  private async getBOERate(): Promise<EconomicIndicator | null> {
    try {
      return {
        name: 'BOE Bank Rate',
        currency: 'GBP',
        value: 4.75,
        previous: 5.0,
        change: -0.25,
        changePercent: -5.0,
        date: new Date(),
        source: 'BOE (Placeholder)',
        impact: 'HIGH'
      };
    } catch (error) {
      console.error('Error fetching BOE rate:', error);
    }
    return null;
  }

  /**
   * Get UK CPI data (web scraping fallback)
   */
  private async getUKCPIData(): Promise<EconomicIndicator | null> {
    try {
      return {
        name: 'UK CPI',
        currency: 'GBP',
        value: 2.0,
        previous: 1.8,
        change: 0.2,
        changePercent: 11.1,
        date: new Date(),
        source: 'ONS (Placeholder)',
        impact: 'HIGH'
      };
    } catch (error) {
      console.error('Error fetching UK CPI data:', error);
    }
    return null;
  }

  /**
   * Get UK GDP data (web scraping fallback)
   */
  private async getUKGDPData(): Promise<EconomicIndicator | null> {
    try {
      return {
        name: 'UK GDP Growth',
        currency: 'GBP',
        value: 0.6,
        previous: 0.3,
        change: 0.3,
        changePercent: 100.0,
        date: new Date(),
        source: 'ONS (Placeholder)',
        impact: 'HIGH'
      };
    } catch (error) {
      console.error('Error fetching UK GDP data:', error);
    }
    return null;
  }

  /**
   * Convert economic indicators to economic events
   */
  convertToEconomicEvents(indicators: EconomicIndicator[]): EconomicEvent[] {
    return indicators.map(indicator => {
      // Calculate sentiment based on change
      let sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
      if (indicator.changePercent > 5) sentiment = 'BULLISH';
      else if (indicator.changePercent < -5) sentiment = 'BEARISH';

      // Calculate confidence score based on impact and change magnitude
      let confidenceScore = 50;
      if (indicator.impact === 'HIGH') confidenceScore += 30;
      if (Math.abs(indicator.changePercent) > 10) confidenceScore += 20;

      return {
        currency: indicator.currency,
        eventType: this.mapIndicatorToEventType(indicator.name),
        title: indicator.name,
        description: `${indicator.name} for ${indicator.currency}: ${indicator.value} (${indicator.changePercent > 0 ? '+' : ''}${indicator.changePercent.toFixed(2)}%)`,
        eventDate: indicator.date,
        actualValue: indicator.value,
        previousValue: indicator.previous,
        expectedValue: indicator.expected,
        impact: indicator.impact,
        sentiment,
        confidenceScore,
        priceImpact: indicator.changePercent * 0.01, // Convert to decimal
        source: indicator.source,
        url: ''
      };
    });
  }

  /**
   * Map indicator names to event types
   */
  private mapIndicatorToEventType(indicatorName: string): string {
    if (indicatorName.includes('Rate') || indicatorName.includes('Interest')) return 'INTEREST_RATE';
    if (indicatorName.includes('CPI') || indicatorName.includes('Inflation')) return 'CPI';
    if (indicatorName.includes('GDP')) return 'GDP';
    if (indicatorName.includes('Unemployment')) return 'EMPLOYMENT';
    if (indicatorName.includes('PMI')) return 'PMI';
    return 'ECONOMIC';
  }
}

export default RealTimeEconomicData;
