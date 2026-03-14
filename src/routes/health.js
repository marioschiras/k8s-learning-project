const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/health - Health check endpoint for Kubernetes probes
router.get('/', async (req, res) => {
  const dbConnected = await db.checkConnection();
  
  const health = {
    status: dbConnected ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
  };

  // Return 503 if database is not connected (useful for readiness probes)
  const statusCode = dbConnected ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
