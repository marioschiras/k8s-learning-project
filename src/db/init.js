const db = require('./index');

// Initialize the database schema
// This creates the notes table if it doesn't exist (safe to run multiple times)
async function initializeDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Create an index for faster searches by title
  const createIndexQuery = `
    CREATE INDEX IF NOT EXISTS idx_notes_title ON notes (title);
  `;

  // Create an index for sorting by updated_at
  const createUpdatedAtIndexQuery = `
    CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes (updated_at DESC);
  `;

  try {
    console.log('Initializing database schema...');
    await db.query(createTableQuery);
    await db.query(createIndexQuery);
    await db.query(createUpdatedAtIndexQuery);
    console.log('Database schema initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize database schema:', err.message);
    throw err;
  }
}

module.exports = { initializeDatabase };
