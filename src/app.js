require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./db');
const { initializeDatabase } = require('./db/init');
const requestLogger = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');
const healthRoutes = require('./routes/health');
const notesRoutes = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(requestLogger);

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/notes', notesRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown handling
let server;

async function shutdown(signal) {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
  
  // Stop accepting new connections
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
    });
  }

  // Close database connections
  await db.close();
  
  console.log('Graceful shutdown complete.');
  process.exit(0);
}

// Handle shutdown signals (important for Kubernetes)
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start the server
async function start() {
  try {
    // Check database connection before starting
    console.log('Checking database connection...');
    const dbConnected = await db.checkConnection();
    
    if (!dbConnected) {
      console.error('Cannot connect to database. Please check your configuration.');
      process.exit(1);
    }
    
    console.log('Database connection successful.');

    // Initialize database schema
    await initializeDatabase();

    // Start HTTP server - bind to 0.0.0.0 for container compatibility
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
      console.log('Press Ctrl+C to stop.');
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
