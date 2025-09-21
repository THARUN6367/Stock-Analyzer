const axios = require('axios');
const NodeCache = require('node-cache');

// Cache for 1 minute by default
const cache = new NodeCache({ stdTTL: 60 });

class ApiFetcher {
  constructor() {
    this.apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    this.baseUrl = 'https://www.alphavantage.co/query';
  }

  // Nifty 50 stock symbols - starting with just 5 for testing
  getNiftySymbols() {
    return [
      'RELIANCE.BSE', 'TCS.BSE', 'HDFCBANK.BSE', 'INFY.BSE', 'HINDUNILVR.BSE'
    ];
  }

  async fetchStockQuote(symbol) {
    const cacheKey = `quote_${symbol}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      console.log(`Using cached data for ${symbol}`);
      return cached;
    }

    try {
      console.log(`Fetching quote for ${symbol}...`);
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: this.apiKey
        }
      });

      console.log(`API Response for ${symbol}:`, response.data);

      const data = response.data['Global Quote'];
      if (data && data['01. symbol']) {
        const quote = {
          symbol: data['01. symbol'],
          price: parseFloat(data['05. price']),
          change: parseFloat(data['09. change']),
          changePercent: parseFloat(data['10. change percent'].replace('%', '')),
          volume: parseInt(data['06. volume']),
          high: parseFloat(data['03. high']),
          low: parseFloat(data['04. low']),
          open: parseFloat(data['02. open']),
          previousClose: parseFloat(data['08. previous close']),
          timestamp: new Date().toISOString()
        };

        console.log(`Successfully fetched quote for ${symbol}:`, quote);
        cache.set(cacheKey, quote);
        return quote;
      } else {
        console.log(`No data found for ${symbol}:`, response.data);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error.message);
      return null;
    }
  }

  async fetchStockOverview(symbol) {
    const cacheKey = `overview_${symbol}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'OVERVIEW',
          symbol: symbol,
          apikey: this.apiKey
        }
      });

      const data = response.data;
      if (data && data.Symbol) {
        const overview = {
          symbol: data.Symbol,
          name: data.Name,
          description: data.Description,
          sector: data.Sector,
          industry: data.Industry,
          marketCap: data.MarketCapitalization,
          peRatio: data.PERatio ? parseFloat(data.PERatio) : null,
          pegRatio: data.PEGRatio ? parseFloat(data.PEGRatio) : null,
          eps: data.EPS ? parseFloat(data.EPS) : null,
          bookValue: data.BookValue ? parseFloat(data.BookValue) : null,
          dividendYield: data.DividendYield ? parseFloat(data.DividendYield) : null,
          roe: data.ReturnOnEquityTTM ? parseFloat(data.ReturnOnEquityTTM) : null,
          roa: data.ReturnOnAssetsTTM ? parseFloat(data.ReturnOnAssetsTTM) : null,
          profitMargin: data.ProfitMargin ? parseFloat(data.ProfitMargin) : null,
          revenueTTM: data.RevenueTTM ? parseFloat(data.RevenueTTM) : null,
          grossProfitTTM: data.GrossProfitTTM ? parseFloat(data.GrossProfitTTM) : null,
          timestamp: new Date().toISOString()
        };

        cache.set(cacheKey, overview);
        return overview;
      }
    } catch (error) {
      console.error(`Error fetching overview for ${symbol}:`, error.message);
      return null;
    }
  }

  async fetchTimeSeries(symbol, interval = '5min') {
    const cacheKey = `timeseries_${symbol}_${interval}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'TIME_SERIES_INTRADAY',
          symbol: symbol,
          interval: interval,
          apikey: this.apiKey
        }
      });

      const timeSeriesData = response.data[`Time Series (${interval})`];
      if (timeSeriesData) {
        const timeSeries = Object.entries(timeSeriesData).map(([timestamp, data]) => ({
          timestamp,
          open: parseFloat(data['1. open']),
          high: parseFloat(data['2. high']),
          low: parseFloat(data['3. low']),
          close: parseFloat(data['4. close']),
          volume: parseInt(data['5. volume'])
        })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        cache.set(cacheKey, timeSeries);
        return timeSeries;
      }
    } catch (error) {
      console.error(`Error fetching time series for ${symbol}:`, error.message);
      return null;
    }
  }

  async fetchAllNiftyStocks() {
    const symbols = this.getNiftySymbols();
    const promises = symbols.map(symbol => this.fetchStockQuote(symbol));
    const results = await Promise.allSettled(promises);
    
    return results
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value);
  }
}

module.exports = new ApiFetcher();
