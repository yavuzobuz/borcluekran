#!/bin/bash

# Database backup script for Docker container
# Usage: ./scripts/backup-database.sh [backup-name]

set -e

CONTAINER_NAME="borclu-sorgulama-prod"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME=${1:-"backup_${TIMESTAMP}"}

echo "Starting database backup..."

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "Error: Container $CONTAINER_NAME is not running"
    exit 1
fi

# Create backup
echo "Creating backup: $BACKUP_NAME"
docker exec "$CONTAINER_NAME" cp /app/prisma/dev.db /tmp/backup.db
docker cp "$CONTAINER_NAME:/tmp/backup.db" "$BACKUP_DIR/${BACKUP_NAME}.db"

# Cleanup temp file in container
docker exec "$CONTAINER_NAME" rm -f /tmp/backup.db

echo "Backup completed: $BACKUP_DIR/${BACKUP_NAME}.db"

# Keep only last 10 backups
cd "$BACKUP_DIR"
ls -t *.db | tail -n +11 | xargs -r rm --

echo "Backup cleanup completed"