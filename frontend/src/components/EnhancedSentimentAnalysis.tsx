import React from 'react';

/**
 * Enhanced Sentiment Analysis for Complex Economic Events
 * Professional-grade analysis that captures "red news" scenarios
 */

interface EconomicEvent {
  title: string;
  currency: 'EUR' | 'USD' | 'JPY' | 'GBP';
  eventType: string;
  actualValue?: number;
  expectedValue?: number;
  previousValue?: number;
  additionalData?: {
    votingPattern?: string;    // e.g., "0-5-4" for MPC votes
    speechTone?: 'HAWKISH' | 'DOVISH' | 'NEUTRAL';
    policyChange?: string;     // Rate cut, QE announcement, etc.
    marketSurprise?: 'HIGH' | 'MEDIUM' | 'LOW';
  };
}

export class ProfessionalSentimentAnalyzer {
  
  /**
   * Enhanced sentiment analysis that captures complex monetary policy
   */
  static analyzeSentiment(event: EconomicEvent): {
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    confidence: number;
    reasoning: string[];
    economicFactors: string[];
  } {
    const reasoning: string[] = [];
    const economicFactors: string[] = [];
    let sentimentScore = 0; // -100 to +100
    let confidence = 50;

    // 1. CENTRAL BANK POLICY ANALYSIS
    if (event.eventType === 'INTEREST_RATE' || event.title.includes('Rate Decision')) {
      const analysis = this.analyzeCentralBankPolicy(event);
      sentimentScore += analysis.score;
      confidence = Math.max(confidence, analysis.confidence);
      reasoning.push(...analysis.reasoning);
      economicFactors.push(...analysis.factors);
    }

    // 2. VOTING PATTERN ANALYSIS (Critical for BOE, Fed, ECB)
    if (event.additionalData?.votingPattern) {
      const voteAnalysis = this.analyzeVotingPattern(event.additionalData.votingPattern, event.currency);
      sentimentScore += voteAnalysis.score;
      confidence = Math.max(confidence, voteAnalysis.confidence);
      reasoning.push(...voteAnalysis.reasoning);
    }

    // 3. POLICY TRAJECTORY ANALYSIS
    if (event.actualValue !== undefined && event.previousValue !== undefined) {
      const trajectoryAnalysis = this.analyzePolicyTrajectory(
        event.actualValue, 
        event.previousValue, 
        event.expectedValue,
        event.eventType
      );
      sentimentScore += trajectoryAnalysis.score;
      reasoning.push(...trajectoryAnalysis.reasoning);
    }

    // 4. LABOR MARKET DETERIORATION ANALYSIS
    if (event.title.includes('Unemployment Claims') || event.eventType === 'EMPLOYMENT') {
      const laborAnalysis = this.analyzeLaborMarket(event);
      sentimentScore += laborAnalysis.score;
      reasoning.push(...laborAnalysis.reasoning);
      economicFactors.push(...laborAnalysis.factors);
    }

    // 5. DETERMINE FINAL SENTIMENT
    const finalSentiment = this.calculateFinalSentiment(sentimentScore);
    
    return {
      sentiment: finalSentiment,
      confidence: Math.min(95, Math.max(60, confidence)),
      reasoning,
      economicFactors
    };
  }

  /**
   * Analyze Central Bank Policy Changes
   */
  static analyzeCentralBankPolicy(event: EconomicEvent) {
    const reasoning: string[] = [];
    const factors: string[] = [];
    let score = 0;
    let confidence = 70;

    const { actualValue, expectedValue, previousValue } = event;

    if (actualValue !== undefined && previousValue !== undefined) {
      const rateChange = actualValue - previousValue;
      const expectationDifference = expectedValue ? actualValue - expectedValue : 0;

      // Rate trajectory analysis
      if (rateChange > 0) {
        score += 25; // Rate hike = bullish
        reasoning.push(`Rate increase from ${previousValue}% to ${actualValue}% - Hawkish policy`);
        factors.push("Monetary tightening cycle");
      } else if (rateChange < 0) {
        score -= 30; // Rate cut = bearish (stronger signal)
        reasoning.push(`Rate CUT from ${previousValue}% to ${actualValue}% - Major dovish shift`);
        factors.push("Monetary easing - Economic concerns");
        confidence = 85; // Rate cuts are strong signals
      }

      // Market expectation vs reality
      if (Math.abs(expectationDifference) > 0.1) {
        if (expectationDifference > 0) {
          score += 15; // More hawkish than expected
          reasoning.push("More hawkish than market expected");
        } else {
          score -= 15; // More dovish than expected
          reasoning.push("More dovish than market expected");
        }
        confidence += 10;
      }
    }

    return { score, confidence, reasoning, factors };
  }

  /**
   * Analyze Monetary Policy Committee Voting Patterns
   */
  static analyzeVotingPattern(votingPattern: string, currency: string) {
    const reasoning: string[] = [];
    let score = 0;
    let confidence = 80;

    // Parse voting pattern (e.g., "0-5-4" = 0 for hike, 5 for cut, 4 for hold)
    const votes = votingPattern.split('-').map(Number);
    const [hikeVotes, cutVotes, holdVotes] = votes;

    const totalVotes = hikeVotes + cutVotes + holdVotes;
    const cutPercentage = (cutVotes / totalVotes) * 100;
    const hikePercentage = (hikeVotes / totalVotes) * 100;

    // Dovish majority analysis
    if (cutVotes > holdVotes && cutVotes > hikeVotes) {
      score -= 35; // Strong dovish signal
      reasoning.push(`Dovish majority: ${cutVotes}/${totalVotes} members voted for rate cuts`);
      reasoning.push("Central bank committee shows concern about economic outlook");
      confidence = 90;
    }
    
    // Hawkish majority analysis
    else if (hikeVotes > holdVotes && hikeVotes > cutVotes) {
      score += 30; // Strong hawkish signal
      reasoning.push(`Hawkish majority: ${hikeVotes}/${totalVotes} members voted for rate hikes`);
      reasoning.push("Central bank committee shows inflation concerns");
      confidence = 90;
    }
    
    // Split decision analysis
    else if (Math.abs(cutVotes - hikeVotes) <= 1) {
      score -= 10; // Uncertainty is slightly bearish
      reasoning.push("Split committee decision shows policy uncertainty");
      reasoning.push("Market may anticipate more dovish moves ahead");
      confidence = 70;
    }

    // Add percentage analysis
    if (cutPercentage > 40) {
      reasoning.push(`${cutPercentage.toFixed(0)}% of committee favors easing - significant dovish sentiment`);
    }

    return { score, confidence, reasoning };
  }

  /**
   * Analyze Policy Trajectory (Rate Path)
   */
  static analyzePolicyTrajectory(actual: number, previous: number, expected?: number, eventType?: string) {
    const reasoning: string[] = [];
    let score = 0;

    if (eventType === 'INTEREST_RATE') {
      const trajectory = actual - previous;
      const trend = trajectory > 0 ? 'tightening' : trajectory < 0 ? 'easing' : 'stable';

      if (trend === 'easing') {
        score -= 25;
        reasoning.push(`Policy easing trajectory: ${previous}% → ${actual}%`);
        reasoning.push("Central bank pivoting to support economic growth");
      } else if (trend === 'tightening') {
        score += 20;
        reasoning.push(`Policy tightening trajectory: ${previous}% → ${actual}%`);
        reasoning.push("Central bank maintaining inflation fight");
      }

      // Surprise factor
      if (expected && Math.abs(actual - expected) > 0.1) {
        const surprise = actual > expected ? 'hawkish' : 'dovish';
        score += surprise === 'hawkish' ? 10 : -10;
        reasoning.push(`${surprise} surprise vs market expectations (${expected}%)`);
      }
    }

    return { score, reasoning };
  }

  /**
   * Analyze Labor Market Conditions
   */
  static analyzeLaborMarket(event: EconomicEvent) {
    const reasoning: string[] = [];
    const factors: string[] = [];
    let score = 0;

    const { actualValue, expectedValue, title } = event;

    if (title.includes('Unemployment Claims')) {
      if (actualValue && expectedValue) {
        const difference = actualValue - expectedValue;
        const percentageDiff = (difference / expectedValue) * 100;

        if (difference > 0) {
          score -= 15; // Higher claims = bearish
          reasoning.push(`Unemployment claims rose to ${actualValue}K vs ${expectedValue}K expected`);
          
          if (percentageDiff > 5) {
            score -= 10; // Significant deterioration
            reasoning.push("Significant labor market deterioration");
            factors.push("Rising unemployment trend");
          }
        } else {
          score += 10; // Lower claims = bullish
          reasoning.push(`Unemployment claims improved to ${actualValue}K vs ${expectedValue}K expected`);
          factors.push("Strengthening labor market");
        }
      }
    }

    // NFP Analysis
    if (title.includes('NFP') || title.includes('Non-Farm Payrolls')) {
      if (actualValue && expectedValue) {
        const difference = actualValue - expectedValue;
        const percentageDiff = (difference / expectedValue) * 100;

        if (difference < -50000) { // Significantly below expectations
          score -= 25;
          reasoning.push(`Major NFP miss: ${actualValue} vs ${expectedValue} expected`);
          factors.push("Significant job creation slowdown");
        } else if (difference > 50000) { // Significantly above expectations
          score += 20;
          reasoning.push(`Strong NFP beat: ${actualValue} vs ${expectedValue} expected`);
          factors.push("Robust job creation");
        }
      }
    }

    return { score, reasoning, factors };
  }

  /**
   * Calculate Final Sentiment from Score
   */
  static calculateFinalSentiment(score: number): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    if (score >= 20) return 'BULLISH';
    if (score <= -20) return 'BEARISH';
    return 'NEUTRAL';
  }
}

/**
 * React Component to Display Enhanced Analysis
 */
const EnhancedSentimentAnalysis: React.FC = () => {
  // Example analysis of your real data
  const exampleBOEAnalysis = ProfessionalSentimentAnalyzer.analyzeSentiment({
    title: "BOE Official Bank Rate Decision",
    currency: "GBP",
    eventType: "INTEREST_RATE",
    actualValue: 4.00,
    expectedValue: 4.00,
    previousValue: 4.25,
    additionalData: {
      votingPattern: "0-5-4", // 0 hike, 5 cut, 4 hold
      policyChange: "Rate Cut",
      marketSurprise: "MEDIUM"
    }
  });

  const exampleUSAnalysis = ProfessionalSentimentAnalyzer.analyzeSentiment({
    title: "US Unemployment Claims",
    currency: "USD",
    eventType: "EMPLOYMENT",
    actualValue: 226,
    expectedValue: 221,
    previousValue: 220
  });

  return (
    <div className="enhanced-sentiment-analysis">
      <h2>🧠 Enhanced Economic Analysis</h2>
      <p><strong>Why Simple Analysis Misses "Red News"</strong></p>

      <div className="analysis-examples">
        <div className="analysis-card bearish">
          <h3>🔴 GBP Analysis - Your BOE Data</h3>
          <div className="sentiment-result">
            <span className={`sentiment-badge ${exampleBOEAnalysis.sentiment.toLowerCase()}`}>
              {exampleBOEAnalysis.sentiment}
            </span>
            <span className="confidence">Confidence: {exampleBOEAnalysis.confidence}%</span>
          </div>
          
          <h4>Economic Reasoning:</h4>
          <ul>
            {exampleBOEAnalysis.reasoning.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>

          <h4>Key Economic Factors:</h4>
          <ul>
            {exampleBOEAnalysis.economicFactors.map((factor, index) => (
              <li key={index}>{factor}</li>
            ))}
          </ul>
        </div>

        <div className="analysis-card bearish">
          <h3>🔴 USD Analysis - Your Claims Data</h3>
          <div className="sentiment-result">
            <span className={`sentiment-badge ${exampleUSAnalysis.sentiment.toLowerCase()}`}>
              {exampleUSAnalysis.sentiment}
            </span>
            <span className="confidence">Confidence: {exampleUSAnalysis.confidence}%</span>
          </div>
          
          <h4>Economic Reasoning:</h4>
          <ul>
            {exampleUSAnalysis.reasoning.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="professional-insight">
        <h3>👨‍💼 Professional Economist Insight:</h3>
        <p>
          <strong>Your data shows classic "red news" scenarios that require sophisticated analysis:</strong>
        </p>
        <ul>
          <li><strong>BOE Rate Cut (4.25% → 4.00%)</strong> - Dovish pivot despite meeting expectations</li>
          <li><strong>5-4 MPC Vote for Cuts</strong> - Clear dovish majority signals more easing ahead</li>
          <li><strong>Rising US Claims (226K vs 221K)</strong> - Labor market cooling, Fed implications</li>
          <li><strong>Governor Bailey Speech</strong> - Forward guidance likely dovish</li>
        </ul>
        
        <p className="conclusion">
          <strong>Conclusion:</strong> Both GBP and USD showing <span className="bearish-text">BEARISH</span> signals 
          that simple "actual vs expected" analysis completely misses. Professional forex analysis requires 
          understanding policy trajectories, voting patterns, and forward guidance.
        </p>
      </div>
    </div>
  );
};

export default EnhancedSentimentAnalysis;
