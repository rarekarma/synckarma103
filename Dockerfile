# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use --only=production unless BUILD_DEV_DEPS is set)
ARG BUILD_DEV_DEPS=false
RUN if [ "$BUILD_DEV_DEPS" = "true" ]; then \
      npm ci && npm cache clean --force; \
    else \
      npm ci --only=production && npm cache clean --force; \
    fi

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Expose port (if needed for health checks)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "process.exit(0)"

# Start the worker
CMD ["node", "dist/index.js"]

