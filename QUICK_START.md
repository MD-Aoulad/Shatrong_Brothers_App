# 🚀 Quick Start Guide - Forex Fundamental Data App

## Prerequisites

- Docker and Docker Compose installed
- At least 4GB RAM available
- Ports 3000, 8000, 8001, 5432, 6379, 8086 available

## 🎯 **Immediate Setup (5 minutes)**

### 1. **Clone and Navigate**
```bash
git clone <your-repo-url>
cd Shatrong_App
```

### 2. **Create Environment File**
```bash
cp env.template .env
# Edit .env if needed (defaults work for development)
```

### 3. **Start All Services**
```bash
chmod +x start.sh
./start.sh
```

### 4. **Verify Services**
```bash
docker-compose ps
```

## 🌐 **Access Points**

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main trading dashboard |
| **API Gateway** | http://localhost:8000 | REST API endpoints |
| **WebSocket** | ws://localhost:8001 | Real-time data |
| **Database** | localhost:5432 | PostgreSQL |
| **Redis** | localhost:6379 | Cache layer |
| **InfluxDB** | http://localhost:8086 | Time-series data |

## 📊 **What's Running**

### **Core Services**
- ✅ **Frontend**: React dashboard with currency cards
- ✅ **API Gateway**: Express.js with authentication
- ✅ **Database**: PostgreSQL with enhanced schema
- ✅ **Cache**: Redis for performance
- ✅ **Message Queue**: Kafka for data streaming

### **Data Services**
- ✅ **Data Collection**: MT5 + external APIs
- ✅ **Data Processing**: Real-time analysis
- ✅ **Analytics**: Sentiment calculation
- ✅ **WebSocket**: Live updates

## 🔧 **Troubleshooting**

### **Service Won't Start**
```bash
# Check logs
docker-compose logs [service-name]

# Restart specific service
docker-compose restart [service-name]

# Rebuild and restart
docker-compose up -d --build [service-name]
```

### **Port Already in Use**
```bash
# Find process using port
lsof -i :[PORT_NUMBER]

# Kill process
kill -9 [PID]

# Or stop all containers
docker-compose down
```

### **Database Connection Issues**
```bash
# Check database status
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

## 📝 **Development Workflow**

### **1. Make Changes**
- Edit source code in respective service directories
- Changes auto-reload due to volume mounting

### **2. Test Changes**
- Frontend: http://localhost:3000
- API: http://localhost:8000/health
- Database: Check logs for connection status

### **3. View Logs**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f [service-name]
```

## 🎯 **Next Steps**

1. **Explore Dashboard**: Visit http://localhost:3000
2. **Check API**: Test http://localhost:8000/health
3. **Review Data**: Check database tables
4. **Customize**: Modify environment variables in `.env`

## 📚 **Documentation**

- **Full Documentation**: `PROJECT_DOCUMENTATION.md`
- **Technical Specs**: `TECHNICAL_SPECIFICATION.md`
- **UI/UX Design**: `UI_UX_DESIGN.md`
- **Implementation Plan**: `IMPLEMENTATION_PLAN.md`

## 🆘 **Need Help?**

### **Common Issues**
- **Services not starting**: Check Docker logs
- **Port conflicts**: Stop other services using same ports
- **Database errors**: Ensure PostgreSQL is running
- **Memory issues**: Increase Docker memory allocation

### **Reset Everything**
```bash
# Complete reset
docker-compose down -v
docker system prune -f
./start.sh
```

---

## 🎉 **You're Ready!**

Your Forex Fundamental Data App is now running with:
- ✅ Real-time data collection
- ✅ Sentiment analysis engine
- ✅ Interactive dashboard
- ✅ API endpoints
- ✅ WebSocket streaming
- ✅ Database persistence

**Start trading!** 🚀📈
