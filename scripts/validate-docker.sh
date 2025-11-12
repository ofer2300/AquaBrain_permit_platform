#!/bin/bash
# Docker Compose Validation Script
# Validates Docker infrastructure for Building Permit Platform

set -e

echo "=========================================="
echo "Building Permit Platform - Docker Validation"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

# 1. Check Docker installation
echo "1. Checking Docker installation..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | awk '{print $3}' | tr -d ',')
    check_pass "Docker installed (version: $DOCKER_VERSION)"
else
    check_fail "Docker not installed"
fi

# 2. Check Docker Compose
echo "2. Checking Docker Compose..."
if docker-compose --version &> /dev/null || docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version 2>/dev/null || docker compose version 2>/dev/null | head -1)
    check_pass "Docker Compose available ($COMPOSE_VERSION)"
else
    check_fail "Docker Compose not found"
fi

# 3. Check Docker daemon
echo "3. Checking Docker daemon..."
if docker info &> /dev/null; then
    check_pass "Docker daemon is running"
else
    check_fail "Docker daemon is not running"
fi

# 4. Validate docker-compose.yml syntax
echo "4. Validating docker-compose.yml..."
cd "$(dirname "$0")/.."
if docker-compose config --quiet 2>&1; then
    check_pass "docker-compose.yml syntax is valid"
else
    check_fail "docker-compose.yml has syntax errors"
fi

# 5. Check required files
echo "5. Checking required files..."
FILES=(
    ".env"
    "docker-compose.yml"
    "scripts/init-db.sql"
    "backend/Dockerfile"
    "frontend/Dockerfile"
    "ai-service/Dockerfile"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        check_pass "Found: $file"
    else
        check_fail "Missing: $file"
    fi
done

# 6. Check environment variables
echo "6. Checking environment variables..."
if [ -f ".env" ]; then
    REQUIRED_VARS=(
        "NODE_ENV"
        "POSTGRES_DB"
        "POSTGRES_USER"
        "POSTGRES_PASSWORD"
        "REDIS_PASSWORD"
        "JWT_SECRET"
    )

    source .env
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -n "${!var}" ]; then
            check_pass "Environment variable set: $var"
        else
            check_warn "Environment variable empty or missing: $var"
        fi
    done
else
    check_fail ".env file not found"
fi

# 7. Check Docker images
echo "7. Checking base Docker images availability..."
IMAGES=(
    "postgres:16-alpine"
    "redis:7-alpine"
    "nginx:alpine"
    "node:20-alpine"
    "python:3.11-slim"
)

for image in "${IMAGES[@]}"; do
    if docker image inspect "$image" &> /dev/null; then
        check_pass "Image available: $image"
    else
        check_warn "Image not cached (will be pulled): $image"
    fi
done

# 8. Check port availability
echo "8. Checking port availability..."
PORTS=(5432 6379 5000 3000 8000 80 443)
for port in "${PORTS[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -an | grep -q ":$port.*LISTEN" 2>/dev/null; then
        check_warn "Port $port is already in use"
    else
        check_pass "Port $port is available"
    fi
done

# 9. Check Docker network
echo "9. Checking Docker networks..."
if docker network ls | grep -q building-permit-network; then
    check_warn "Network 'building-permit-network' already exists"
else
    check_pass "Network name available: building-permit-network"
fi

# 10. Check Docker volumes
echo "10. Checking Docker volumes..."
VOLUMES=(
    "building-permit-platform_postgres_data"
    "building-permit-platform_redis_data"
    "building-permit-platform_backend_uploads"
    "building-permit-platform_ai_models"
    "building-permit-platform_ai_cache"
)

for volume in "${VOLUMES[@]}"; do
    if docker volume ls | grep -q "$volume"; then
        check_warn "Volume exists: $volume (will be reused)"
    else
        check_pass "Volume name available: $volume"
    fi
done

# 11. Validate service health checks
echo "11. Validating service configurations..."
if docker-compose config | grep -q "healthcheck"; then
    check_pass "Health checks configured for services"
else
    check_warn "No health checks found"
fi

# 12. Check Dockerfile syntax
echo "12. Checking Dockerfiles..."
DOCKERFILES=(
    "backend/Dockerfile"
    "frontend/Dockerfile"
    "ai-service/Dockerfile"
)

for dockerfile in "${DOCKERFILES[@]}"; do
    if [ -f "$dockerfile" ]; then
        if docker build -f "$dockerfile" --dry-run 2>&1 | grep -q "error"; then
            check_fail "Dockerfile has errors: $dockerfile"
        else
            check_pass "Dockerfile syntax OK: $dockerfile"
        fi
    fi
done

# Summary
echo ""
echo "=========================================="
echo "Validation Summary"
echo "=========================================="
echo -e "${GREEN}Passed:${NC}   $PASSED"
echo -e "${RED}Failed:${NC}   $FAILED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo "=========================================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Ready to start Docker services.${NC}"
    echo ""
    echo "To start services:"
    echo "  docker-compose up -d"
    echo ""
    echo "To view logs:"
    echo "  docker-compose logs -f"
    echo ""
    echo "To stop services:"
    echo "  docker-compose down"
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Please fix the issues before starting services.${NC}"
    exit 1
fi
