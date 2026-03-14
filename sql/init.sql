-- Notes table schema
-- This script can be run manually or used with database initialization tools
-- It is safe to run multiple times (uses IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster title searches
CREATE INDEX IF NOT EXISTS idx_notes_title ON notes (title);

-- Index for sorting by updated_at
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes (updated_at DESC);

-- Optional: Insert a sample note for testing
-- INSERT INTO notes (title, content) VALUES ('Welcome', 'This is your first note!');
