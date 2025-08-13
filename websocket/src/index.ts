import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { createClient } from 'redis';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Redis connection
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Connect to Redis
redis.connect().catch(console.error);

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'websocket', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle subscription to currency updates
  socket.on('subscribe', (data: { currencies: string[] }) => {
    console.log('Client subscribed to currencies:', data.currencies);
    data.currencies.forEach(currency => {
      socket.join(`currency:${currency}`);
    });
  });

  // Handle unsubscription
  socket.on('unsubscribe', (data: { currencies: string[] }) => {
    console.log('Client unsubscribed from currencies:', data.currencies);
    data.currencies.forEach(currency => {
      socket.leave(`currency:${currency}`);
    });
  });

  // Handle historical data requests
  socket.on('historical_data', async (data: { currency: string; startDate: string; endDate: string }) => {
    try {
      const result = await pool.query(`
        SELECT sentiment_date, sentiment, confidence_score, price_change
        FROM sentiment_history
        WHERE currency = $1 AND sentiment_date BETWEEN $2 AND $3
        ORDER BY sentiment_date ASC
      `, [data.currency, data.startDate, data.endDate]);

      socket.emit('historical_data_response', {
        currency: data.currency,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching historical data:', error);
      socket.emit('error', { message: 'Failed to fetch historical data' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Function to broadcast sentiment updates
export const broadcastSentimentUpdate = async (currency: string, sentiment: any) => {
  io.to(`currency:${currency}`).emit('sentiment_update', {
    currency,
    sentiment: sentiment.currentSentiment,
    confidenceScore: sentiment.confidenceScore,
    timestamp: new Date().toISOString()
  });
};

// Function to broadcast new events
export const broadcastNewEvent = async (event: any) => {
  io.emit('new_event', {
    id: event.id,
    currency: event.currency,
    eventType: event.eventType,
    title: event.title,
    sentiment: event.sentiment,
    confidenceScore: event.confidenceScore,
    timestamp: new Date().toISOString()
  });
};

// Start server
async function startServer() {
  try {
    // Test database connection
    const client = await pool.connect();
    console.log('Connected to database');
    client.release();

    server.listen(PORT, () => {
      console.log(`WebSocket service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start WebSocket service:', error);
    process.exit(1);
  }
}

startServer();
