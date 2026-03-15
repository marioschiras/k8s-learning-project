# Backend container - Express.js API only
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy backend source (no public folder)
COPY src/db/ ./src/db/
COPY src/middleware/ ./src/middleware/
COPY src/routes/ ./src/routes/

# Copy API-only app.js (without static file serving)
COPY backend/app.js ./src/app.js

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "src/app.js"]
