# 🚀 Forex Fundamental Data App

A comprehensive microservices-based application for analyzing Forex market fundamentals, sentiment analysis, and economic event tracking.

## 🌟 Features

- **Real-time Currency Sentiment Analysis** - Track EUR, USD, JPY, GBP, and CAD
- **Economic Event Monitoring** - CPI, GDP, Interest Rates, Employment, Retail Sales
- **Advanced Sentiment Analysis** - AI-powered market sentiment evaluation
- **Interactive Dashboard** - Real-time data visualization and filtering
- **Multi-Currency Support** - Comprehensive coverage of major Forex pairs
- **Event Timeline** - Historical and upcoming economic events
- **Responsive Design** - Works on desktop, tablet, and mobile devices

## 🏗️ Architecture

### Microservices Architecture
- **Frontend** - React.js with TypeScript
- **API Gateway** - Express.js with Redis caching
- **Backend** - Core business logic and bias calculation
- **Data Collection** - Automated economic data gathering
- **Data Processing** - Event processing and sentiment analysis
- **Analytics** - Performance metrics and backtesting
- **WebSocket** - Real-time data streaming
- **Database** - PostgreSQL for structured data
- **Cache** - Redis for high-performance caching
- **Message Queue** - Kafka for event streaming
- **Time-Series DB** - InfluxDB for market data

### Technology Stack
- **Frontend**: React 18, TypeScript, Redux Toolkit, CSS3
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL 15, Redis 7, InfluxDB 2.7
- **Message Queue**: Apache Kafka 7.4.0
- **Containerization**: Docker, Docker Compose
- **Orchestration**: Kubernetes (optional)

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Shatrong_App
```

### 2. Start the Application
```bash
# Start all services
docker-compose up -d

# Or start specific services
docker-compose up frontend api-gateway postgres redis -d
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **Backend**: http://localhost:8080
- **WebSocket**: ws://localhost:8001
- **Database**: localhost:5432
- **Redis**: localhost:6379
- **Kafka**: localhost:29092
- **InfluxDB**: localhost:8086

## 📁 Project Structure

```
Shatrong_App/
├── frontend/                 # React frontend application
├── api-gateway/             # API gateway with caching
├── backend/                 # Core backend services
├── data-collection/         # Economic data collection
├── data-processing/         # Data processing pipeline
├── analytics/               # Analytics and reporting
├── websocket/               # Real-time data streaming
├── database/                # Database initialization scripts
├── k8s/                     # Kubernetes deployment files
├── docker-compose.yml       # Docker services configuration
├── start.sh                 # Quick start script
└── docs/                    # Project documentation
```

## 🔧 Development

### Local Development Setup
```bash
# Install dependencies for each service
cd frontend && npm install
cd ../api-gateway && npm install
cd ../backend && npm install

# Start development servers
npm run dev  # In each service directory
```

### Docker Development
```bash
# Rebuild and restart services
docker-compose up --build -d

# View logs
docker-compose logs -f frontend
docker-compose logs -f api-gateway

# Access service containers
docker-compose exec frontend sh
docker-compose exec postgres psql -U postgres -d forex_app
```

### Database Management
```bash
# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d forex_app

# View tables
\dt

# Sample queries
SELECT * FROM economic_events LIMIT 5;
SELECT * FROM currency_sentiments;
```

## 📊 Data Sources

### Economic Indicators
- **CPI (Consumer Price Index)** - Monthly inflation data
- **GDP (Gross Domestic Product)** - Quarterly growth data
- **Interest Rates** - Central bank decisions
- **Employment Data** - NFP, unemployment rates
- **Retail Sales** - Consumer spending indicators

### Supported Currencies
- **EUR** - Euro (Eurozone)
- **USD** - US Dollar (United States)
- **JPY** - Japanese Yen (Japan)
- **GBP** - British Pound (United Kingdom)
- **CAD** - Canadian Dollar (Canada)

## 🎯 Key Features

### Currency Sentiment Analysis
- Real-time sentiment scoring
- Confidence level indicators
- Trend analysis (Strengthening/Weakening/Stable)
- Historical sentiment tracking

### Event Management
- Add custom economic events
- Edit and delete events
- Impact level classification
- Sentiment analysis integration

### Dashboard Features
- Currency filtering and selection
- Event timeline visualization
- Sentiment breakdown charts
- Market status indicators

## 🔒 Security Features

- JWT-based authentication
- API rate limiting
- Input validation and sanitization
- Secure database connections
- Environment variable protection

## 📈 Performance Features

- Redis caching layer
- Database query optimization
- Efficient data pagination
- Real-time data streaming
- Responsive UI components

## 🧪 Testing

### Running Tests
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# Integration tests
npm run test:integration
```

### Test Coverage
- Unit tests for all services
- Integration tests for APIs
- End-to-end testing
- Performance testing

## 🚀 Deployment

### Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment
```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods
kubectl get services
```

## 📝 API Documentation

### Endpoints
- `GET /api/v1/dashboard` - Dashboard data
- `GET /api/v1/events` - Economic events
- `GET /api/v1/sentiment/:currency` - Currency sentiment
- `POST /api/v1/events` - Create new event
- `PUT /api/v1/events/:id` - Update event
- `DELETE /api/v1/events/:id` - Delete event

### WebSocket Events
- `currency_update` - Real-time currency updates
- `event_added` - New economic events
- `sentiment_change` - Sentiment updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)
- **Technical Specs**: [TECHNICAL_SPECIFICATION.md](TECHNICAL_SPECIFICATION.md)
- **UI/UX Design**: [UI_UX_DESIGN.md](UI_UX_DESIGN.md)
- **Issues**: Create an issue in the repository

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced charting (TradingView integration)
- [ ] Machine learning sentiment analysis
- [ ] Real-time news integration
- [ ] Social trading features
- [ ] Advanced risk management tools

## 📊 Project Status

- **Current Version**: 1.0.0
- **Development Status**: Active Development
- **Last Updated**: December 2024
- **Next Release**: Q1 2025

---

**Built with ❤️ for the Forex trading community**
