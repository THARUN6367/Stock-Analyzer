import React from 'react';
import { TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';

const StockCard = ({ stock, onClick }) => {
  const {
    symbol,
    name,
    price,
    change,
    changePercent,
    volume,
    recommendation,
    score
  } = stock;

  const getPriceChangeIcon = () => {
    if (changePercent > 0) return <TrendingUp className="w-4 h-4" />;
    if (changePercent < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getPriceChangeColor = () => {
    if (changePercent > 0) return 'price-positive';
    if (changePercent < 0) return 'price-negative';
    return 'price-neutral';
  };

  const getScoreBadgeClass = () => {
    if (!recommendation) return 'score-hold';
    switch (recommendation.action) {
      case 'BUY': return 'score-buy';
      case 'HOLD': return 'score-hold';
      case 'SELL': return 'score-sell';
      default: return 'score-hold';
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    return `₹${price.toFixed(2)}`;
  };

  const formatChange = (change) => {
    if (change === null || change === undefined) return 'N/A';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}`;
  };

  const formatChangePercent = (percent) => {
    if (percent === null || percent === undefined) return 'N/A';
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  const formatVolume = (vol) => {
    if (vol === null || vol === undefined) return 'N/A';
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
    return vol.toString();
  };

  return (
    <div
      className="card p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {symbol}
          </h3>
          {name && (
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {name}
            </p>
          )}
        </div>
        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
      </div>

      <div className="space-y-3">
        {/* Price and Change */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatPrice(price)}
            </p>
            <div className={`flex items-center gap-1 text-sm ${getPriceChangeColor()}`}>
              {getPriceChangeIcon()}
              <span>{formatChange(change)}</span>
              <span>({formatChangePercent(changePercent)})</span>
            </div>
          </div>
        </div>

        {/* Recommendation Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Score:
            </span>
                <span className={`score-badge ${getScoreBadgeClass()}`}>
                  {score ? (typeof score === 'number' ? score.toFixed(1) : score) : 'N/A'}
                </span>
          </div>
          {recommendation && (
            <span className={`text-sm font-medium ${
              recommendation.action === 'BUY' ? 'text-success-600' :
              recommendation.action === 'HOLD' ? 'text-warning-600' :
              'text-danger-600'
            }`}>
              {recommendation.action}
            </span>
          )}
        </div>

        {/* Volume */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Volume:</span>
          <span>{formatVolume(volume)}</span>
        </div>

        {/* Recommendation Description */}
        {recommendation && recommendation.description && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              {recommendation.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockCard;
