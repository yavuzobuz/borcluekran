#!/bin/bash

# Development environment startup script
# Usage: ./scripts/start-dev.sh

set -e

echo "Starting Borçlu Sorgulama - Development Environment"
echo "=================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env.development exists
if [ ! -f ".env.development" ]; then
    echo "Warning: .env.development not found. Creating from template..."
    cp .env.development .env.development.local
    echo "Please edit .env.development.local with your actual API keys"
fi

# Build and start development environment
echo "Building and starting development containers..."
docker-compose -f docker-compose.yml up --build -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 10

# Check health
echo "Checking service health..."
for i in {1..30}; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✅ Application is healthy and ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Application failed to start properly"
        echo "Checking logs..."
        docker-compose -f docker-compose.yml logs app
        exit 1
    fi
    echo "Waiting... ($i/30)"
    sleep 2
done

echo ""
echo "🚀 Development environment is ready!"
echo "📱 Application: http://localhost:3000"
echo "🏥 Health check: http://localhost:3000/api/health"
echo ""
echo "Useful commands:"
echo "  View logs: docker-compose -f docker-compose.yml logs -f app"
echo "  Stop: docker-compose -f docker-compose.yml down"
echo "  Restart: docker-compose -f docker-compose.yml restart app"
echo ""