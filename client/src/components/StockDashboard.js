import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import StockCard from './StockCard';

const StockDashboard = ({ stocks, loading, error, onStockClick }) => {
  if (loading && stocks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading stocks data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-danger-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Stocks Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const summary = {
    total: stocks.length,
    buy: stocks.filter(s => s.recommendation?.action === 'BUY').length,
    hold: stocks.filter(s => s.recommendation?.action === 'HOLD').length,
    sell: stocks.filter(s => s.recommendation?.action === 'SELL').length,
    avgScore: stocks.reduce((sum, s) => sum + (typeof s.score === 'number' ? s.score : parseFloat(s.score) || 0), 0) / stocks.length,
    gainers: stocks.filter(s => (s.changePercent || 0) > 0).length,
    losers: stocks.filter(s => (s.changePercent || 0) < 0).length,
    unchanged: stocks.filter(s => (s.changePercent || 0) === 0).length
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Stocks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{summary.total}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Buy Signals</p>
              <p className="text-2xl font-bold text-success-600">{summary.buy}</p>
            </div>
            <div className="w-8 h-8 bg-success-100 dark:bg-success-900 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-success-600" />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hold Signals</p>
              <p className="text-2xl font-bold text-warning-600">{summary.hold}</p>
            </div>
            <div className="w-8 h-8 bg-warning-100 dark:bg-warning-900 rounded-full flex items-center justify-center">
              <Minus className="w-4 h-4 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sell Signals</p>
              <p className="text-2xl font-bold text-danger-600">{summary.sell}</p>
            </div>
            <div className="w-8 h-8 bg-danger-100 dark:bg-danger-900 rounded-full flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-danger-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Market Performance Summary */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Market Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-success-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Gainers</span>
            </div>
            <p className="text-2xl font-bold text-success-600">{summary.gainers}</p>
            <p className="text-xs text-gray-500">
              {((summary.gainers / summary.total) * 100).toFixed(1)}%
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Minus className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Unchanged</span>
            </div>
            <p className="text-2xl font-bold text-gray-500">{summary.unchanged}</p>
            <p className="text-xs text-gray-500">
              {((summary.unchanged / summary.total) * 100).toFixed(1)}%
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-danger-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Losers</span>
            </div>
            <p className="text-2xl font-bold text-danger-600">{summary.losers}</p>
            <p className="text-xs text-gray-500">
              {((summary.losers / summary.total) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Stocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stocks.map((stock) => (
          <StockCard
            key={stock.symbol}
            stock={stock}
            onClick={() => onStockClick(stock.symbol)}
          />
        ))}
      </div>

      {loading && stocks.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            <span>Updating data...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockDashboard;
