# 🚀 FREE API SETUP GUIDE - Get REAL Market Data

## 🌟 **What You'll Get:**
- **Real forex prices** from Alpha Vantage
- **Live market news** from NewsAPI  
- **Economic indicators** from FRED (Federal Reserve)
- **Professional data** - No more simulation!

---

## 📋 **Step 1: Get NewsAPI Key (100 requests/day FREE)**

### **1.1 Visit NewsAPI**
- Go to: https://newsapi.org/register
- Click "Get free API key"

### **1.2 Create Account**
- Enter your email
- Choose "Developer" plan (FREE)
- Verify your email

### **1.3 Get Your Key**
- Copy your API key
- Add to `.env` file: `NEWS_API_KEY=your_key_here`

---

## 📊 **Step 2: Get Alpha Vantage Key (25 requests/day FREE)**

### **2.1 Visit Alpha Vantage**
- Go to: https://www.alphavantage.co/support/#api-key
- Click "Get your free API key today"

### **2.2 Create Account**
- Enter your email
- Choose "Free" plan
- Verify your email

### **2.3 Get Your Key**
- Copy your API key
- Add to `.env` file: `ALPHA_VANTAGE_KEY=your_key_here`

---

## 🏦 **Step 3: Get FRED API Key (Unlimited FREE)**

### **3.1 Visit FRED**
- Go to: https://fred.stlouisfed.org/docs/api/api_key.html
- Click "Request API Key"

### **3.2 Create Account**
- Enter your email
- Choose "Free" plan
- Verify your email

### **3.3 Get Your Key**
- Copy your API key
- Add to `.env` file: `FRED_API_KEY=your_key_here`

---

## ⚙️ **Step 4: Configure Environment**

### **4.1 Copy Environment File**
```bash
cp env.template .env
```

### **4.2 Edit .env File**
```bash
# Add your API keys
NEWS_API_KEY=abc123your_news_api_key
ALPHA_VANTAGE_KEY=xyz789your_alpha_vantage_key  
FRED_API_KEY=def456your_fred_api_key
```

### **4.3 Restart Services**
```bash
docker-compose down
docker-compose up -d
```

---

## 🎯 **What Data You'll Get:**

### **💰 Real Forex Prices (Alpha Vantage)**
- **EUR/USD**: Live bid/ask prices
- **GBP/USD**: Real-time exchange rates
- **USD/JPY**: Current market prices
- **20+ currency pairs** with real data

### **📰 Live Market News (NewsAPI)**
- **Reuters**: Professional financial news
- **Bloomberg**: Market analysis
- **CNBC**: Currency updates
- **Real headlines** from today

### **📊 Economic Indicators (FRED)**
- **US Unemployment**: Real government data
- **CPI Data**: Official inflation numbers
- **GDP Figures**: Economic growth data
- **Federal Reserve**: Interest rate info

---

## 🔒 **API Limits & Best Practices:**

### **NewsAPI (100 requests/day)**
- ✅ **Good for**: Daily news updates
- ⚠️ **Limit**: 100 requests per day
- 💡 **Tip**: Collect news every 15 minutes

### **Alpha Vantage (25 requests/day)**
- ✅ **Good for**: Price updates
- ⚠️ **Limit**: 25 requests per day
- 💡 **Tip**: Update prices every 2 hours

### **FRED (Unlimited)**
- ✅ **Good for**: Economic data
- ⚠️ **Limit**: None (free tier)
- 💡 **Tip**: Update indicators daily

---

## 🚨 **Troubleshooting:**

### **"API Key Invalid" Error**
- ✅ Check your API key is correct
- ✅ Verify you've copied the full key
- ✅ Ensure no extra spaces

### **"Rate Limit Exceeded" Error**
- ✅ Wait for the next day (resets at midnight UTC)
- ✅ Check your usage in the API dashboard
- ✅ Reduce update frequency

### **"No Data Available" Error**
- ✅ Check your internet connection
- ✅ Verify API service is working
- ✅ Check the data-collection logs

---

## 📱 **Test Your Setup:**

### **1. Check Logs**
```bash
docker logs shatrong_app-data-collection-1
```

### **2. Look for Success Messages**
```
✅ Got REAL price for EUR/USD: 1.0850
✅ Got 15 REAL market news from NewsAPI
✅ Got 5 REAL economic indicators from FRED
```

### **3. Access Your Dashboard**
- Open: http://localhost:3000
- Look for "Real Data" indicators
- Check news has real sources
- Verify prices are current

---

## 🎉 **You're Done!**

**Congratulations! You now have:**
- ✅ **Real forex prices** from live markets
- ✅ **Live financial news** from Reuters/Bloomberg
- ✅ **Official economic data** from Federal Reserve
- ✅ **Professional trading dashboard** with real data

**Your app is now Goldman Sachs-level with real market information!** 🚀📊

---

## 🔗 **Quick Links:**

- **NewsAPI**: https://newsapi.org/register
- **Alpha Vantage**: https://www.alphavantage.co/support/#api-key  
- **FRED**: https://fred.stlouisfed.org/docs/api/api_key.html
- **App**: http://localhost:3000
- **Logs**: `docker logs shatrong_app-data-collection-1`
