import express from 'express';
import axios from 'axios';

const router = express.Router();

// Trigger fresh data collection from Forex Factory and other sources
router.post('/refresh', async (req, res) => {
  try {
    console.log('🔄 Triggering data refresh from API gateway...');
    
    // Call the data collection service to trigger refresh
    const response = await axios.post('http://data-collection:8002/api/refresh', {
      source: 'api-gateway',
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ Data refresh triggered successfully');
    
    res.json({
      success: true,
      message: 'Data refresh triggered successfully',
      timestamp: new Date().toISOString(),
      response: response.data
    });
    
  } catch (error) {
    console.error('❌ Error triggering data refresh:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to trigger data refresh',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Get the latest data after refresh
router.get('/latest', async (req, res) => {
  try {
    console.log('📊 Fetching latest data from API gateway...');
    
    // Get latest data from data collection service
    const response = await axios.get('http://data-collection:8002/api/latest');
    
    res.json({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching latest data:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest data',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Get data collection status
router.get('/status', async (req, res) => {
  try {
    console.log('📈 Fetching data collection status...');
    
    // Get status from data collection service
    const response = await axios.get('http://data-collection:8002/api/status');
    
    res.json({
      success: true,
      status: response.data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching data status:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch data status',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Get Forex Factory calendar data
router.get('/forex-factory', async (req, res) => {
  try {
    const { week } = req.query;
    console.log(`📅 Fetching Forex Factory calendar data${week ? ` for week: ${week}` : ''}...`);
    
    // Get Forex Factory data from data collection service
    const response = await axios.get(`http://data-collection:8002/api/forex-factory${week ? `?week=${week}` : ''}`);
    
    res.json({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching Forex Factory data:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Forex Factory data',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Get real-time economic indicators
router.get('/indicators', async (req, res) => {
  try {
    console.log('📊 Fetching economic indicators...');
    
    // Get indicators from data collection service
    const response = await axios.get('http://data-collection:8002/api/indicators');
    
    res.json({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching economic indicators:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch economic indicators',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Get currency prices
router.get('/prices', async (req, res) => {
  try {
    console.log('💱 Fetching currency prices...');
    
    // Get prices from data collection service
    const response = await axios.get('http://data-collection:8002/api/prices');
    
    res.json({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching currency prices:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch currency prices',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
