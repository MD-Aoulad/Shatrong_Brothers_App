import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

export const connectRedis = async () => {
  try {
    await client.connect();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Redis connection failed:', error);
    throw error;
  }
};

export const getRedisClient = () => client;

export default client;
