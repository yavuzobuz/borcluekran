#!/bin/bash

# Stop all Docker services gracefully
# Usage: ./scripts/stop-all.sh [--remove-volumes]

set -e

REMOVE_VOLUMES=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --remove-volumes)
            REMOVE_VOLUMES=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--remove-volumes]"
            exit 1
            ;;
    esac
done

echo "Stopping Borçlu Sorgulama Services"
echo "=================================="

# Function to stop services gracefully
stop_services() {
    local compose_file=$1
    local env_name=$2
    
    if docker-compose -f "$compose_file" ps | grep -q "Up"; then
        echo "Stopping $env_name environment..."
        
        # Create backup before stopping production
        if [ "$env_name" = "production" ]; then
            echo "Creating backup before stopping production..."
            ./scripts/backup-database.sh "pre-stop-$(date +%Y%m%d_%H%M%S)" || echo "Backup failed, continuing..."
        fi
        
        # Graceful shutdown
        docker-compose -f "$compose_file" stop
        
        if [ "$REMOVE_VOLUMES" = true ]; then
            echo "Removing volumes for $env_name..."
            docker-compose -f "$compose_file" down -v
        else
            echo "Removing containers for $env_name (keeping volumes)..."
            docker-compose -f "$compose_file" down
        fi
        
        echo "✅ $env_name environment stopped"
    else
        echo "ℹ️  $env_name environment is not running"
    fi
}

# Stop all environments
stop_services "docker-compose.yml" "development"
stop_services "docker-compose.prod.yml" "production"
stop_services "docker-compose.staging.yml" "staging"
stop_services "docker-compose.test.yml" "test"

# Clean up orphaned containers
echo "Cleaning up orphaned containers..."
docker container prune -f

# Clean up unused networks
echo "Cleaning up unused networks..."
docker network prune -f

if [ "$REMOVE_VOLUMES" = true ]; then
    echo "⚠️  Volumes have been removed. All data has been deleted!"
    echo "If you need to restore data, use: ./scripts/restore-database.sh <backup-file>"
else
    echo "✅ All services stopped. Data volumes preserved."
    echo "To also remove volumes (DELETE ALL DATA): $0 --remove-volumes"
fi

echo ""
echo "Services status:"
docker ps -a --filter "name=borclu-sorgulama" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "Volume status:"
docker volume ls --filter "name=borclu" --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}"