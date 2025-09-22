const express = require('express');
const router = express.Router();
const apiFetcher = require('../services/apiFetcher');
const recommendationEngine = require('../services/recommendationEngine');

// GET /api/recommendations - Get all stock recommendations
router.get('/', async (req, res) => {
  try {
    const { sortBy = 'score', order = 'desc' } = req.query;
    
    const stocks = await apiFetcher.fetchAllNiftyStocks();
    
    // Calculate recommendations for all stocks
    const recommendations = await Promise.all(
      stocks.map(async (stock) => {
        const overview = await apiFetcher.fetchStockOverview(stock.symbol);
        const timeSeries = await apiFetcher.fetchTimeSeries(stock.symbol);
        const recommendation = recommendationEngine.calculateScore(stock, overview, timeSeries);
        
        return {
          symbol: stock.symbol,
          name: overview?.name || stock.symbol,
          price: stock.price,
          change: stock.change,
          changePercent: stock.changePercent,
          volume: stock.volume,
          recommendation: recommendation.recommendation,
          score: recommendation.score,
          factors: recommendation.factors,
          sector: overview?.sector || 'Unknown',
          marketCap: overview?.marketCap || null,
          peRatio: overview?.peRatio || null,
          timestamp: new Date().toISOString()
        };
      })
    );

    // Sort recommendations
    const sortedRecommendations = sortRecommendations(recommendations, sortBy, order);

    // Group by recommendation type
    const grouped = {
      buy: sortedRecommendations.filter(r => r.recommendation.action === 'BUY'),
      hold: sortedRecommendations.filter(r => r.recommendation.action === 'HOLD'),
      sell: sortedRecommendations.filter(r => r.recommendation.action === 'SELL')
    };

    res.json({
      success: true,
      data: {
        recommendations: sortedRecommendations,
        grouped,
        summary: {
          total: recommendations.length,
          buy: grouped.buy.length,
          hold: grouped.hold.length,
          sell: grouped.sell.length
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recommendations',
      message: error.message
    });
  }
});

// GET /api/recommendations/top - Get top performing stocks
router.get('/top', async (req, res) => {
  try {
    const { limit = 10, type = 'all' } = req.query;
    
    const stocks = await apiFetcher.fetchAllNiftyStocks();
    
    const recommendations = await Promise.all(
      stocks.map(async (stock) => {
        const overview = await apiFetcher.fetchStockOverview(stock.symbol);
        const timeSeries = await apiFetcher.fetchTimeSeries(stock.symbol);
        const recommendation = recommendationEngine.calculateScore(stock, overview, timeSeries);
        
        return {
          symbol: stock.symbol,
          name: overview?.name || stock.symbol,
          price: stock.price,
          change: stock.change,
          changePercent: stock.changePercent,
          recommendation: recommendation.recommendation,
          score: recommendation.score,
          sector: overview?.sector || 'Unknown'
        };
      })
    );

    let filteredRecommendations = recommendations;

    // Filter by recommendation type if specified
    if (type !== 'all') {
      filteredRecommendations = recommendations.filter(r => 
        r.recommendation.action.toLowerCase() === type.toLowerCase()
      );
    }

    // Sort by score and limit results
    const topRecommendations = filteredRecommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: topRecommendations,
      count: topRecommendations.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching top recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top recommendations',
      message: error.message
    });
  }
});

// Helper function to sort recommendations
function sortRecommendations(recommendations, sortBy, order) {
  return recommendations.sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'score':
        aValue = a.score;
        bValue = b.score;
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'change':
        aValue = a.change;
        bValue = b.change;
        break;
      case 'changePercent':
        aValue = a.changePercent;
        bValue = b.changePercent;
        break;
      case 'volume':
        aValue = a.volume;
        bValue = b.volume;
        break;
      case 'symbol':
        aValue = a.symbol.toLowerCase();
        bValue = b.symbol.toLowerCase();
        break;
      default:
        aValue = a.score;
        bValue = b.score;
    }

    if (order === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
}

module.exports = router;
