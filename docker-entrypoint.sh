#!/bin/sh
set -e

echo "Starting Docker entrypoint script..."

# Create necessary directories
mkdir -p /app/.wwebjs_auth /app/.wwebjs_cache /app/temp /app/prisma

# Set proper permissions
chown -R nextjs:nodejs /app/.wwebjs_auth /app/.wwebjs_cache /app/temp /app/prisma

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma db push --accept-data-loss

# Check if database exists, if not create it
if [ ! -f "/app/prisma/dev.db" ]; then
    echo "Creating new database..."
    npx prisma db push
fi

echo "Database setup completed."

# Start the application
echo "Starting Next.js application..."
exec "$@"