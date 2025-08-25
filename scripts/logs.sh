#!/bin/bash

# Centralized log viewing script
# Usage: ./scripts/logs.sh [environment] [service] [options]

set -e

ENVIRONMENT="prod"
SERVICE="app"
FOLLOW=false
TAIL_LINES=100

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        dev|development)
            ENVIRONMENT="dev"
            shift
            ;;
        prod|production)
            ENVIRONMENT="prod"
            shift
            ;;
        staging)
            ENVIRONMENT="staging"
            shift
            ;;
        test)
            ENVIRONMENT="test"
            shift
            ;;
        app|service)
            SERVICE="app"
            shift
            ;;
        -f|--follow)
            FOLLOW=true
            shift
            ;;
        -n|--tail)
            TAIL_LINES="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [environment] [service] [options]"
            echo ""
            echo "Environments:"
            echo "  dev, development    Development environment (default: docker-compose.yml)"
            echo "  prod, production    Production environment (docker-compose.prod.yml)"
            echo "  staging            Staging environment (docker-compose.staging.yml)"
            echo "  test               Test environment (docker-compose.test.yml)"
            echo ""
            echo "Services:"
            echo "  app                Application service (default)"
            echo ""
            echo "Options:"
            echo "  -f, --follow       Follow log output"
            echo "  -n, --tail LINES   Number of lines to show (default: 100)"
            echo "  -h, --help         Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                 Show last 100 lines from production app"
            echo "  $0 dev -f          Follow development logs"
            echo "  $0 prod -n 500     Show last 500 lines from production"
            echo "  $0 staging --follow Follow staging logs"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Determine compose file
case $ENVIRONMENT in
    dev)
        COMPOSE_FILE="docker-compose.yml"
        ENV_NAME="Development"
        ;;
    prod)
        COMPOSE_FILE="docker-compose.prod.yml"
        ENV_NAME="Production"
        ;;
    staging)
        COMPOSE_FILE="docker-compose.staging.yml"
        ENV_NAME="Staging"
        ;;
    test)
        COMPOSE_FILE="docker-compose.test.yml"
        ENV_NAME="Test"
        ;;
esac

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "Error: Compose file $COMPOSE_FILE not found"
    exit 1
fi

# Check if service is running
if ! docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
    echo "Warning: No services are currently running in $ENV_NAME environment"
    echo "Available containers:"
    docker ps -a --filter "name=borclu-sorgulama" --format "table {{.Names}}\t{{.Status}}"
    echo ""
    echo "To start $ENV_NAME environment:"
    case $ENVIRONMENT in
        dev)
            echo "  ./scripts/start-dev.sh"
            ;;
        prod)
            echo "  ./scripts/start-prod.sh"
            ;;
        staging)
            echo "  docker-compose -f $COMPOSE_FILE up -d"
            ;;
        test)
            echo "  docker-compose -f $COMPOSE_FILE up -d"
            ;;
    esac
    exit 1
fi

echo "📋 Viewing logs for $ENV_NAME environment - $SERVICE service"
echo "Compose file: $COMPOSE_FILE"
echo "============================================================"

# Build docker-compose logs command
LOGS_CMD="docker-compose -f $COMPOSE_FILE logs"

if [ "$FOLLOW" = true ]; then
    LOGS_CMD="$LOGS_CMD -f"
fi

LOGS_CMD="$LOGS_CMD --tail=$TAIL_LINES $SERVICE"

# Show current command
echo "Command: $LOGS_CMD"
echo ""

# Execute logs command
eval $LOGS_CMD