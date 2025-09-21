# Nifty Stock Analyzer

A professional full-stack web application that provides AI-powered buy/hold/sell recommendations for all Nifty 50 stocks using real-time and historical data from free APIs.

## 🚀 Features

### Core Functionality
- **Real-time Stock Data**: Live prices and market data for all Nifty 50 stocks
- **AI-Powered Recommendations**: Composite scoring algorithm (0-10) with buy/hold/sell signals
- **Comprehensive Analysis**: Technical indicators, fundamental metrics, and trend analysis
- **Interactive Dashboard**: Responsive grid layout with live updates every 60 seconds

### User Experience
- **Search & Filter**: Quick stock search and filter by recommendation type
- **Sorting Options**: Sort by score, price, change percentage, volume, or alphabetically
- **Dark/Light Mode**: Toggle between themes with persistent preferences
- **Detailed Stock Views**: Click any stock for comprehensive analysis popup
- **Professional UI**: Modern design with Tailwind CSS and smooth animations

### Technical Features
- **Caching System**: Server-side caching to respect API rate limits
- **Error Handling**: Robust error handling and user feedback
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Automatic data refresh without page reload

## 🏗️ Architecture

### Backend (Node.js + Express)
- **API Integration**: Alpha Vantage API for real-time and historical data
- **Recommendation Engine**: Multi-factor scoring algorithm
- **Caching Layer**: Node-cache for efficient data management
- **RESTful API**: Clean endpoints for frontend consumption

### Frontend (React + Tailwind CSS)
- **Component Architecture**: Modular, reusable React components
- **State Management**: React hooks for efficient state handling
- **Chart Integration**: Recharts for interactive price charts
- **Theme System**: Custom dark/light mode implementation

## 📊 Recommendation Algorithm

The recommendation engine calculates a composite score (0-10) based on:

1. **Price Performance (0-2 points)**
   - Recent price changes and momentum
   - Performance relative to market

2. **Fundamental Analysis (0-3 points)**
   - P/E ratio analysis
   - Return on Equity (ROE)
   - Profit margin evaluation

3. **Technical Analysis (0-3 points)**
   - Moving averages (SMA 20, SMA 50)
   - RSI (Relative Strength Index)
   - Trend analysis

4. **Volume Analysis (0-2 points)**
   - Current volume vs average
   - Volume trend analysis

### Recommendation Thresholds
- **≥8.0**: BUY (Green) - Strong fundamentals and technical indicators
- **5.0-7.9**: HOLD (Yellow) - Mixed signals, wait for better entry
- **<5.0**: SELL (Red) - Weak fundamentals or technical indicators

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Alpha Vantage API key (free tier available)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd nifty-stock-analyzer
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (root, server, and client)
npm run install-all
```

### 3. Environment Configuration
```bash
# Copy environment template
cp env.example .env

# Edit .env file with your API key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
PORT=5000
NODE_ENV=development
CACHE_DURATION=60000
```

### 4. Get Alpha Vantage API Key
1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Sign up for a free account
3. Get your API key
4. Add it to your `.env` file

### 5. Start the Application
```bash
# Start both frontend and backend in development mode
npm run dev

# Or start them separately:
# Backend only
npm run server

# Frontend only
npm run client
```

### 6. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
nifty-stock-analyzer/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layer
│   │   └── App.js         # Main App component
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   │   ├── apiFetcher.js  # Alpha Vantage integration
│   │   └── recommendationEngine.js
│   ├── index.js           # Server entry point
│   └── package.json
├── package.json           # Root package.json
├── env.example           # Environment template
└── README.md
```

## 🔧 API Endpoints

### Stocks
- `GET /api/stocks` - Get all Nifty stocks with recommendations
- `GET /api/stocks/:symbol` - Get detailed data for specific stock

### Recommendations
- `GET /api/recommendations` - Get all recommendations with filtering
- `GET /api/recommendations/top` - Get top performing stocks

### Health Check
- `GET /api/health` - Server health status

## 🎨 UI Components

### Main Components
- **Header**: Search, filters, sorting, and theme toggle
- **StockDashboard**: Grid layout with summary statistics
- **StockCard**: Individual stock display with key metrics
- **StockDetailModal**: Comprehensive stock analysis popup

### Features
- **Search Bar**: Real-time stock filtering
- **Sort Controls**: Multiple sorting options
- **Filter Dropdown**: Filter by recommendation type
- **Theme Toggle**: Dark/light mode switcher
- **Responsive Grid**: Adaptive layout for all screen sizes

## 📈 Data Sources

### Alpha Vantage API
- **Real-time Quotes**: Current prices and market data
- **Historical Data**: Time series for technical analysis
- **Fundamental Data**: P/E, EPS, ROE, and other metrics
- **Company Overview**: Sector, industry, and market cap

### Caching Strategy
- **Quote Data**: 1-minute cache for real-time feel
- **Overview Data**: 5-minute cache for fundamental data
- **Time Series**: 1-minute cache for technical analysis

## 🚀 Deployment

### Production Build
```bash
# Build the React frontend
npm run build

# Start production server
npm start
```

### Environment Variables for Production
```bash
NODE_ENV=production
PORT=5000
ALPHA_VANTAGE_API_KEY=your_production_api_key
CACHE_DURATION=60000
```

### Deployment Platforms
- **Vercel**: Full-stack deployment with serverless functions
- **Render**: Easy deployment with automatic builds
- **Heroku**: Traditional hosting with buildpacks
- **Railway**: Modern deployment platform

## 🔍 Usage Guide

### Dashboard Overview
1. **View All Stocks**: See all Nifty 50 stocks with live data
2. **Search Stocks**: Use the search bar to find specific stocks
3. **Filter Recommendations**: Filter by buy/hold/sell signals
4. **Sort Data**: Sort by various metrics for better analysis

### Stock Analysis
1. **Click Any Stock**: Open detailed analysis popup
2. **View Charts**: Interactive price charts with technical indicators
3. **Check Fundamentals**: P/E, ROE, profit margins, and more
4. **Read Recommendations**: Detailed explanation of scoring factors

### Customization
1. **Theme Toggle**: Switch between dark and light modes
2. **Auto-refresh**: Data updates automatically every 60 seconds
3. **Responsive Design**: Works on all device sizes

## 🛡️ Error Handling

- **API Failures**: Graceful degradation with user-friendly messages
- **Network Issues**: Retry mechanisms and offline indicators
- **Data Validation**: Input sanitization and error boundaries
- **Rate Limiting**: Respectful API usage with caching

## 🔮 Future Enhancements

- **Portfolio Tracking**: Add stocks to watchlist
- **Alerts System**: Price and recommendation alerts
- **Advanced Charts**: More technical indicators and overlays
- **Export Features**: Download data and reports
- **Mobile App**: React Native version
- **Real-time Updates**: WebSocket integration for live data

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check the documentation
- Review the API documentation

---

**Built with ❤️ for the Indian stock market community**
