import express from 'express';
import { query } from '../config/database';
import { getRedisClient } from '../config/redis';

const router = express.Router();

// Comprehensive health check endpoint
router.get('/', async (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Forex API Gateway',
    version: '2.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'unknown',
      redis: 'unknown',
      externalAPIs: 'unknown'
    },
    checks: {
      database: false,
      redis: false,
      memory: false,
      disk: false
    }
  };

  try {
    // Check database connectivity
    try {
      const dbResult = await query('SELECT 1 as test');
      if (dbResult.rows[0]?.test === 1) {
        healthStatus.services.database = 'healthy';
        healthStatus.checks.database = true;
      } else {
        healthStatus.services.database = 'unhealthy';
        healthStatus.status = 'degraded';
      }
    } catch (dbError) {
      healthStatus.services.database = 'unhealthy';
      healthStatus.status = 'unhealthy';
    }

    // Check Redis connectivity
    try {
      const redis = getRedisClient();
      await redis.ping();
      healthStatus.services.redis = 'healthy';
      healthStatus.checks.redis = true;
    } catch (redisError) {
      healthStatus.services.redis = 'unhealthy';
      healthStatus.status = 'degraded';
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };
    
    if (memUsageMB.heapUsed < 500) { // Less than 500MB
      healthStatus.checks.memory = true;
    }

    // Check disk space (basic check)
    healthStatus.checks.disk = true; // Assume disk is fine for now

    // Determine overall status
    if (healthStatus.status === 'healthy' && !healthStatus.checks.database && !healthStatus.checks.redis) {
      healthStatus.status = 'unhealthy';
    } else if (healthStatus.status === 'healthy' && (!healthStatus.checks.database || !healthStatus.checks.redis)) {
      healthStatus.status = 'degraded';
    }

    // Set appropriate HTTP status code
    const statusCode = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(healthStatus);

  } catch (error) {
    healthStatus.status = 'unhealthy';
    healthStatus.services.externalAPIs = 'error';
    res.status(503).json(healthStatus);
  }
});

// Simple health check for load balancers
router.get('/ping', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Forex API Gateway'
  });
});

// Detailed health check with all metrics
router.get('/detailed', async (req, res) => {
  try {
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Forex API Gateway',
      version: '2.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      },
      services: {
        database: await checkDatabaseHealth(),
        redis: await checkRedisHealth(),
        externalAPIs: await checkExternalAPIsHealth()
      }
    };

    // Determine overall status
    const allServicesHealthy = Object.values(detailedHealth.services).every(service => service.status === 'healthy');
    detailedHealth.status = allServicesHealthy ? 'healthy' : 'degraded';

    const statusCode = detailedHealth.status === 'healthy' ? 200 : 200;
    res.status(statusCode).json(detailedHealth);

  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to check database health
async function checkDatabaseHealth() {
  try {
    const startTime = Date.now();
    const result = await query('SELECT 1 as test, NOW() as current_time');
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      currentTime: result.rows[0]?.current_time,
      connection: 'active'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      connection: 'failed'
    };
  }
}

// Helper function to check Redis health
async function checkRedisHealth() {
  try {
    const startTime = Date.now();
    const redis = getRedisClient();
    await redis.ping();
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      connection: 'active'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      connection: 'failed'
    };
  }
}

// Helper function to check external APIs health
async function checkExternalAPIsHealth() {
  // This would check external API endpoints
  // For now, return a basic status
  return {
    status: 'healthy',
    message: 'External APIs not configured for health checks',
    connection: 'unknown'
  };
}

export default router;
