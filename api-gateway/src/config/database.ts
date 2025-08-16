import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const connectDatabase = async () => {
  try {
    // Test the connection pool
    const client = await pool.connect();
    console.log('Database connected successfully');
    
    // Test a simple query to ensure the pool is working
    const testResult = await client.query('SELECT 1 as test');
    console.log('Database query test successful:', testResult.rows[0]);
    
    client.release();
    
    // Test the query function as well
    const queryTest = await query('SELECT 1 as query_test');
    console.log('Query function test successful:', queryTest.rows[0]);
    
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
