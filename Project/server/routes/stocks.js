const express = require('express');
const router = express.Router();
const apiFetcher = require('../services/apiFetcher');
const recommendationEngine = require('../services/recommendationEngine');

// GET /api/stocks - Get all Nifty stocks with basic data
router.get('/', async (req, res) => {
  try {
    const stocks = await apiFetcher.fetchAllNiftyStocks();
    
    // Add basic recommendations for each stock
    const stocksWithRecommendations = await Promise.all(
      stocks.map(async (stock) => {
        const overview = await apiFetcher.fetchStockOverview(stock.symbol);
        const timeSeries = await apiFetcher.fetchTimeSeries(stock.symbol);
        const recommendation = recommendationEngine.calculateScore(stock, overview, timeSeries);
        
        return {
          ...stock,
          recommendation: recommendation.recommendation,
          score: recommendation.score,
          factors: recommendation.factors
        };
      })
    );

    res.json({
      success: true,
      data: stocksWithRecommendations,
      count: stocksWithRecommendations.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stocks data',
      message: error.message
    });
  }
});

// GET /api/stocks/:symbol - Get detailed data for a specific stock
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Fetch all data for the stock
    const [quote, overview, timeSeries] = await Promise.all([
      apiFetcher.fetchStockQuote(symbol),
      apiFetcher.fetchStockOverview(symbol),
      apiFetcher.fetchTimeSeries(symbol)
    ]);

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Stock not found',
        message: `No data found for symbol: ${symbol}`
      });
    }

    // Calculate comprehensive recommendation
    const recommendation = recommendationEngine.calculateScore(quote, overview, timeSeries);

    // Calculate technical indicators
    const technicalIndicators = calculateTechnicalIndicators(timeSeries);

    res.json({
      success: true,
      data: {
        quote,
        overview,
        timeSeries: timeSeries?.slice(-100) || [], // Last 100 data points
        recommendation,
        technicalIndicators
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error fetching stock ${req.params.symbol}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock data',
      message: error.message
    });
  }
});

// Helper function to calculate technical indicators
function calculateTechnicalIndicators(timeSeries) {
  if (!timeSeries || timeSeries.length < 20) {
    return {
      sma20: null,
      sma50: null,
      rsi: null,
      macd: null,
      bollingerBands: null
    };
  }

  const sma20 = calculateSMA(timeSeries, 20);
  const sma50 = calculateSMA(timeSeries, Math.min(50, timeSeries.length));
  const rsi = calculateRSI(timeSeries, 14);
  const macd = calculateMACD(timeSeries);
  const bollingerBands = calculateBollingerBands(timeSeries, 20);

  return {
    sma20,
    sma50,
    rsi,
    macd,
    bollingerBands
  };
}

function calculateSMA(data, period) {
  if (data.length < period) return null;
  
  const recentData = data.slice(-period);
  const sum = recentData.reduce((acc, item) => acc + item.close, 0);
  return sum / period;
}

function calculateRSI(data, period = 14) {
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

function calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  if (data.length < slowPeriod) return null;

  const ema12 = calculateEMA(data, fastPeriod);
  const ema26 = calculateEMA(data, slowPeriod);
  
  if (!ema12 || !ema26) return null;

  const macdLine = ema12 - ema26;
  
  // For simplicity, we'll return just the MACD line
  // In a full implementation, you'd also calculate the signal line and histogram
  return {
    macd: macdLine,
    signal: null, // Would need more complex calculation
    histogram: null
  };
}

function calculateEMA(data, period) {
  if (data.length < period) return null;

  const multiplier = 2 / (period + 1);
  let ema = data[0].close;

  for (let i = 1; i < data.length; i++) {
    ema = (data[i].close * multiplier) + (ema * (1 - multiplier));
  }

  return ema;
}

function calculateBollingerBands(data, period = 20, stdDev = 2) {
  if (data.length < period) return null;

  const sma = calculateSMA(data, period);
  if (!sma) return null;

  const recentData = data.slice(-period);
  const variance = recentData.reduce((acc, item) => {
    return acc + Math.pow(item.close - sma, 2);
  }, 0) / period;

  const standardDeviation = Math.sqrt(variance);

  return {
    upper: sma + (stdDev * standardDeviation),
    middle: sma,
    lower: sma - (stdDev * standardDeviation)
  };
}

module.exports = router;
