# ==========================================================
# 🐳 Dockerfile — Travel Dashboard Enterprise v3.0 (Final)
# ==========================================================

# ---- Base Stage ----
FROM node:22-alpine AS base

# Set environment variables
ENV NODE_ENV=production \
    TZ=Asia/Jakarta \
    PORT=3000

# Set working directory
WORKDIR /app

# Copy dependency files first for better caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Ensure data directory exists (SQLite database)
RUN mkdir -p /app/data

# Security hardening: disable npm update checks and analytics
RUN npm config set update-notifier false && npm config set fund false

# Expose app port
EXPOSE 3000

# Optional: basic healthcheck (matches /api/dashboard/summary)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/dashboard/summary > /dev/null || exit 1

# Start server
CMD ["node", "server.js"]
