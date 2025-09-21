import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import StockDashboard from './components/StockDashboard';
import StockDetailModal from './components/StockDetailModal';
import { fetchStocks, fetchStockDetail } from './services/api';
import { useTheme } from './hooks/useTheme';

function App() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterBy, setFilterBy] = useState('all');
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    loadStocks();
    // Refresh data every 60 seconds
    const interval = setInterval(loadStocks, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadStocks = async () => {
    try {
      setLoading(true);
      const data = await fetchStocks();
      setStocks(data);
      setError(null);
    } catch (err) {
      setError('Failed to load stocks data');
      console.error('Error loading stocks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStockClick = async (symbol) => {
    try {
      setLoading(true);
      const stockDetail = await fetchStockDetail(symbol);
      setSelectedStock(stockDetail);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error loading stock detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStock(null);
  };

  const filteredAndSortedStocks = stocks
    .filter(stock => {
      const matchesSearch = stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (stock.name && stock.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = filterBy === 'all' || 
                           (filterBy === 'buy' && stock.recommendation?.action === 'BUY') ||
                           (filterBy === 'hold' && stock.recommendation?.action === 'HOLD') ||
                           (filterBy === 'sell' && stock.recommendation?.action === 'SELL');
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'score':
          aValue = typeof a.score === 'number' ? a.score : parseFloat(a.score) || 0;
          bValue = typeof b.score === 'number' ? b.score : parseFloat(b.score) || 0;
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'change':
          aValue = a.changePercent || 0;
          bValue = b.changePercent || 0;
          break;
        case 'volume':
          aValue = a.volume || 0;
          bValue = b.volume || 0;
          break;
        case 'symbol':
          aValue = a.symbol.toLowerCase();
          bValue = b.symbol.toLowerCase();
          break;
        default:
          aValue = a.score || 0;
          bValue = b.score || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Header 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          filterBy={filterBy}
          setFilterBy={setFilterBy}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onRefresh={loadStocks}
          loading={loading}
        />
        
        <main className="container mx-auto px-4 py-6">
          <StockDashboard
            stocks={filteredAndSortedStocks}
            loading={loading}
            error={error}
            onStockClick={handleStockClick}
          />
        </main>

        {isModalOpen && selectedStock && (
          <StockDetailModal
            stock={selectedStock}
            isOpen={isModalOpen}
            onClose={closeModal}
          />
        )}

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: isDarkMode ? '#374151' : '#fff',
              color: isDarkMode ? '#f9fafb' : '#111827',
            },
          }}
        />
      </div>
    </div>
  );
}

export default App;
