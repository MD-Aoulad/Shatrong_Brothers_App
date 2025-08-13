import dotenv from 'dotenv';
import { Pool } from 'pg';
import { createClient } from 'redis';
import { Kafka } from 'kafkajs';

dotenv.config();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Redis connection
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Kafka connection
const kafka = new Kafka({
  clientId: 'forex-data-processing',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

const consumer = kafka.consumer({ groupId: 'forex-data-processing-group' });

// Connect to Redis
redis.connect().catch(console.error);

// Process economic events
async function processEconomicEvent(event: any) {
  try {
    console.log('Processing economic event:', event.title);
    
    // Here you would implement sentiment analysis logic
    // For now, we'll just log the event
    console.log(`Processed event: ${event.title} for ${event.currency}`);
    
  } catch (error) {
    console.error('Error processing economic event:', error);
  }
}

// Start data processing
async function startDataProcessing() {
  try {
    // Connect to Kafka
    await consumer.connect();
    await consumer.subscribe({ topic: 'economic-events', fromBeginning: true });
    
    console.log('Connected to Kafka');

    // Test database connection
    const client = await pool.connect();
    console.log('Connected to database');
    client.release();

    // Start consuming messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value?.toString() || '{}');
          await processEconomicEvent(event);
        } catch (error) {
          console.error('Error processing message:', error);
        }
      },
    });

    console.log('Data processing service started');

  } catch (error) {
    console.error('Failed to start data processing service:', error);
    process.exit(1);
  }
}

startDataProcessing();
