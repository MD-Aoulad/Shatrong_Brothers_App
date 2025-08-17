# 🚀 BROTHER SETUP GUIDE - Run This App in 5 Minutes!

## **📋 What You'll Get:**
- **Professional Forex Trading Dashboard** 🎯
- **Real MT5 Market Data** (live prices, charts) 📊
- **Strategy Monitor** with EMA + 4 logic 🧠
- **Backtesting System** with visual charts 📈
- **Real-time Trading Signals** ⚡

## **🔧 What You Need:**
- **Docker Desktop** installed on your Mac/PC
- **Git** (to download the code)
- **5 minutes** of your time

## **📥 STEP 1: Download the App**
```bash
# Open Terminal and run:
git clone https://github.com/MD-Aoulad/Shatrong_Brothers_App.git
cd Shatrong_Brothers_App
```

## **⚙️ STEP 2: Setup Environment**
```bash
# Copy the environment template
cp env.template .env

# Edit the .env file with your passwords
nano .env
# OR use any text editor you prefer
```

**Update these values in .env:**
```bash
POSTGRES_PASSWORD=your_secure_password_here
REDIS_PASSWORD=your_redis_password_here
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
```

## **🎯 STEP 3: Get Real MT5 Data (Optional but Recommended)**
1. **Visit:** https://app.metaapi.cloud/
2. **Sign up** for free account
3. **Create MT5 demo account** (free)
4. **Copy your API token** and **account ID**
5. **Add to .env file:**
```bash
METAAPI_TOKEN=your_actual_token_here
METAAPI_ACCOUNT_ID=your_actual_account_id_here
```

## **🚀 STEP 4: Start the App**
```bash
# Make the start script executable
chmod +x start.sh

# Start all services
./start.sh
```

**What happens:**
- Docker downloads all required images
- Database initializes with trading data
- All services start automatically
- Frontend opens in your browser

## **🌐 STEP 5: Access Your App**
- **Frontend:** http://localhost:3000
- **API:** http://localhost:8000
- **Database:** localhost:5432

## **📱 What You'll See:**

### **Main Dashboard:**
- Currency strength cards
- Economic calendar
- News sentiment analysis

### **Strategy Monitor (New Tab):**
- Real-time trading signals
- EMA + 4 currency alignment
- Power scoring system
- Session countdown timers

### **Backtest Results (New Tab):**
- Historical trade performance
- Visual charts with entry/exit points
- Performance metrics
- Trade reasoning

## **🔍 Troubleshooting:**

### **Port Already in Use:**
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :8000

# Kill the process or change ports in .env
```

### **Docker Issues:**
```bash
# Restart Docker Desktop
# Then run again:
./start.sh
```

### **No Data Showing:**
- Check if all containers are running: `docker ps`
- Check logs: `docker logs shatrong_app-api-gateway-1`
- Ensure .env file is properly configured

## **📚 Features Available:**

### **✅ Real Market Data (with MT5):**
- Live EUR/USD, GBP/JPY prices
- Real economic calendar
- Live market sentiment
- Real-time strategy signals

### **✅ Demo Mode (without MT5):**
- Simulated market data
- Strategy logic demonstration
- UI/UX testing
- Training environment

## **🎉 You're Done!**
Your brother now has a **professional-grade forex trading dashboard** running locally!

## **📞 Need Help?**
- Check the logs: `docker logs [container-name]`
- Restart services: `docker restart [container-name]`
- Check the main README.md for more details

## **🚀 Next Steps:**
1. **Explore the dashboard** and understand the features
2. **Test the strategy monitor** with real MT5 data
3. **Run backtests** to see historical performance
4. **Customize** the strategy parameters if needed

**Welcome to professional forex trading! 🎯📊**
