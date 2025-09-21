import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Minus, BarChart3, Activity, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StockDetailModal = ({ stock, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !stock) return null;

  const { quote, overview, timeSeries, recommendation, technicalIndicators } = stock;

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

  const getPriceChangeColor = () => {
    const changePercent = quote?.changePercent || 0;
    if (changePercent > 0) return 'text-success-600';
    if (changePercent < 0) return 'text-danger-600';
    return 'text-gray-600';
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

  // Prepare chart data
  const chartData = timeSeries?.slice(-30).map(item => ({
    time: new Date(item.timestamp).toLocaleDateString(),
    price: item.close,
    volume: item.volume
  })) || [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'technical', label: 'Technical', icon: Activity },
    { id: 'fundamentals', label: 'Fundamentals', icon: DollarSign }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {quote?.symbol || 'N/A'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {overview?.name || 'Stock Details'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {formatPrice(quote?.price)}
                </p>
                <div className={`flex items-center gap-2 text-lg ${getPriceChangeColor()}`}>
                  {quote?.changePercent > 0 ? <TrendingUp className="w-5 h-5" /> :
                   quote?.changePercent < 0 ? <TrendingDown className="w-5 h-5" /> :
                   <Minus className="w-5 h-5" />}
                  <span>{formatChange(quote?.change)}</span>
                  <span>({formatChangePercent(quote?.changePercent)})</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Recommendation:
                  </span>
                  <span className={`score-badge ${getScoreBadgeClass()}`}>
                    {recommendation?.score ? (typeof recommendation.score === 'number' ? recommendation.score.toFixed(1) : recommendation.score) : 'N/A'}
                  </span>
                </div>
                <p className={`text-lg font-semibold ${
                  recommendation?.action === 'BUY' ? 'text-success-600' :
                  recommendation?.action === 'HOLD' ? 'text-warning-600' :
                  'text-danger-600'
                }`}>
                  {recommendation?.action || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Price Chart */}
                {chartData.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Price Chart (Last 30 Days)
                    </h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [`₹${value.toFixed(2)}`, 'Price']}
                            labelFormatter={(label) => `Date: ${label}`}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#0ea5e9" 
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Recommendation Details */}
                {recommendation && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Recommendation Analysis
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {recommendation.description}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendation.factors?.map((factor, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {factor.name}:
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {typeof factor.score === 'number' ? factor.score.toFixed(1) : factor.score}/{factor.max}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'technical' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Technical Indicators
                </h4>
                
                {technicalIndicators ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="card p-4">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Moving Averages
                        </h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">SMA 20:</span>
                            <span className="text-sm font-medium">
                              {technicalIndicators.sma20 ? `₹${typeof technicalIndicators.sma20 === 'number' ? technicalIndicators.sma20.toFixed(2) : technicalIndicators.sma20}` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">SMA 50:</span>
                            <span className="text-sm font-medium">
                              {technicalIndicators.sma50 ? `₹${typeof technicalIndicators.sma50 === 'number' ? technicalIndicators.sma50.toFixed(2) : technicalIndicators.sma50}` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="card p-4">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          RSI (14)
                        </h5>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Current:</span>
                          <span className="text-sm font-medium">
                            {technicalIndicators.rsi ? (typeof technicalIndicators.rsi === 'number' ? technicalIndicators.rsi.toFixed(2) : technicalIndicators.rsi) : 'N/A'}
                          </span>
                        </div>
                        {technicalIndicators.rsi && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-primary-600 h-2 rounded-full" 
                                style={{ width: `${Math.min(100, Math.max(0, technicalIndicators.rsi))}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>0</span>
                              <span>50</span>
                              <span>100</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {technicalIndicators.bollingerBands && (
                        <div className="card p-4">
                          <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Bollinger Bands
                          </h5>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Upper:</span>
                              <span className="text-sm font-medium">
                                ₹{typeof technicalIndicators.bollingerBands.upper === 'number' ? technicalIndicators.bollingerBands.upper.toFixed(2) : technicalIndicators.bollingerBands.upper}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Middle:</span>
                              <span className="text-sm font-medium">
                                ₹{typeof technicalIndicators.bollingerBands.middle === 'number' ? technicalIndicators.bollingerBands.middle.toFixed(2) : technicalIndicators.bollingerBands.middle}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Lower:</span>
                              <span className="text-sm font-medium">
                                ₹{typeof technicalIndicators.bollingerBands.lower === 'number' ? technicalIndicators.bollingerBands.lower.toFixed(2) : technicalIndicators.bollingerBands.lower}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {technicalIndicators.macd && (
                        <div className="card p-4">
                          <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                            MACD
                          </h5>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">MACD Line:</span>
                            <span className="text-sm font-medium">
                              {technicalIndicators.macd.macd ? (typeof technicalIndicators.macd.macd === 'number' ? technicalIndicators.macd.macd.toFixed(4) : technicalIndicators.macd.macd) : 'N/A'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                    Technical indicators not available
                  </p>
                )}
              </div>
            )}

            {activeTab === 'fundamentals' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Fundamental Analysis
                </h4>
                
                {overview ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="card p-4">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                          Company Information
                        </h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Sector:</span>
                            <span className="text-sm font-medium">{overview.sector || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Industry:</span>
                            <span className="text-sm font-medium">{overview.industry || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Market Cap:</span>
                            <span className="text-sm font-medium">
                              {overview.marketCap ? `₹${(overview.marketCap / 1000000000).toFixed(2)}B` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="card p-4">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                          Key Metrics
                        </h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">P/E Ratio:</span>
                            <span className="text-sm font-medium">{overview.peRatio || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">EPS:</span>
                            <span className="text-sm font-medium">{overview.eps || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">ROE:</span>
                            <span className="text-sm font-medium">
                              {overview.roe ? `${typeof overview.roe === 'number' ? overview.roe.toFixed(2) : overview.roe}%` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">ROA:</span>
                            <span className="text-sm font-medium">
                              {overview.roa ? `${typeof overview.roa === 'number' ? overview.roa.toFixed(2) : overview.roa}%` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Profit Margin:</span>
                            <span className="text-sm font-medium">
                              {overview.profitMargin ? `${typeof overview.profitMargin === 'number' ? overview.profitMargin.toFixed(2) : overview.profitMargin}%` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Dividend Yield:</span>
                            <span className="text-sm font-medium">
                              {overview.dividendYield ? `${typeof overview.dividendYield === 'number' ? overview.dividendYield.toFixed(2) : overview.dividendYield}%` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                    Fundamental data not available
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetailModal;
