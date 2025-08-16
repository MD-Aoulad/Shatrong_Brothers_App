# 🚀 Forex Fundamental Dashboard

A comprehensive Forex trading application with real-time economic data, sentiment analysis, and **MetaTrader 5 integration** for live market data.

## ✨ **Key Features**

- 📊 **Real-time Economic Calendar** - Live economic events and indicators
- 🧠 **AI-Powered Sentiment Analysis** - Advanced market sentiment calculation
- 💰 **Currency Sentiment Tracking** - Real-time currency strength analysis
- 📰 **Live News Integration** - Breaking news and market updates
- 🔌 **MetaTrader 5 Integration** - Direct access to MT5 economic calendar and news
- 📈 **Interactive Dashboard** - Filter events by currency and impact
- 🎯 **Event Management** - Add, edit, and manage economic events
- 📱 **Responsive Design** - Works on desktop and mobile devices

## 🆕 **NEW: MetaTrader 5 Integration**

**Get real-time data directly from MT5!** 🎉

- **Economic Calendar**: Live NFP, Fed decisions, CPI data, GDP reports
- **News Feed**: Official MT5 news and market commentary
- **Market Sentiment**: Real-time currency pair analysis
- **No API Limits**: Direct MT5 connection, no rate limiting
- **Fallback Support**: Automatic fallback to other sources if MT5 unavailable

[📖 **MT5 Integration Guide**](MT5_INTEGRATION_GUIDE.md) - Complete setup instructions

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway    │    │   Database      │
│   (React)       │◄──►│   (Express)      │◄──►│   (PostgreSQL)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌──────────────────┐             │
         │              │   Data Collection│             │
         │              │   (MT5 + APIs)   │             │
         │              └──────────────────┘             │
         │                       │                       │
         │              ┌──────────────────┐             │
         │              │   Analytics      │             │
         │              │   Service        │             │
         │              └──────────────────┘             │
         │                       │                       │
         │              ┌──────────────────┐             │
         │              │   WebSocket      │             │
         │              │   Service        │             │
         │              └──────────────────┘             │
         └───────────────┴──────────────────┴─────────────┘
```

## 🚀 **Quick Start**

### Prerequisites
- Docker and Docker Compose
- MetaAPI.cloud account (for MT5 integration)

### 1. Clone and Setup
```bash
git clone <your-repo>
cd Shatrong_App
```

### 2. Configure MT5 Integration (Optional but Recommended)
```bash
# Copy environment template
cp data-collection/env.example data-collection/.env

# Edit and add your MetaAPI token
META_API_TOKEN=your_token_here
```

### 3. Start Services
```bash
docker-compose up -d
```

### 4. Access Dashboard
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **Database**: localhost:5432

## 📊 **Data Sources**

### Primary Source: MetaTrader 5
- **Economic Calendar**: Live economic events
- **News Feed**: Official MT5 news
- **Market Data**: Real-time prices and sentiment

### Fallback Sources
- **Trading Economics**: Economic calendar API
- **Alpha Vantage**: US economic indicators
- **FRED**: Federal Reserve economic data
- **NewsAPI**: Financial news sentiment

## 🔧 **Configuration**

### Environment Variables
```bash
# MT5 Integration (Primary)
META_API_TOKEN=your_meta_api_token

# Fallback APIs (Optional)
ALPHA_VANTAGE_API_KEY=your_key
FRED_API_KEY=your_key
NEWS_API_KEY=your_key

# Database
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://localhost:6379
```

## 📱 **Features Overview**

### Dashboard
- **Currency Cards**: Click to filter events by currency
- **Event Timeline**: Chronological view of economic events
- **Sentiment Analysis**: AI-powered market sentiment
- **Real-time Updates**: Live data every 5 minutes

### Event Management
- **Add News**: Manual event entry with templates
- **Edit Events**: Update existing event details
- **Event Filtering**: Filter by currency, impact, sentiment
- **Bulk Operations**: Manage multiple events

### Analytics
- **Sentiment Trends**: Historical sentiment analysis
- **Impact Analysis**: Event impact on currency pairs
- **Performance Metrics**: Trading strategy backtesting
- **Correlation Analysis**: Currency pair relationships

## 🧪 **Testing**

### Test MT5 Integration
```bash
# Check data collection logs
docker-compose logs data-collection

# Look for MT5 connection success
🔌 Connecting to MetaTrader 5...
✅ Connected to MT5 account: [account_id]
📊 MT5: X calendar events + Y news items
```

### Test Dashboard
1. Open http://localhost:3000
2. Click on currency cards to filter events
3. Add new events via "Add News" button
4. Check real-time updates

## 📚 **Documentation**

- [📖 **MT5 Integration Guide**](MT5_INTEGRATION_GUIDE.md) - Complete MT5 setup
- [🔧 **Technical Specification**](TECHNICAL_SPECIFICATION.md) - System architecture
- [🎨 **UI/UX Design**](UI_UX_DESIGN.md) - Design principles
- [📊 **Project Documentation**](PROJECT_DOCUMENTATION.md) - Project overview

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 **Support**

- **Issues**: Create a GitHub issue
- **MT5 Setup**: Check [MT5 Integration Guide](MT5_INTEGRATION_GUIDE.md)
- **Documentation**: Review project docs
- **Community**: Join our discussions

---

**🚀 Ready to trade with real-time MT5 data? Get started now!**

*Last Updated: $(date)*
