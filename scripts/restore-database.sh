#!/bin/bash

# Database restore script for Docker container
# Usage: ./scripts/restore-database.sh <backup-file>

set -e

CONTAINER_NAME="borclu-sorgulama-prod"
BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file>"
    echo "Available backups:"
    ls -la ./backups/*.db 2>/dev/null || echo "No backups found"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file $BACKUP_FILE not found"
    exit 1
fi

echo "Starting database restore from: $BACKUP_FILE"

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "Error: Container $CONTAINER_NAME is not running"
    exit 1
fi

# Confirm restore
read -p "This will overwrite the current database. Are you sure? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled"
    exit 1
fi

# Stop the application temporarily
echo "Stopping application..."
docker exec "$CONTAINER_NAME" pkill -f "node server.js" || true
sleep 2

# Copy backup to container
echo "Copying backup to container..."
docker cp "$BACKUP_FILE" "$CONTAINER_NAME:/tmp/restore.db"

# Replace database
echo "Restoring database..."
docker exec "$CONTAINER_NAME" cp /tmp/restore.db /app/prisma/dev.db
docker exec "$CONTAINER_NAME" chown nextjs:nodejs /app/prisma/dev.db

# Cleanup temp file
docker exec "$CONTAINER_NAME" rm -f /tmp/restore.db

# Restart container to restart application
echo "Restarting container..."
docker restart "$CONTAINER_NAME"

echo "Database restore completed successfully"