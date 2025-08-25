#!/bin/bash

# Production environment startup script
# Usage: ./scripts/start-prod.sh

set -e

echo "Starting Borçlu Sorgulama - Production Environment"
echo "================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Check if required environment variables are set
if [ -z "$GEMINI_API_KEY" ] || [ -z "$NEXTAUTH_SECRET" ]; then
    echo "Error: Required environment variables are not set."
    echo "Please set the following environment variables:"
    echo "  GEMINI_API_KEY"
    echo "  NEXTAUTH_SECRET"
    echo "  NEXTAUTH_URL (optional, defaults to http://localhost:3000)"
    exit 1
fi

# Create backup before starting
echo "Creating database backup before startup..."
if docker ps | grep -q "borclu-sorgulama-prod"; then
    ./scripts/backup-database.sh "pre-deployment-$(date +%Y%m%d_%H%M%S)" || echo "Backup failed, continuing..."
fi

# Build and start production environment
echo "Building and starting production containers..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 15

# Check health
echo "Checking service health..."
for i in {1..60}; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✅ Application is healthy and ready!"
        break
    fi
    if [ $i -eq 60 ]; then
        echo "❌ Application failed to start properly"
        echo "Checking logs..."
        docker-compose -f docker-compose.prod.yml logs app
        exit 1
    fi
    echo "Waiting... ($i/60)"
    sleep 2
done

echo ""
echo "🚀 Production environment is ready!"
echo "📱 Application: http://localhost:3000"
echo "🏥 Health check: http://localhost:3000/api/health"
echo ""
echo "Production commands:"
echo "  View logs: docker-compose -f docker-compose.prod.yml logs -f app"
echo "  Stop: docker-compose -f docker-compose.prod.yml down"
echo "  Restart: docker-compose -f docker-compose.prod.yml restart app"
echo "  Backup DB: ./scripts/backup-database.sh"
echo "  Restore DB: ./scripts/restore-database.sh <backup-file>"
echo ""
echo "⚠️  Remember to:"
echo "  - Set up reverse proxy (nginx) for HTTPS"
echo "  - Configure firewall rules"
echo "  - Set up monitoring and alerting"
echo "  - Schedule regular database backups"
echo ""