const axios = require('axios');
const NodeCache = require('node-cache');
const yahooFinance = require('yahoo-finance2').default;

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
      'RELIANCE.NSE', 'TCS.NSE', 'HDFCBANK.NSE', 'ICICIBANK.NSE', 'INFY.NSE',
      'HINDUNILVR.NSE', 'ITC.NSE', 'KOTAKBANK.NSE', 'LT.NSE', 'SBIN.NSE',
      'BHARTIARTL.NSE', 'AXISBANK.NSE', 'BAJFINANCE.NSE', 'ASIANPAINT.NSE', 'MARUTI.NSE',
      'HCLTECH.NSE', 'ULTRACEMCO.NSE', 'TITAN.NSE', 'SUNPHARMA.NSE', 'NESTLEIND.NSE',
      'POWERGRID.NSE', 'ONGC.NSE', 'NTPC.NSE', 'COALINDIA.NSE', 'TATASTEEL.NSE',
      'JSWSTEEL.NSE', 'GRASIM.NSE', 'M&M.NSE', 'WIPRO.NSE', 'TECHM.NSE',
      'ADANIENT.NSE', 'ADANIPORTS.NSE', 'TATAMOTORS.NSE', 'TATACONSUM.NSE', 'BPCL.NSE',
      'HDFCLIFE.NSE', 'SBILIFE.NSE', 'BRITANNIA.NSE', 'DIVISLAB.NSE', 'CIPLA.NSE',
      'DRREDDY.NSE', 'EICHERMOT.NSE', 'HEROMOTOCO.NSE', 'BAJAJ-AUTO.NSE', 'HINDALCO.NSE',
      'APOLLOHOSP.NSE', 'BAJAJFINSV.NSE', 'INDUSINDBK.NSE', 'UPL.NSE', 'TATAPOWER.NSE'
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
      console.log(`Fetching real-time quote via Yahoo Finance for ${symbol}...`);
      // Map AlphaVantage-style symbols to Yahoo symbols
      // BSE -> .BO, NSE -> .NS
      const yahooSymbol = symbol
        .replace(/\.BSE$/i, '.BO')
        .replace(/\.NSE$/i, '.NS');

      const data = await yahooFinance.quote(yahooSymbol);

      if (data && data.symbol) {
        // Yahoo provides change percent already as a percent value (e.g., -1.23)
        const changePercentFraction = typeof data.regularMarketChangePercent === 'number' ? data.regularMarketChangePercent : null;
        const quote = {
          symbol: symbol, // keep original symbol used across the app
          price: typeof data.regularMarketPrice === 'number' ? data.regularMarketPrice : null,
          change: typeof data.regularMarketChange === 'number' ? data.regularMarketChange : null,
          changePercent: changePercentFraction,
          volume: typeof data.regularMarketVolume === 'number' ? data.regularMarketVolume : null,
          high: typeof data.regularMarketDayHigh === 'number' ? data.regularMarketDayHigh : null,
          low: typeof data.regularMarketDayLow === 'number' ? data.regularMarketDayLow : null,
          open: typeof data.regularMarketOpen === 'number' ? data.regularMarketOpen : null,
          previousClose: typeof data.regularMarketPreviousClose === 'number' ? data.regularMarketPreviousClose : null,
          timestamp: new Date().toISOString()
        };

        console.log(`Successfully fetched Yahoo quote for ${symbol}:`, quote);
        cache.set(cacheKey, quote);
        return quote;
      } else {
        console.log(`No Yahoo data found for ${symbol}`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching Yahoo quote for ${symbol}:`, error.message);
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
      const yahooSymbol = symbol
        .replace(/\.BSE$/i, '.BO')
        .replace(/\.NSE$/i, '.NS');

      // Helper to extract number from yahoo objects or numbers
      const toNumber = (val) => {
        if (val === null || val === undefined) return null;
        if (typeof val === 'number') return val;
        if (typeof val === 'object' && typeof val.raw === 'number') return val.raw;
        if (typeof val === 'string') {
          const n = parseFloat(val.replace(/[,\s]/g, ''));
          return Number.isNaN(n) ? null : n;
        }
        return null;
      };

      // Fetch broader set of modules for fundamentals
      const data = await yahooFinance.quoteSummary(yahooSymbol, {
        modules: ['price', 'summaryDetail', 'defaultKeyStatistics', 'assetProfile', 'financialData']
      });

      const price = data?.price || {};
      const summaryDetail = data?.summaryDetail || {};
      const keyStats = data?.defaultKeyStatistics || {};
      const assetProfile = data?.assetProfile || {};
      const financialData = data?.financialData || {};

      const marketCap = toNumber(price.marketCap) ?? toNumber(summaryDetail.marketCap) ?? toNumber(keyStats.marketCap);
      const peRatio = toNumber(summaryDetail.trailingPE) ?? toNumber(keyStats.trailingPE) ?? toNumber(price.trailingPE);
      const pegRatio = toNumber(keyStats.pegRatio) ?? toNumber(price.pegRatio);
      const eps = toNumber(keyStats.trailingEps) ?? toNumber(keyStats.epsTrailingTwelveMonths) ?? toNumber(financialData.epsTrailingTwelveMonths) ?? toNumber(price.epsTrailingTwelveMonths);
      const bookValue = toNumber(keyStats.bookValue) ?? toNumber(price.bookValue);
      const dividendYieldPct = (toNumber(summaryDetail.dividendYield) ?? toNumber(summaryDetail.trailingAnnualDividendYield) ?? null);
      const profitMarginsPct = (toNumber(financialData.profitMargins) ?? toNumber(summaryDetail.profitMargins) ?? toNumber(keyStats.profitMargins));
      const roePct = toNumber(financialData.returnOnEquity) ?? toNumber(keyStats.returnOnEquity);
      const roaPct = toNumber(financialData.returnOnAssets) ?? toNumber(keyStats.returnOnAssets);
      const revenueTTM = toNumber(financialData.totalRevenue) ?? toNumber(keyStats.revenueTTM);
      const grossProfitTTM = toNumber(financialData.grossProfits) ?? toNumber(keyStats.grossProfits);

      const overview = {
        symbol: symbol,
        name: price?.shortName || price?.longName || null,
        description: assetProfile?.longBusinessSummary || null,
        sector: assetProfile?.sector || null,
        industry: assetProfile?.industry || null,
        marketCap: marketCap,
        peRatio: peRatio,
        pegRatio: pegRatio,
        eps: eps,
        bookValue: bookValue,
        dividendYield: dividendYieldPct !== null ? dividendYieldPct * 100 : null,
        roe: roePct !== null ? roePct * 100 : null,
        roa: roaPct !== null ? roaPct * 100 : null,
        profitMargin: profitMarginsPct !== null ? profitMarginsPct * 100 : null,
        revenueTTM: revenueTTM,
        grossProfitTTM: grossProfitTTM,
        timestamp: new Date().toISOString()
      };

      cache.set(cacheKey, overview);
      return overview;
    } catch (error) {
      console.error(`Error fetching Yahoo overview for ${symbol}:`, error.message);
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
      const yahooSymbol = symbol
        .replace(/\.BSE$/i, '.BO')
        .replace(/\.NSE$/i, '.NS');

      // Use daily historical data for the last 90 days for stable charts
      const period2 = new Date();
      const period1 = new Date();
      period1.setDate(period1.getDate() - 90);

      const hist = await yahooFinance.historical(yahooSymbol, {
        period1,
        period2,
        interval: '1d'
      });

      if (Array.isArray(hist) && hist.length > 0) {
        const timeSeries = hist.map(item => ({
          timestamp: new Date(item.date).toISOString(),
          open: item.open ?? null,
          high: item.high ?? null,
          low: item.low ?? null,
          close: item.close ?? null,
          volume: item.volume ?? null
        }));

        cache.set(cacheKey, timeSeries);
        return timeSeries;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching Yahoo time series for ${symbol}:`, error.message);
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
