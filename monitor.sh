#!/bin/bash
# Monitoring script for production environment

set -e

# Configuration
PROJECT_DIR="/home/DACNPM"
DOCKER_COMPOSE="docker-compose -f docker-compose.yml"
LOG_FILE="/var/log/dacnpm-monitor.log"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to check service
check_service() {
    local service=$1
    local port=$2
    
    if curl -s http://localhost:$port > /dev/null; then
        echo -e "${GREEN}✓${NC} $service (port $port) is running"
        echo "[$(date)] $service: OK" >> $LOG_FILE
        return 0
    else
        echo -e "${RED}✗${NC} $service (port $port) is DOWN"
        echo "[$(date)] $service: FAILED" >> $LOG_FILE
        return 1
    fi
}

# Function to restart service
restart_service() {
    local service=$1
    echo -e "${YELLOW}🔄 Restarting $service...${NC}"
    cd $PROJECT_DIR
    $DOCKER_COMPOSE restart $service
}

# Check all services
echo -e "${YELLOW}🔍 Monitoring DACNPM services...${NC}"
echo "=================================================="

cd $PROJECT_DIR

# Check Backend
if ! check_service "Backend API" 5000; then
    restart_service "backend"
    sleep 5
    check_service "Backend API" 5000
fi

# Check Frontend
if ! check_service "Frontend" 5173; then
    restart_service "frontend"
    sleep 5
    check_service "Frontend" 5173
fi

# Check MongoDB
if $DOCKER_COMPOSE exec -T mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} MongoDB is running"
    echo "[$(date)] MongoDB: OK" >> $LOG_FILE
else
    echo -e "${RED}✗${NC} MongoDB is DOWN"
    echo "[$(date)] MongoDB: FAILED" >> $LOG_FILE
    restart_service "mongodb"
fi

# Show container stats
echo -e "\n${YELLOW}📊 Container Resource Usage:${NC}"
docker stats --no-stream

# Show recent errors
echo -e "\n${YELLOW}⚠️  Recent errors in logs:${NC}"
$DOCKER_COMPOSE logs --tail=20 | grep -i error || echo "No errors found"

echo -e "\n${GREEN}✅ Monitoring completed at $(date)${NC}"
