# Production Dockerfile for Render - Lightweight (No FFmpeg)
FROM node:18-alpine

# Install minimal dependencies for Puppeteer + WhatsApp
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    curl \
    dumb-init

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Configure npm for faster installs and install dependencies
RUN npm config set fund false && \
    npm config set audit false && \
    npm install --omit=dev --no-optional --silent

# Copy source code
COPY src/ ./src/

# Create WhatsApp session directory
RUN mkdir -p /app/.wwebjs_auth

# Set environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=error

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/healthz || exit 1

# Start application
CMD ["npm", "start"]