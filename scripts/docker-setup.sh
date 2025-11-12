#!/bin/bash
# Docker Setup and Quick Start Script
# Building Permit Platform

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "Building Permit Platform - Docker Setup"
echo "==========================================${NC}"
echo ""

# Change to project root
cd "$(dirname "$0")/.."

# 1. Check prerequisites
echo -e "${BLUE}Step 1: Checking prerequisites...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}Error: Docker daemon is not running${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is ready${NC}"
echo ""

# 2. Create .env if it doesn't exist
echo -e "${BLUE}Step 2: Checking environment configuration...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cat > .env << 'EOF'
NODE_ENV=development
POSTGRES_DB=building_permit
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
REDIS_PASSWORD=redis
JWT_SECRET=your_jwt_secret_change_in_production
BACKEND_PORT=5000
FRONTEND_PORT=3000
AI_SERVICE_PORT=8000
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi
echo ""

# 3. Pull base images
echo -e "${BLUE}Step 3: Pulling Docker images...${NC}"
docker-compose pull
echo -e "${GREEN}✓ Images pulled${NC}"
echo ""

# 4. Build custom images
echo -e "${BLUE}Step 4: Building application images...${NC}"
docker-compose build --parallel
echo -e "${GREEN}✓ Images built${NC}"
echo ""

# 5. Start services
echo -e "${BLUE}Step 5: Starting services...${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Services started${NC}"
echo ""

# 6. Wait for health checks
echo -e "${BLUE}Step 6: Waiting for services to be healthy...${NC}"
echo "This may take 30-60 seconds..."
sleep 10

# Check postgres
echo -n "Waiting for PostgreSQL... "
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U postgres &> /dev/null; then
        echo -e "${GREEN}ready${NC}"
        break
    fi
    sleep 2
    echo -n "."
done

# Check redis
echo -n "Waiting for Redis... "
for i in {1..30}; do
    if docker-compose exec -T redis redis-cli ping &> /dev/null; then
        echo -e "${GREEN}ready${NC}"
        break
    fi
    sleep 2
    echo -n "."
done

echo ""

# 7. Display status
echo -e "${BLUE}Step 7: Service status${NC}"
docker-compose ps
echo ""

# 8. Show useful information
echo -e "${GREEN}=========================================="
echo "Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Services running at:"
echo -e "  ${BLUE}Frontend:${NC}    http://localhost:3000"
echo -e "  ${BLUE}Backend API:${NC} http://localhost:5000"
echo -e "  ${BLUE}AI Service:${NC}  http://localhost:8000"
echo -e "  ${BLUE}PostgreSQL:${NC}  localhost:5432"
echo -e "  ${BLUE}Redis:${NC}       localhost:6379"
echo ""
echo "Useful commands:"
echo "  View logs:        docker-compose logs -f"
echo "  Stop services:    docker-compose down"
echo "  Restart:          docker-compose restart"
echo "  Rebuild:          docker-compose build --no-cache"
echo ""
echo "Default admin credentials:"
echo "  Email:    admin@building-permit.local"
echo "  Password: admin123"
echo ""
echo -e "${YELLOW}⚠  Remember to change default passwords in production!${NC}"
