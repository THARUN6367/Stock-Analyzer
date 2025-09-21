import React from 'react';
import { Search, RefreshCw, Sun, Moon, TrendingUp, Filter } from 'lucide-react';

const Header = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  filterBy,
  setFilterBy,
  isDarkMode,
  toggleTheme,
  onRefresh,
  loading
}) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">Nifty Stock Analyzer</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered stock recommendations
              </p>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="input-field pl-10 pr-8 appearance-none cursor-pointer"
                >
                  <option value="all">All Stocks</option>
                  <option value="buy">Buy Recommendations</option>
                  <option value="hold">Hold Recommendations</option>
                  <option value="sell">Sell Recommendations</option>
                </select>
              </div>

              {/* Sort Dropdown */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="input-field pr-8 appearance-none cursor-pointer"
              >
                <option value="score-desc">Score (High to Low)</option>
                <option value="score-asc">Score (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="change-desc">Change % (High to Low)</option>
                <option value="change-asc">Change % (Low to High)</option>
                <option value="volume-desc">Volume (High to Low)</option>
                <option value="volume-asc">Volume (Low to High)</option>
                <option value="symbol-asc">Symbol (A to Z)</option>
                <option value="symbol-desc">Symbol (Z to A)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={onRefresh}
                disabled={loading}
                className="btn-secondary flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={toggleTheme}
                className="btn-secondary flex items-center gap-2"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
