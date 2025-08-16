import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';

// Import routes
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import eventsRoutes from './routes/events';
import sentimentRoutes from './routes/sentiment';
import calendarRoutes from './routes/calendar';
import scorecardRoutes from './routes/scorecard';
import analyticsRoutes from './routes/analytics';
import currencyStrengthRoutes from './routes/currencyStrength';
import healthRoutes from './routes/health';
import mt5TestRoutes from './routes/mt5-test';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check routes
app.use('/health', healthRoutes);

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/events', eventsRoutes);
app.use('/api/v1/sentiment', sentimentRoutes);
app.use('/api/v1/calendar', calendarRoutes);
app.use('/api/v1/scorecard', scorecardRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/currency-strength', currencyStrengthRoutes);
app.use('/api/v1/mt5-test', mt5TestRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Forex Fundamental Data API Gateway',
    version: '2.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      dashboard: '/api/v1/dashboard',
      events: '/api/v1/events',
      sentiment: '/api/v1/sentiment',
      calendar: '/api/v1/calendar',
      scorecard: '/api/v1/scorecard',
      analytics: '/api/v1/analytics',
      currency_strength: '/api/v1/currency-strength'
    },
    documentation: '/api/docs',
    health: '/health'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Gateway Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint Not Found',
    message: `The requested endpoint ${req.originalUrl} does not exist`,
    available_endpoints: [
      '/api/v1/auth',
      '/api/v1/dashboard',
      '/api/v1/events',
      '/api/v1/sentiment',
      '/api/v1/calendar',
      '/api/v1/scorecard',
      '/api/v1/analytics',
      '/api/v1/currency-strength'
    ]
  });
});

// Start server with database connection
const startServer = async () => {
  try {
    // Connect to database first
    await connectDatabase();
    
    // Connect to Redis
    await connectRedis();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 API Gateway running on port ${PORT}`);
      console.log(`📊 Available endpoints:`);
      console.log(`   • Health Check: http://localhost:${PORT}/health`);
      console.log(`   • Dashboard: http://localhost:${PORT}/api/v1/dashboard`);
      console.log(`   • Events: http://localhost:${PORT}/api/v1/events`);
      console.log(`   • Sentiment: http://localhost:${PORT}/api/v1/sentiment`);
      console.log(`   • Calendar: http://localhost:${PORT}/api/v1/calendar`);
      console.log(`   • Scorecard: http://localhost:${PORT}/api/v1/scorecard`);
      console.log(`   • Analytics: http://localhost:${PORT}/api/v1/analytics`);
      console.log(`   • Currency Strength: http://localhost:${PORT}/api/v1/currency-strength`);
      console.log(`🔌 Enhanced with MT5 integration and comprehensive economic framework`);
    });
  } catch (error) {
    console.error('❌ Failed to start API Gateway:', error);
    process.exit(1);
  }
};

startServer();

export default app;
