# Simplified Docker build for Next.js application
FROM node:20-alpine AS builder

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache git

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --no-audit --no-fund

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM node:20-alpine AS runner

WORKDIR /app

# Install git, Chromium and dependencies for WhatsApp
RUN apk add --no-cache \
    git \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    ttf-dejavu \
    ttf-liberation \
    font-noto \
    wget \
    xvfb \
    dbus \
    udev

# Tell Puppeteer to skip installing Chromium. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create nextjs user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application and static assets with proper structure
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy production dependencies for custom server
COPY --from=builder /app/node_modules ./node_modules

# Copy custom server
COPY --from=builder /app/server.js ./server.js

# Ensure all static directories exist with proper structure
RUN mkdir -p /app/.next/static /app/public /app/_next/static
RUN cp -r /app/.next/static/* /app/_next/static/ 2>/dev/null || true

# Set proper permissions for static assets
RUN chown -R nextjs:nodejs /app/.next /app/public /app/_next /app/server.js
RUN chmod -R 755 /app/.next/static /app/public /app/_next/static

# Copy Prisma files
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Generate Prisma client and setup database
RUN npx prisma generate
RUN npx prisma db push --accept-data-loss || true

# Create necessary directories with proper permissions
RUN mkdir -p /app/.wwebjs_auth /app/.wwebjs_cache /app/temp /app/prisma
RUN chown -R nextjs:nodejs /app/.wwebjs_auth /app/.wwebjs_cache /app/temp /app/prisma /app/server.js

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Switch to nextjs user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]