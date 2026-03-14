# Notes App

A simple full-stack Notes CRUD application built with Node.js, Express, and PostgreSQL. Designed to be beginner-friendly and easy to containerize for Kubernetes deployment.

## Features

- Create, read, update, and delete notes
- Search notes by title
- Simple and clean web UI
- RESTful API
- Health check endpoint for Kubernetes probes
- Graceful shutdown handling
- Environment-based configuration

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Frontend**: Vanilla HTML/CSS/JavaScript (served by Express)

## Project Structure

```
├── src/
│   ├── app.js              # Main application entry point
│   ├── db/
│   │   ├── index.js        # Database connection pool
│   │   └── init.js         # Schema initialization
│   ├── middleware/
│   │   ├── logger.js       # Request logging
│   │   └── errorHandler.js # Error handling
│   ├── routes/
│   │   ├── health.js       # Health check endpoint
│   │   └── notes.js        # Notes CRUD endpoints
│   └── public/
│       ├── index.html      # Frontend HTML
│       ├── styles.css      # Styles
│       └── app.js          # Frontend JavaScript
├── sql/
│   └── init.sql            # Database schema
├── package.json
├── Dockerfile
├── .env.example
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js 18+ (recommended: 20)
- PostgreSQL 13+
- npm

## Environment Variables

| Variable      | Description              | Default     |
|---------------|--------------------------|-------------|
| `PORT`        | Server port              | `3000`      |
| `DB_HOST`     | PostgreSQL host          | (required)  |
| `DB_PORT`     | PostgreSQL port          | `5432`      |
| `DB_NAME`     | Database name            | (required)  |
| `DB_USER`     | Database user            | (required)  |
| `DB_PASSWORD` | Database password        | (required)  |

## Local Development Setup

### 1. Install PostgreSQL

**macOS (using Homebrew):**

```bash
brew install postgresql@16
brew services start postgresql@16
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create the Database

**macOS (Homebrew PostgreSQL uses your system username):**

```bash
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
createdb notes_db
psql -d notes_db -f sql/init.sql
```

**Linux (default postgres user):**

```bash
sudo -u postgres createdb notes_db
sudo -u postgres psql -d notes_db -f sql/init.sql
```

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

**macOS (Homebrew) - use your system username, no password:**

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=notes_db
DB_USER=your_macos_username
DB_PASSWORD=
```

**Linux - use postgres user:**

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=notes_db
DB_USER=postgres
DB_PASSWORD=your_password
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Application

**Development mode (with auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The app will:
1. Connect to PostgreSQL
2. Automatically create the `notes` table if it doesn't exist
3. Start the HTTP server on the configured port

Open http://localhost:3000 in your browser.

### Quick Start (macOS with Homebrew)

```bash
# Install and start PostgreSQL
brew install postgresql@16
brew services start postgresql@16

# Set up the database
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
createdb notes_db

# Configure and run
cp .env.example .env
# Edit .env: set DB_USER to your macOS username, leave DB_PASSWORD empty
npm install
npm run dev
```

## API Endpoints

### Health Check

```
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected"
}
```

### List All Notes

```
GET /api/notes
GET /api/notes?search=keyword
```

Response:
```json
{
  "notes": [
    {
      "id": 1,
      "title": "My Note",
      "content": "Note content here",
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Get Single Note

```
GET /api/notes/:id
```

Response:
```json
{
  "note": {
    "id": 1,
    "title": "My Note",
    "content": "Note content here",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z"
  }
}
```

### Create Note

```
POST /api/notes
Content-Type: application/json

{
  "title": "My Note",
  "content": "Note content here"
}
```

Response (201 Created):
```json
{
  "note": {
    "id": 1,
    "title": "My Note",
    "content": "Note content here",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z"
  }
}
```

### Update Note

```
PUT /api/notes/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content"
}
```

Response:
```json
{
  "note": {
    "id": 1,
    "title": "Updated Title",
    "content": "Updated content",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Delete Note

```
DELETE /api/notes/:id
```

Response:
```json
{
  "message": "Note deleted successfully",
  "id": 1
}
```

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "message": "Error description",
    "status": 400
  }
}
```

Common status codes:
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

## Docker

Build the image:

```bash
docker build -t notes-app .
```

Run the container (requires external PostgreSQL):

```bash
docker run -p 3000:3000 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_NAME=notes_db \
  -e DB_USER=postgres \
  -e DB_PASSWORD=your_password \
  notes-app
```

## Kubernetes Deployment Notes

This app is designed to be Kubernetes-friendly:

- **Environment Configuration**: All settings via environment variables
- **Health Endpoint**: `/api/health` returns 200 when healthy, 503 when database is down
- **Graceful Shutdown**: Handles SIGTERM for clean pod termination
- **Stateless**: No local file storage; all state in PostgreSQL
- **Non-root User**: Container runs as non-root for security
- **0.0.0.0 Binding**: Accepts connections from any interface

Recommended Kubernetes probes:

```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 15

readinessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

## License

MIT
