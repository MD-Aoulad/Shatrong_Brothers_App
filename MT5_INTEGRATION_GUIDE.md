# MetaTrader 5 Integration Guide

## 🎯 **Overview**

This guide explains how to integrate MetaTrader 5 (MT5) with your Forex Fundamental Dashboard to get real-time economic calendar data, news, and market sentiment directly from MT5.

## 🚀 **Benefits of MT5 Integration**

- **Real-time Economic Calendar**: Live economic events and indicators
- **High-Quality News Data**: Official MT5 news feed
- **Market Sentiment**: Real-time currency pair sentiment analysis
- **Reliable Data**: Direct from MT5 platform, no API rate limits
- **Comprehensive Coverage**: All major currencies and economic events

## 🔧 **Setup Options**

### Option 1: MetaAPI.cloud (Recommended - Easy Setup)

**MetaAPI.cloud** provides a cloud-based solution to connect to MT5 without installing additional software.

#### Step 1: Get MetaAPI Token
1. Go to [MetaAPI.cloud](https://metaapi.cloud/)
2. Sign up for a free account
3. Get your API token from the dashboard
4. Add token to `data-collection/.env`:
   ```bash
   META_API_TOKEN=your_token_here
   ```

#### Step 2: Configure MT5 Account
1. In MetaAPI dashboard, add your MT5 account
2. Provide your broker's MT5 server details
3. Enter your MT5 login credentials
4. Wait for connection verification

#### Step 3: Test Connection
The system will automatically:
- Connect to your MT5 account
- Fetch economic calendar data
- Retrieve news updates
- Calculate market sentiment

### Option 2: Direct MT5 Connection (Advanced)

For direct connection to MT5 terminal:

```bash
# Add to data-collection/.env
MT5_SERVER=your_broker_server
MT5_LOGIN=your_account_number
MT5_PASSWORD=your_password
```

## 📊 **Data Sources Available**

### 1. **Economic Calendar**
- **NFP Reports** (Non-Farm Payrolls)
- **Interest Rate Decisions** (Fed, ECB, BOJ, BOE)
- **CPI/Inflation Data**
- **GDP Reports**
- **Employment Data**
- **PMI Data**
- **Retail Sales**
- **Trade Balance**

### 2. **News Feed**
- **Breaking News**
- **Central Bank Speeches**
- **Economic Analysis**
- **Market Commentary**

### 3. **Market Sentiment**
- **Currency Pair Analysis**
- **Price Movement Data**
- **Volume Analysis**
- **Trend Indicators**

## 🔄 **Data Flow**

```
MT5 Terminal → MetaAPI.cloud → Data Collection Service → Database → Dashboard
     ↓
Economic Calendar + News + Market Data
     ↓
Real-time Updates Every 5 Minutes
     ↓
Automatic Sentiment Analysis
     ↓
Live Dashboard Display
```

## ⚙️ **Configuration**

### Environment Variables
```bash
# Required
META_API_TOKEN=your_token

# Optional (for fallback sources)
ALPHA_VANTAGE_API_KEY=your_key
FRED_API_KEY=your_key
NEWS_API_KEY=your_key

# Settings
MT5_PRIORITY=true
COLLECTION_INTERVAL_MINUTES=5
SENTIMENT_UPDATE_INTERVAL_MINUTES=10
```

### Data Collection Schedule
- **Economic Data**: Every 5 minutes
- **News Updates**: Every 5 minutes
- **Sentiment Analysis**: Every 10 minutes
- **MT5 Connection**: Automatic reconnection on failure

## 🧪 **Testing the Integration**

### 1. **Check Data Collection Logs**
```bash
docker-compose logs data-collection
```

Look for:
- `🔌 Connecting to MetaTrader 5...`
- `✅ Connected to MT5 account: [account_id]`
- `📊 MT5: X calendar events + Y news items`

### 2. **Verify Data in Dashboard**
- Open your dashboard
- Check if new events appear
- Verify currency sentiments update
- Look for "MetaTrader 5" source in events

### 3. **Monitor Database**
```bash
docker-compose exec postgres psql -U postgres -d forex_app -c "SELECT source, COUNT(*) FROM economic_events GROUP BY source;"
```

## 🚨 **Troubleshooting**

### Common Issues

#### 1. **Connection Failed**
```
❌ Failed to connect to MT5
```
**Solution**: Check your MetaAPI token and account configuration

#### 2. **No Data Retrieved**
```
📊 MT5: 0 calendar events + 0 news items
```
**Solution**: Verify MT5 account is active and has data access

#### 3. **Authentication Error**
```
❌ Authentication failed
```
**Solution**: Check MT5 login credentials in MetaAPI dashboard

### Fallback Behavior

If MT5 connection fails, the system automatically:
1. Falls back to external API sources
2. Uses demo data as last resort
3. Continues collecting data from other sources
4. Attempts MT5 reconnection on next cycle

## 📈 **Performance Optimization**

### 1. **Data Caching**
- Redis cache for frequently accessed data
- 5-minute cache for economic calendar
- Real-time updates for breaking news

### 2. **Rate Limiting**
- Respects MT5 platform limits
- Intelligent retry mechanisms
- Connection pooling

### 3. **Error Handling**
- Graceful degradation on failures
- Automatic reconnection
- Comprehensive logging

## 🔒 **Security Considerations**

### 1. **API Token Security**
- Store tokens in environment variables
- Never commit tokens to version control
- Use secure token rotation

### 2. **Data Privacy**
- MT5 data is processed locally
- No sensitive data sent to external services
- Secure database connections

### 3. **Access Control**
- Restrict data collection service access
- Monitor API usage
- Implement rate limiting

## 📚 **API Reference**

### MT5Connector Class

```typescript
class MT5Connector {
  // Connect to MT5
  async connect(): Promise<boolean>
  
  // Get economic calendar
  async getEconomicCalendar(startDate: Date, endDate: Date): Promise<MT5EconomicEvent[]>
  
  // Get news data
  async getNewsData(): Promise<MT5EconomicEvent[]>
  
  // Get market sentiment
  async getMarketSentiment(): Promise<{ [currency: string]: number }>
  
  // Disconnect
  async disconnect(): Promise<void>
}
```

### Event Structure

```typescript
interface MT5EconomicEvent {
  id: string;
  currency: string;
  eventType: string;
  title: string;
  description: string;
  eventDate: Date;
  actualValue?: number;
  expectedValue?: number;
  previousValue?: number;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidenceScore: number;
  priceImpact?: number;
  source: string;
  url?: string;
}
```

## 🎉 **Next Steps**

1. **Get MetaAPI Token** from [metaapi.cloud](https://metaapi.cloud/)
2. **Configure Environment** with your token
3. **Restart Data Collection** service
4. **Monitor Logs** for successful connection
5. **Verify Data** appears in dashboard
6. **Enjoy Real-time MT5 Data**! 🚀

## 📞 **Support**

- **MetaAPI Documentation**: [docs.metaapi.cloud](https://docs.metaapi.cloud/)
- **Community Forum**: [community.metaapi.cloud](https://community.metaapi.cloud/)
- **API Status**: [status.metaapi.cloud](https://status.metaapi.cloud/)

---

*Last Updated: $(date)*
*Version: 1.0*
