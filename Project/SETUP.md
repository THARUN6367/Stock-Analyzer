# Setup Guide for Nifty Stock Analyzer

## Prerequisites

Before running the application, you need to install Node.js and npm on your system.

### Installing Node.js

#### Option 1: Download from Official Website
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the LTS version (recommended)
3. Run the installer and follow the instructions
4. Verify installation by running `node --version` and `npm --version`

#### Option 2: Using Package Managers

**macOS (using Homebrew):**
```bash
brew install node
```

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows (using Chocolatey):**
```bash
choco install nodejs
```

### Verify Installation
```bash
node --version  # Should show v14 or higher
npm --version   # Should show npm version
```

## Quick Start

### 1. Install Dependencies
```bash
# Navigate to project directory
cd "nifty-stock-analyzer"

# Install all dependencies
npm run install-all
```

### 2. Get Alpha Vantage API Key
1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Sign up for a free account (no credit card required)
3. Get your API key from the dashboard
4. Copy the key for the next step

### 3. Configure Environment
```bash
# Copy environment template
cp env.example .env

# Edit .env file and add your API key
# Replace 'your_alpha_vantage_api_key_here' with your actual key
ALPHA_VANTAGE_API_KEY=your_actual_api_key_here
PORT=5000
NODE_ENV=development
CACHE_DURATION=60000
```

### 4. Start the Application
```bash
# Start both frontend and backend
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Manual Installation Steps

If the automated script doesn't work, follow these steps:

### 1. Root Dependencies
```bash
npm install
```

### 2. Server Dependencies
```bash
cd server
npm install
cd ..
```

### 3. Client Dependencies
```bash
cd client
npm install
cd ..
```

### 4. Environment Setup
```bash
# Create .env file
echo "ALPHA_VANTAGE_API_KEY=your_api_key_here" > .env
echo "PORT=5000" >> .env
echo "NODE_ENV=development" >> .env
echo "CACHE_DURATION=60000" >> .env
```

## Troubleshooting

### Common Issues

#### 1. Node.js Not Found
**Error**: `node: command not found`
**Solution**: Install Node.js from [nodejs.org](https://nodejs.org/)

#### 2. Permission Denied
**Error**: `EACCES: permission denied`
**Solution**: 
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
# Or use a Node version manager like nvm
```

#### 3. Port Already in Use
**Error**: `EADDRINUSE: address already in use :::5000`
**Solution**: 
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9
# Or change port in .env file
```

#### 4. API Key Issues
**Error**: `Invalid API key` or `API call failed`
**Solution**: 
- Verify your API key is correct
- Check if you've exceeded the free tier limits
- Ensure the API key is properly set in .env file

#### 5. CORS Issues
**Error**: `CORS policy` errors in browser
**Solution**: The application is configured to handle CORS, but if issues persist:
- Ensure you're accessing the frontend at http://localhost:3000
- Check that the backend is running on http://localhost:5000

### Development vs Production

#### Development Mode
```bash
npm run dev  # Starts both frontend and backend with hot reload
```

#### Production Mode
```bash
npm run build  # Builds the React app
npm start      # Starts production server
```

## API Rate Limits

### Alpha Vantage Free Tier
- **5 API calls per minute**
- **500 API calls per day**
- The application uses caching to respect these limits

### Caching Strategy
- **Quote data**: 1 minute cache
- **Overview data**: 5 minutes cache
- **Time series**: 1 minute cache

## Performance Tips

1. **Use Caching**: The app caches data to reduce API calls
2. **Monitor API Usage**: Check your Alpha Vantage dashboard
3. **Optimize Refresh Rate**: Adjust `CACHE_DURATION` in .env if needed
4. **Use Production Build**: For better performance in production

## Security Notes

1. **Never commit .env file**: It contains sensitive API keys
2. **Use environment variables**: For production deployment
3. **Rate limiting**: The app respects API rate limits
4. **Input validation**: All inputs are validated and sanitized

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically

### Render
1. Connect your repository
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Add environment variables

### Heroku
1. Create a Heroku app
2. Connect your repository
3. Set environment variables
4. Deploy

## Support

If you encounter issues:
1. Check this troubleshooting guide
2. Verify all prerequisites are installed
3. Check the console for error messages
4. Ensure your API key is valid and active
5. Check your internet connection

## Demo Mode

If you want to test the UI without API integration, you can:
1. Use the demo API key: `demo`
2. The app will show sample data
3. Note: This is for UI testing only

---

**Happy Trading! 📈**
