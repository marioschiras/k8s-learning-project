require('dotenv').config();
const express = require('express');
const db = require('./db');
const { initializeDatabase } = require('./db/init');
const requestLogger = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');
const healthRoutes = require('./routes/health');
const notesRoutes = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS middleware - allow requests from frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware
app.use(express.json());
app.use(requestLogger);

// API Routes only - no static files
app.use('/api/health', healthRoutes);
app.use('/api/notes', notesRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown handling
let server;

async function shutdown(signal) {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
  
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
    });
  }

  await db.close();
  
  console.log('Graceful shutdown complete.');
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

async function start() {
  try {
    console.log('Backend API starting...');
    console.log('Checking database connection...');
    const dbConnected = await db.checkConnection();
    
    if (!dbConnected) {
      console.error('Cannot connect to database. Please check your configuration.');
      process.exit(1);
    }
    
    console.log('Database connection successful.');
    await initializeDatabase();

    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend API running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
