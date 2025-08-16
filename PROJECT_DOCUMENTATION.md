# Forex Fundamental Data App - Project Documentation

## Product Overview

### Vision Statement
A comprehensive real-time Forex fundamental data application that provides traders with actionable insights on currency sentiment through fundamental analysis, historical data visualization, and trend analysis for EUR, USD, JPY, and GBP.

### Mission
To empower Forex traders with data-driven fundamental analysis by collecting, analyzing, and visualizing real-time economic news and indicators that impact currency movements.

---

## Market Analysis

### Target Users
- **Primary**: Retail Forex traders (intermediate to advanced)
- **Secondary**: Institutional traders, financial analysts, trading educators
- **Tertiary**: Financial news organizations, research institutions

### Competitive Landscape
- **Existing Solutions**: TradingView, Investing.com, FXStreet
- **Gaps in Market**: 
  - Limited real-time fundamental sentiment analysis
  - Lack of historical fundamental data correlation with price movements
  - No unified view of currency sentiment across multiple timeframes

### Market Opportunity
- Growing retail Forex trading market ($6.6 trillion daily volume)
- Increasing demand for fundamental analysis tools
- Rising interest in data-driven trading strategies

---

## Product Requirements

### Core Features

#### 1. Real-Time Data Collection
- **Economic Indicators**: CPI, GDP, Employment data, Interest rates, Retail sales
- **Central Bank Communications**: FOMC, ECB, BOJ, BOE announcements
- **Political Events**: Elections, policy changes, trade agreements
- **News Sentiment**: Financial news analysis and sentiment scoring

#### 2. Currency Coverage
- **EUR** (Euro)
- **USD** (US Dollar)
- **JPY** (Japanese Yen)
- **GBP** (British Pound)

#### 3. Sentiment Analysis
- **Bullish/Bearish Classification**: AI-powered sentiment analysis
- **Confidence Scoring**: 0-100 scale for sentiment strength
- **Impact Assessment**: High/Medium/Low impact categorization

#### 4. Historical Data & Visualization
- **Year-to-date analysis**: Complete 2024 fundamental data
- **Interactive charts**: Time-series visualization of sentiment trends
- **Event correlation**: Historical events with price impact analysis
- **Performance tracking**: Strategy backtesting capabilities

#### 5. Bias Scorecard & Catalysts Calendar
- **Weighted bias framework**: 10-pillar fundamental model with fixed weights to derive a single bias score per currency
- **Per-currency scorecard**: Pillar scores, rationales, and weighted Bias Score → Bullish/Neutral/Bearish
- **Catalysts calendar**: Upcoming Tier-1/Tier-2 events with expected vs prior and directional skew
- **Reaction mapping**: Pre-defined policy/market reaction rules for key data surprises

### Technical Requirements

#### Data Sources
- **Primary APIs**: 
  - Bloomberg Terminal API
  - Reuters API
  - Forex Factory API
  - Investing.com API
- **News Sources**:
  - Reuters
  - Bloomberg
  - Financial Times
  - CNBC
  - MarketWatch

#### Data Processing
- **Real-time ingestion**: WebSocket connections for live data
- **Data normalization**: Standardized format across sources
- **Sentiment analysis**: NLP models for news sentiment
- **Data storage**: Time-series database (InfluxDB/ClickHouse)

#### Architecture
- **Microservices**: Data collection, processing, analysis, API
- **Real-time processing**: Apache Kafka for event streaming
- **Caching**: Redis for frequently accessed data
- **Scalability**: Kubernetes deployment

---

## Fundamental FX Bias Framework

### Pillars and weights
- **Monetary policy and rates (25%)**: Policy path, real yield differentials, curve shape, balance sheet, guidance credibility
- **Inflation dynamics (15%)**: Core/headline trends, wages/shelter, expectations, pipeline pressures
- **Growth momentum (15%)**: GDP/nowcasts, PMIs/ISM, retail/IP, surprise indices
- **Labor market (5%)**: Unemployment, participation, vacancies, wage growth
- **External balance and flows (10%)**: Current/basic balance, NIIP, portfolio/FDI flows, rating outlook
- **Terms of trade/commodities (10%)**: Export basket, energy dependency, key commodity shocks
- **Fiscal stance (7.5%)**: Deficit/debt path, fiscal impulse, issuance calendar, debt service burden
- **Politics/geopolitics (5%)**: Elections, sanctions/tariffs, policy uncertainty, conflict proximity
- **Financial stability/conditions (5%)**: Credit spreads, bank equity, housing, funding stress, FCI
- **Valuation and positioning (7.5%)**: REER gap, BEER/FEER, CFTC positioning, options skew, seasonality

### Scoring method
- Normalize core indicators per pillar to z-scores vs peers/history
- Bias Score = Σ(weight × score), thresholds: ≥ +0.6 bullish; ≤ -0.6 bearish; else neutral
- Tie-breakers: volatility regime, options skew asymmetry, liquidity conditions

### Fillable template
- Policy/real rates: [...] → score __
- Inflation: [...] → score __
- Growth: [...] → score __
- Labor: [...] → score __
- External/flows: [...] → score __
- Terms of trade: [...] → score __
- Fiscal: [...] → score __
- Politics/geo: [...] → score __
- Financial conditions: [...] → score __
- Valuation/positioning: [...] → score __
- Weighted Bias Score: __ → Bias: [Bullish/Neutral/Bearish]
- Key catalysts (next 2 weeks): [date — event — exp/prior — skew]

### News and events to track
- Central banks (decisions/minutes/speeches/balance sheet/FX comments)
- Inflation (CPI/PCE/HICP, PPI, wages/ULC, expectations)
- Growth (GDP, PMIs/ISM, retail, durable goods, IP, construction)
- Labor (employment/unemployment, wages, vacancies, claims)
- External/flows (current account, BoP/flows, rating actions)
- Commodities/ToT (oil/gas/metals/softs, inventories, freight)
- Fiscal/politics (budgets, issuance, elections, sanctions/tariffs)
- Cross-asset (real yields, curves, credit, equities, vol, basis)

---

## User Experience Design

### User Interface Design Principles
- **Clarity**: Clean, uncluttered interface focusing on data
- **Real-time**: Live updates with visual indicators
- **Actionable**: Clear buy/sell signals based on fundamental analysis
- **Historical**: Easy access to past data and correlations

### Key Screens

#### 1. Dashboard (Main View)
```
┌─────────────────────────────────────────────────────────────┐
│                    FOREX FUNDAMENTAL DASHBOARD              │
├─────────────────────────────────────────────────────────────┤
│  EUR: 🟢 BULLISH (85%)    USD: 🔴 BEARISH (72%)            │
│  JPY: 🟡 NEUTRAL (45%)    GBP: 🟢 BULLISH (68%)            │
├─────────────────────────────────────────────────────────────┤
│  [EUR Chart]    [USD Chart]    [JPY Chart]    [GBP Chart]  │
│  Recent News    Recent News    Recent News    Recent News  │
│  • CPI +0.3%    • Fed Rate     • BOJ Policy   • BOE Rate   │
│  • ECB Speech   • NFP -50K     • GDP +1.2%    • CPI +0.2%  │
└─────────────────────────────────────────────────────────────┘
```

#### 2. Currency Detail View
```
┌─────────────────────────────────────────────────────────────┐
│  EUR/USD - FUNDAMENTAL ANALYSIS                             │
├─────────────────────────────────────────────────────────────┤
│  Current Sentiment: 🟢 BULLISH (85% confidence)            │
│  Trend: ↗️ Strengthening (Last 7 days)                     │
├─────────────────────────────────────────────────────────────┤
│  [Interactive Chart - Sentiment vs Price]                  │
│                                                             │
│  Recent Events:                                             │
│  📅 2024-02-15: CPI +0.3% → BULLISH (+15 points)          │
│  📅 2024-02-10: ECB Speech → BULLISH (+8 points)           │
│  📅 2024-02-05: GDP -0.1% → BEARISH (-12 points)           │
└─────────────────────────────────────────────────────────────┘
```

#### 3. Historical Analysis
```
┌─────────────────────────────────────────────────────────────┐
│  HISTORICAL FUNDAMENTAL ANALYSIS - EUR/USD                  │
├─────────────────────────────────────────────────────────────┤
│  [Timeline Chart - 2024 YTD]                                │
│                                                             │
│  Key Events:                                                │
│  🟢 Feb 15: CPI Data (BULLISH) - Price +0.8%               │
│  🔴 Feb 10: ECB Rate Decision (BEARISH) - Price -0.5%      │
│  🟢 Jan 25: GDP Growth (BULLISH) - Price +1.2%             │
│                                                             │
│  Strategy Performance:                                      │
│  ✅ Correct Signals: 23/30 (76.7%)                         │
│  📊 Average Price Movement: +0.6%                          │
└─────────────────────────────────────────────────────────────┘
```

### User Journey

#### 1. First-Time User
1. **Onboarding**: Welcome screen with feature overview
2. **Currency Selection**: Choose preferred currencies to track
3. **Dashboard Introduction**: Guided tour of main features
4. **Sample Data**: View historical data for familiarization

#### 2. Daily Usage
1. **Dashboard Check**: Quick sentiment overview
2. **Currency Deep Dive**: Detailed analysis of specific currency
3. **News Review**: Latest fundamental news and impact
4. **Strategy Testing**: Backtest trading strategies

#### 3. Advanced Usage
1. **Custom Alerts**: Set up notifications for specific events
2. **Strategy Development**: Create custom trading strategies
3. **Performance Analysis**: Track strategy effectiveness
4. **Data Export**: Export data for external analysis

---

## Technical Specifications

### Data Architecture

#### Data Models
```typescript
interface EconomicEvent {
  id: string;
  currency: 'EUR' | 'USD' | 'JPY' | 'GBP';
  eventType: 'CPI' | 'GDP' | 'INTEREST_RATE' | 'EMPLOYMENT' | 'RETAIL_SALES' | 'POLITICAL' | 'NEWS';
  title: string;
  description: string;
  date: Date;
  actualValue?: number;
  expectedValue?: number;
  previousValue?: number;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidenceScore: number; // 0-100
  priceImpact?: number; // Percentage change in currency pair
}

interface CurrencySentiment {
  currency: 'EUR' | 'USD' | 'JPY' | 'GBP';
  currentSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidenceScore: number;
  trend: 'STRENGTHENING' | 'WEAKENING' | 'STABLE';
  lastUpdated: Date;
  recentEvents: EconomicEvent[];
}

type BiasPillar =
  | 'POLICY'
  | 'INFLATION'
  | 'GROWTH'
  | 'LABOR'
  | 'EXTERNAL'
  | 'TERMS_OF_TRADE'
  | 'FISCAL'
  | 'POLITICS'
  | 'FINANCIAL_CONDITIONS'
  | 'VALUATION';

interface BiasPillarScore {
  pillar: BiasPillar;
  score: number; // -2 to +2 normalized
  weight: number; // 0 to 1
  rationale: string;
}

interface CurrencyBiasScorecard {
  currency: 'EUR' | 'USD' | 'JPY' | 'GBP';
  pillars: BiasPillarScore[];
  weightedBiasScore: number; // -2 to +2
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  updatedAt: Date;
}

type CatalystCategory =
  | 'CENTRAL_BANK'
  | 'INFLATION'
  | 'GROWTH'
  | 'LABOR'
  | 'EXTERNAL'
  | 'FISCAL'
  | 'POLITICS'
  | 'COMMODITIES'
  | 'MARKETS';

interface CatalystEvent {
  id: string;
  currency: 'EUR' | 'USD' | 'JPY' | 'GBP';
  date: Date;
  title: string;
  category: CatalystCategory;
  expected?: string | number;
  previous?: string | number;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  skew: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}
```

### Technology Stack

#### Frontend
- **Framework**: React with TypeScript
- **State Management**: Redux Toolkit
- **Charts**: TradingView Lightweight Charts
- **UI Library**: Material-UI or Ant Design
- **Real-time**: Socket.io client

#### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js or Fastify
- **Database**: PostgreSQL + Redis
- **Time-series**: InfluxDB
- **Message Queue**: Apache Kafka
- **Real-time**: Socket.io

#### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack

---

## API Documentation

### Authentication
All API endpoints require authentication using JWT tokens in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Base URL
```
Production: https://api.forexfundamental.com/v1
Development: http://localhost:3000/api/v1
```

### Core Endpoints

#### 1. Sentiment Analysis
```http
GET /sentiment/{currency}
```
**Response:**
```json
{
  "currency": "EUR",
  "currentSentiment": "BULLISH",
  "confidenceScore": 85,
  "trend": "STRENGTHENING",
  "lastUpdated": "2024-02-15T10:30:00Z",
  "recentEvents": [...]
}
```

#### 2. Economic Events
```http
GET /events/{currency}?limit=10&startDate=2024-01-01&endDate=2024-02-15
```
**Query Parameters:**
- `limit`: Number of events to return (default: 20, max: 100)
- `startDate`: Start date in ISO format
- `endDate`: End date in ISO format
- `eventType`: Filter by event type
- `impact`: Filter by impact level

#### 3. Bias Scorecard
```http
GET /scorecard/{currency}
```
**Response:**
```json
{
  "currency": "EUR",
  "pillars": [
    {
      "pillar": "POLICY",
      "score": 1.2,
      "weight": 0.25,
      "rationale": "ECB maintaining dovish stance with negative rates"
    }
  ],
  "weightedBiasScore": 0.8,
  "bias": "BULLISH",
  "updatedAt": "2024-02-15T10:30:00Z"
}
```

#### 4. Catalysts Calendar
```http
GET /calendar/{currency}?startDate=2024-02-15&endDate=2024-03-01
```

#### 5. Historical Data
```http
GET /historical/{currency}?startDate=2024-01-01&endDate=2024-02-15&granularity=daily
```

### WebSocket Endpoints

#### Real-time Updates
```javascript
// Connect to WebSocket
const socket = io('wss://api.forexfundamental.com');

// Subscribe to currency updates
socket.emit('subscribe', { currency: 'EUR' });

// Listen for real-time updates
socket.on('sentiment_update', (data) => {
  console.log('New sentiment data:', data);
});
```

### Rate Limiting
- **Free Tier**: 100 requests/hour
- **Premium Tier**: 1000 requests/hour
- **Enterprise**: Custom limits

---

## Database Schema

### PostgreSQL Tables

#### 1. currencies
```sql
CREATE TABLE currencies (
  id SERIAL PRIMARY KEY,
  code VARCHAR(3) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. economic_events
```sql
CREATE TABLE economic_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_id INTEGER REFERENCES currencies(id),
  event_type VARCHAR(50) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  event_date TIMESTAMP NOT NULL,
  actual_value DECIMAL(15,4),
  expected_value DECIMAL(15,4),
  previous_value DECIMAL(15,4),
  impact VARCHAR(10) CHECK (impact IN ('HIGH', 'MEDIUM', 'LOW')),
  sentiment VARCHAR(10) CHECK (sentiment IN ('BULLISH', 'BEARISH', 'NEUTRAL')),
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  price_impact DECIMAL(8,4),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. bias_pillars
```sql
CREATE TABLE bias_pillars (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  weight DECIMAL(3,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true
);
```

#### 4. currency_bias_scores
```sql
CREATE TABLE currency_bias_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_id INTEGER REFERENCES currencies(id),
  pillar_id INTEGER REFERENCES bias_pillars(id),
  score DECIMAL(3,2) NOT NULL,
  rationale TEXT,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. catalyst_events
```sql
CREATE TABLE catalyst_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_id INTEGER REFERENCES currencies(id),
  event_date TIMESTAMP NOT NULL,
  title VARCHAR(500) NOT NULL,
  category VARCHAR(50) NOT NULL,
  expected_value TEXT,
  previous_value TEXT,
  impact VARCHAR(10) CHECK (impact IN ('HIGH', 'MEDIUM', 'LOW')),
  skew VARCHAR(10) CHECK (skew IN ('BULLISH', 'BEARISH', 'NEUTRAL')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Redis Data Structures

#### 1. Real-time Sentiment Cache
```
Key: sentiment:{currency}:current
Value: JSON string of current sentiment data
TTL: 5 minutes
```

#### 2. Event Cache
```
Key: events:{currency}:recent
Value: JSON array of recent events
TTL: 10 minutes
```

#### 3. User Session Cache
```
Key: session:{user_id}
Value: JSON string of user session data
TTL: 24 hours
```

### InfluxDB Measurements

#### 1. sentiment_time_series
```
measurement: sentiment_time_series
tags: currency, pillar
fields: score, confidence, price_impact
timestamp: event_time
```

#### 2. economic_indicators
```
measurement: economic_indicators
tags: currency, indicator_type, source
fields: value, expected, previous, surprise
timestamp: release_time
```

---

## Deployment Guide

### Prerequisites
- Docker and Docker Compose installed
- Kubernetes cluster (minikube for local development)
- kubectl configured
- Helm 3.x installed

### Local Development Setup

#### 1. Clone Repository
```bash
git clone https://github.com/your-org/forex-fundamental-app.git
cd forex-fundamental-app
```

#### 2. Environment Configuration
```bash
# Copy environment files
cp .env.example .env
cp docker-compose.override.yml.example docker-compose.override.yml

# Edit environment variables
nano .env
```

#### 3. Start Services
```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f [service_name]
```

### Kubernetes Deployment

#### 1. Create Namespace
```bash
kubectl create namespace forex-app
kubectl config set-context --current --namespace=forex-app
```

#### 2. Deploy Infrastructure
```bash
# Deploy PostgreSQL
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install postgres bitnami/postgresql \
  --namespace forex-app \
  --set postgresqlPassword=your_password

# Deploy Redis
helm install redis bitnami/redis \
  --namespace forex-app \
  --set auth.password=your_password

# Deploy Kafka
helm repo add confluentinc https://confluentinc.github.io/cqrs-helm-charts/
helm install kafka confluentinc/cp-kafka \
  --namespace forex-app
```

#### 3. Deploy Application Services
```bash
# Deploy API Gateway
kubectl apply -f k8s/api-gateway.yaml

# Deploy Data Collection Service
kubectl apply -f k8s/data-collection.yaml

# Deploy Data Processing Service
kubectl apply -f k8s/data-processing.yaml

# Deploy Frontend
kubectl apply -f k8s/frontend.yaml
```

#### 4. Configure Ingress
```bash
# Deploy NGINX Ingress Controller
kubectl apply -f k8s/ingress.yaml

# Configure SSL certificates
kubectl apply -f k8s/cert-manager.yaml
```

### Production Deployment

#### 1. Environment Variables
```bash
# Production environment file
cp .env.production .env
```

#### 2. Resource Limits
```yaml
# k8s/deployment.yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

#### 3. Horizontal Pod Autoscaling
```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## Testing Strategy

### Testing Pyramid

#### 1. Unit Tests (70%)
- **Coverage**: Individual functions and components
- **Framework**: Jest for backend, React Testing Library for frontend
- **Target**: 90%+ code coverage

```typescript
// Example unit test
describe('CurrencyStrengthCalculator', () => {
  it('should calculate correct bias score', () => {
    const calculator = new CurrencyStrengthCalculator();
    const result = calculator.calculateBias(mockPillarData);
    expect(result.bias).toBe('BULLISH');
    expect(result.score).toBeGreaterThan(0.6);
  });
});
```

#### 2. Integration Tests (20%)
- **Coverage**: Service interactions and API endpoints
- **Framework**: Jest with supertest for API testing
- **Database**: Test containers for isolated testing

```typescript
// Example integration test
describe('Sentiment API', () => {
  it('should return sentiment for currency', async () => {
    const response = await request(app)
      .get('/api/v1/sentiment/EUR')
      .expect(200);
    
    expect(response.body.currency).toBe('EUR');
    expect(response.body.currentSentiment).toBeDefined();
  });
});
```

#### 3. End-to-End Tests (10%)
- **Coverage**: Complete user workflows
- **Framework**: Cypress for frontend, Playwright for API
- **Environment**: Staging environment with test data

```typescript
// Example E2E test
describe('Dashboard Workflow', () => {
  it('should display currency sentiment correctly', () => {
    cy.visit('/dashboard');
    cy.get('[data-testid="eur-sentiment"]').should('contain', 'BULLISH');
    cy.get('[data-testid="eur-confidence"]').should('contain', '85%');
  });
});
```

### Test Data Management

#### 1. Test Fixtures
```typescript
// test/fixtures/economicEvents.ts
export const mockEconomicEvents = [
  {
    id: '1',
    currency: 'EUR',
    eventType: 'CPI',
    title: 'Eurozone CPI Data',
    date: '2024-02-15T10:00:00Z',
    impact: 'HIGH',
    sentiment: 'BULLISH',
    confidenceScore: 85
  }
];
```

#### 2. Test Database
```yaml
# docker-compose.test.yml
services:
  postgres-test:
    image: postgres:15
    environment:
      POSTGRES_DB: forex_test
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
    ports:
      - "5433:5432"
```

### Performance Testing

#### 1. Load Testing
- **Tool**: Artillery.js or k6
- **Scenarios**: High-frequency data updates, concurrent users
- **Targets**: 1000+ concurrent users, <2s response time

#### 2. Stress Testing
- **Tool**: Apache JMeter
- **Scenarios**: Peak load conditions, resource exhaustion
- **Targets**: Identify breaking points and recovery behavior

### Security Testing

#### 1. Vulnerability Scanning
- **Tool**: OWASP ZAP, Snyk
- **Frequency**: Weekly automated scans
- **Focus**: SQL injection, XSS, CSRF, authentication

#### 2. Penetration Testing
- **Frequency**: Quarterly manual testing
- **Scope**: API endpoints, authentication, data access
- **Reporting**: Detailed vulnerability reports with remediation

---

## Security Considerations

### Authentication & Authorization

#### 1. JWT Implementation
```typescript
// JWT configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: '24h',
  issuer: 'forex-fundamental-app',
  audience: 'forex-traders'
};

// Token validation middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};
```

#### 2. Role-Based Access Control
```typescript
// User roles
enum UserRole {
  FREE_USER = 'free_user',
  PREMIUM_USER = 'premium_user',
  ENTERPRISE_USER = 'enterprise_user',
  ADMIN = 'admin'
}

// Permission middleware
const requireRole = (roles: UserRole[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### Data Protection

#### 1. Encryption
- **At Rest**: AES-256 encryption for sensitive data
- **In Transit**: TLS 1.3 for all communications
- **API Keys**: Encrypted storage with key rotation

#### 2. Data Privacy
- **GDPR Compliance**: User consent, data portability, right to deletion
- **Data Retention**: Configurable retention policies
- **Anonymization**: PII removal for analytics

### API Security

#### 1. Rate Limiting
```typescript
// Rate limiting configuration
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', apiLimiter);
```

#### 2. Input Validation
```typescript
// Input sanitization
import { body, validationResult } from 'express-validator';

const validateEvent = [
  body('currency').isIn(['EUR', 'USD', 'JPY', 'GBP']),
  body('eventType').isLength({ min: 1, max: 50 }),
  body('title').isLength({ min: 1, max: 500 }),
  body('date').isISO8601(),
  body('impact').isIn(['HIGH', 'MEDIUM', 'LOW']),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

### Infrastructure Security

#### 1. Network Security
- **VPC**: Isolated network segments
- **Firewall**: Restrictive inbound/outbound rules
- **VPN**: Secure access to production environments

#### 2. Container Security
- **Image Scanning**: Vulnerability scanning for all container images
- **Runtime Security**: Pod security policies, network policies
- **Secrets Management**: Kubernetes secrets, external secret operators

---

## Monitoring and Alerting

### Application Monitoring

#### 1. Metrics Collection
```typescript
// Prometheus metrics
import prometheus from 'prom-client';

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const sentimentCalculationDuration = new prometheus.Histogram({
  name: 'sentiment_calculation_duration_seconds',
  help: 'Duration of sentiment calculation in seconds',
  labelNames: ['currency', 'pillar']
});
```

#### 2. Health Checks
```typescript
// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    await db.query('SELECT 1');
    
    // Check Redis connectivity
    await redis.ping();
    
    // Check external APIs
    const apiHealth = await checkExternalAPIs();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        redis: 'healthy',
        externalAPIs: apiHealth
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

### Infrastructure Monitoring

#### 1. Kubernetes Monitoring
```yaml
# k8s/monitoring.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
            action: keep
            regex: true
```

#### 2. Resource Monitoring
- **CPU/Memory**: Pod resource usage and limits
- **Network**: Ingress/egress traffic, latency
- **Storage**: Database performance, disk usage

### Alerting Rules

#### 1. Critical Alerts
```yaml
# prometheus/alertmanager.yml
groups:
  - name: critical
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"
```

#### 2. Warning Alerts
```yaml
      - alert: HighLatency
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "95th percentile latency is {{ $value }}s"
```

### Logging Strategy

#### 1. Structured Logging
```typescript
// Winston logger configuration
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

#### 2. Log Aggregation
- **ELK Stack**: Elasticsearch, Logstash, Kibana
- **Centralized Storage**: All service logs in one location
- **Search & Analysis**: Full-text search and log analysis

### Performance Monitoring

#### 1. Real-time Dashboards
- **Grafana**: Custom dashboards for key metrics
- **Business Metrics**: User engagement, API usage, error rates
- **Technical Metrics**: Response times, throughput, resource usage

#### 2. SLA Monitoring
- **Uptime**: 99.9% availability target
- **Response Time**: <2 seconds for 95% of requests
- **Data Freshness**: <5 minutes for real-time data

---

## Development Roadmap

### Phase 1: MVP (Months 1-3)
- [ ] Basic data collection infrastructure
- [ ] Core sentiment analysis engine
- [ ] Simple dashboard UI
- [ ] Historical data storage
- [ ] Basic API endpoints

### Phase 2: Enhanced Features (Months 4-6)
- [ ] Advanced sentiment analysis
- [ ] Interactive charts and visualizations
- [ ] Real-time data streaming
- [ ] User authentication and preferences
- [ ] Mobile-responsive design

### Phase 3: Advanced Analytics (Months 7-9)
- [ ] Strategy backtesting engine
- [ ] Custom alerts and notifications
- [ ] Performance analytics
- [ ] Data export capabilities
- [ ] Advanced filtering and search

### Phase 4: Scale & Optimize (Months 10-12)
- [ ] Performance optimization
- [ ] Advanced analytics and ML features
- [ ] Multi-language support
- [ ] Enterprise features
- [ ] API marketplace

---

## Success Metrics

### Key Performance Indicators (KPIs)

#### User Engagement
- **Daily Active Users (DAU)**: Target 1,000+ by month 6
- **Session Duration**: Average 15+ minutes per session
- **Feature Adoption**: 70%+ users using sentiment analysis

#### Data Quality
- **Data Accuracy**: 95%+ sentiment classification accuracy
- **Real-time Performance**: <2 second data latency
- **Uptime**: 99.9% availability

#### Business Metrics
- **User Retention**: 60%+ monthly retention rate
- **Revenue**: Freemium model with premium features
- **Market Share**: Top 3 in fundamental analysis tools

### Success Criteria
1. **User Satisfaction**: 4.5+ star rating on app stores
2. **Data Reliability**: 99%+ uptime for data feeds
3. **Performance**: <3 second page load times
4. **Scalability**: Support 10,000+ concurrent users

---

## Risk Assessment

### Technical Risks
- **Data Source Reliability**: Dependency on third-party APIs
- **Real-time Performance**: Handling high-frequency data updates
- **Scalability**: Managing large volumes of historical data

### Market Risks
- **Competition**: Established players with similar features
- **Regulatory Changes**: Financial data regulations
- **Market Volatility**: Forex market conditions affecting user demand

### Mitigation Strategies
- **Multiple Data Sources**: Redundant data providers
- **Performance Monitoring**: Real-time performance tracking
- **Compliance**: Regular regulatory compliance reviews
- **User Feedback**: Continuous user feedback integration

---

## Conclusion

This Forex Fundamental Data App addresses a clear market need for comprehensive fundamental analysis tools. The combination of real-time data collection, AI-powered sentiment analysis, and historical correlation analysis provides traders with actionable insights for their trading strategies.

The phased development approach ensures we can deliver value quickly while building toward a comprehensive solution. The focus on user experience, data quality, and performance will differentiate us from existing solutions in the market.

**Next Steps:**
1. Technical architecture review with development team
2. UI/UX design sprint
3. Data source integration planning
4. Development environment setup
5. MVP development kickoff

---

## Appendices

### A. API Response Examples
Detailed examples of all API responses with sample data.

### B. Database Migration Scripts
SQL scripts for database schema changes and data migrations.

### C. Configuration Files
Complete configuration files for all services and environments.

### D. Troubleshooting Guide
Common issues and their solutions for development and production.

### E. Performance Benchmarks
Performance test results and optimization recommendations.
