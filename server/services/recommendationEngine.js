class RecommendationEngine {
  constructor() {
    this.thresholds = {
      buy: 8,
      hold: 5
    };
  }

  calculateScore(stockData, overviewData, timeSeriesData) {
    let score = 0;
    const factors = [];

    // 1. Price Performance (0-2 points)
    const priceScore = this.calculatePriceScore(stockData);
    score += priceScore;
    factors.push({ name: 'Price Performance', score: priceScore, max: 2 });

    // 2. Fundamental Analysis (0-3 points)
    const fundamentalScore = this.calculateFundamentalScore(overviewData);
    score += fundamentalScore;
    factors.push({ name: 'Fundamentals', score: fundamentalScore, max: 3 });

    // 3. Technical Analysis (0-3 points)
    const technicalScore = this.calculateTechnicalScore(stockData, timeSeriesData);
    score += technicalScore;
    factors.push({ name: 'Technical Analysis', score: technicalScore, max: 3 });

    // 4. Volume Analysis (0-2 points)
    const volumeScore = this.calculateVolumeScore(stockData, timeSeriesData);
    score += volumeScore;
    factors.push({ name: 'Volume Analysis', score: volumeScore, max: 2 });

    // Ensure score is between 0 and 10
    score = Math.max(0, Math.min(10, score));

    return {
      score: Math.round(score * 10) / 10,
      recommendation: this.getRecommendation(score),
      factors
    };
  }

  calculatePriceScore(stockData) {
    if (!stockData) return 0;

    const changePercent = stockData.changePercent || 0;
    let score = 0;

    // Positive performance gets higher score
    if (changePercent > 5) score = 2;
    else if (changePercent > 2) score = 1.5;
    else if (changePercent > 0) score = 1;
    else if (changePercent > -2) score = 0.5;
    else score = 0;

    return score;
  }

  calculateFundamentalScore(overviewData) {
    if (!overviewData) return 0;

    let score = 0;

    // P/E Ratio analysis
    const peRatio = overviewData.peRatio;
    if (peRatio && peRatio > 0 && peRatio < 25) {
      score += 1; // Good P/E ratio
    } else if (peRatio && peRatio >= 25 && peRatio < 35) {
      score += 0.5; // Moderate P/E ratio
    }

    // ROE analysis
    const roe = overviewData.roe;
    if (roe && roe > 15) {
      score += 1; // Strong ROE
    } else if (roe && roe > 10) {
      score += 0.5; // Decent ROE
    }

    // Profit Margin analysis
    const profitMargin = overviewData.profitMargin;
    if (profitMargin && profitMargin > 10) {
      score += 1; // Strong profit margin
    } else if (profitMargin && profitMargin > 5) {
      score += 0.5; // Decent profit margin
    }

    return Math.min(score, 3);
  }

  calculateTechnicalScore(stockData, timeSeriesData) {
    if (!stockData || !timeSeriesData || timeSeriesData.length < 20) return 0;

    let score = 0;

    // Moving Average analysis
    const currentPrice = stockData.price;
    const sma20 = this.calculateSMA(timeSeriesData, 20);
    const sma50 = this.calculateSMA(timeSeriesData, Math.min(50, timeSeriesData.length));

    if (sma20 && currentPrice > sma20) {
      score += 1; // Price above 20-day SMA
    }
    if (sma50 && currentPrice > sma50) {
      score += 1; // Price above 50-day SMA
    }

    // RSI analysis
    const rsi = this.calculateRSI(timeSeriesData, 14);
    if (rsi !== null) {
      if (rsi > 30 && rsi < 70) {
        score += 1; // RSI in healthy range
      } else if (rsi > 20 && rsi < 80) {
        score += 0.5; // RSI in moderate range
      }
    }

    return Math.min(score, 3);
  }

  calculateVolumeScore(stockData, timeSeriesData) {
    if (!stockData || !timeSeriesData || timeSeriesData.length < 5) return 0;

    let score = 0;

    // Current volume vs average volume
    const currentVolume = stockData.volume;
    const avgVolume = timeSeriesData.slice(-5).reduce((sum, data) => sum + data.volume, 0) / 5;

    if (currentVolume > avgVolume * 1.5) {
      score += 1; // High volume
    } else if (currentVolume > avgVolume) {
      score += 0.5; // Above average volume
    }

    // Volume trend
    const recentVolumes = timeSeriesData.slice(-5).map(data => data.volume);
    const isVolumeIncreasing = this.isIncreasingTrend(recentVolumes);
    if (isVolumeIncreasing) {
      score += 1; // Increasing volume trend
    }

    return Math.min(score, 2);
  }

  calculateSMA(data, period) {
    if (data.length < period) return null;
    
    const recentData = data.slice(-period);
    const sum = recentData.reduce((acc, item) => acc + item.close, 0);
    return sum / period;
  }

  calculateRSI(data, period = 14) {
    if (data.length < period + 1) return null;

    const recentData = data.slice(-period - 1);
    let gains = 0;
    let losses = 0;

    for (let i = 1; i < recentData.length; i++) {
      const change = recentData[i].close - recentData[i - 1].close;
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  isIncreasingTrend(values) {
    if (values.length < 3) return false;
    
    let increasingCount = 0;
    for (let i = 1; i < values.length; i++) {
      if (values[i] > values[i - 1]) {
        increasingCount++;
      }
    }
    
    return increasingCount >= values.length / 2;
  }

  getRecommendation(score) {
    if (score >= this.thresholds.buy) {
      return {
        action: 'BUY',
        color: 'green',
        description: 'Strong fundamentals and technical indicators suggest a buy opportunity.'
      };
    } else if (score >= this.thresholds.hold) {
      return {
        action: 'HOLD',
        color: 'yellow',
        description: 'Mixed signals suggest holding current position or waiting for better entry.'
      };
    } else {
      return {
        action: 'SELL',
        color: 'red',
        description: 'Weak fundamentals or technical indicators suggest considering a sell.'
      };
    }
  }
}

module.exports = new RecommendationEngine();
