const { Pool } = require('pg');

// Create a connection pool using environment variables
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // Connection pool settings suitable for containerized environments
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Log pool errors (don't crash the app)
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
});

// Helper function to execute queries
async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log(`Query executed in ${duration}ms: ${text.substring(0, 50)}...`);
  return result;
}

// Check database connectivity
async function checkConnection() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (err) {
    console.error('Database connection check failed:', err.message);
    return false;
  }
}

// Graceful shutdown
async function close() {
  console.log('Closing database pool...');
  await pool.end();
  console.log('Database pool closed.');
}

module.exports = {
  query,
  checkConnection,
  close,
  pool,
};
