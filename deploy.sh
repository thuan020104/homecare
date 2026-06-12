#!/bin/bash
# Production deployment script for VPS

set -e

echo "🚀 Starting Production Deployment..."

# Configuration
PROJECT_DIR="/home/DACNPM"
DOCKER_COMPOSE="docker-compose -f docker-compose.yml"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Pull latest code
echo -e "${YELLOW}📥 Pulling latest code from GitHub...${NC}"
cd $PROJECT_DIR
git pull origin main

# 2. Build Docker images
echo -e "${YELLOW}🔨 Building Docker images...${NC}"
$DOCKER_COMPOSE build --no-cache

# 3. Stop old containers
echo -e "${YELLOW}⏹️  Stopping old containers...${NC}"
$DOCKER_COMPOSE stop

# 4. Start new containers
echo -e "${YELLOW}🚀 Starting new containers...${NC}"
$DOCKER_COMPOSE up -d

# 5. Wait for services
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 10

# 6. Verify deployment
echo -e "${YELLOW}✅ Verifying deployment...${NC}"

# Check backend
if curl -s http://localhost:5000/health > /dev/null; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is not responding${NC}"
    exit 1
fi

# Check frontend
if curl -s http://localhost:5173 > /dev/null; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
else
    echo -e "${RED}✗ Frontend is not responding${NC}"
    exit 1
fi

# Check MongoDB
if $DOCKER_COMPOSE exec -T mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ MongoDB is running${NC}"
else
    echo -e "${RED}✗ MongoDB is not responding${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"

# 7. Show status
echo -e "\n${YELLOW}📊 Service Status:${NC}"
$DOCKER_COMPOSE ps

# 8. Show logs
echo -e "\n${YELLOW}📋 Recent logs:${NC}"
$DOCKER_COMPOSE logs --tail=50

echo -e "\n${GREEN}✅ Deployment finished at $(date)${NC}"
