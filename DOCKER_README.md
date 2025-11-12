# Docker Infrastructure - Building Permit Platform

Complete Docker setup for the AI-powered building permit checking platform.

## Architecture

The platform consists of 6 containerized services:

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Nginx     │────▶│   Frontend   │────▶│   Backend    │
│  (Port 80)  │     │  (Port 3000) │     │  (Port 5000) │
└─────────────┘     └──────────────┘     └───────┬──────┘
                                                  │
                    ┌──────────────┐             │
                    │  AI Service  │◀────────────┤
                    │  (Port 8000) │             │
                    └───────┬──────┘             │
                            │                    │
    ┌───────────────────────┼────────────────────┘
    │                       │
┌───▼──────┐          ┌────▼─────┐
│PostgreSQL│          │  Redis   │
│ (5432)   │          │  (6379)  │
└──────────┘          └──────────┘
```

## Services

### 1. PostgreSQL (postgres)
- **Image:** postgres:16-alpine
- **Port:** 5432
- **Purpose:** Primary database
- **Data:** Persisted in `postgres_data` volume
- **Init:** Auto-initializes with `scripts/init-db.sql`

### 2. Redis (redis)
- **Image:** redis:7-alpine
- **Port:** 6379
- **Purpose:** Cache and session storage
- **Data:** Persisted in `redis_data` volume

### 3. Backend API (backend)
- **Build:** ./backend/Dockerfile
- **Port:** 5000
- **Tech:** Node.js, Express, TypeScript
- **Dependencies:** PostgreSQL, Redis
- **Volumes:** Source code, uploads

### 4. AI Service (ai-service)
- **Build:** ./ai-service/Dockerfile
- **Port:** 8000
- **Tech:** Python 3.11, FastAPI
- **Purpose:** PDF analysis, ML classification, rules validation
- **Volumes:** Source code, models, cache

### 5. Frontend (frontend)
- **Build:** ./frontend/Dockerfile
- **Port:** 3000
- **Tech:** React 18, TypeScript, Vite
- **Volumes:** Source code

### 6. Nginx (nginx)
- **Image:** nginx:alpine
- **Ports:** 80, 443
- **Purpose:** Reverse proxy (production only)
- **Profile:** production

## Quick Start

### Prerequisites

```bash
# Install Docker
# Windows: Download Docker Desktop from docker.com
# Linux: sudo apt install docker.io docker-compose
# Mac: Download Docker Desktop

# Verify installation
docker --version
docker-compose --version
```

### Setup and Run

```bash
# Clone the repository
cd building-permit-platform

# Run automated setup
chmod +x scripts/docker-setup.sh
./scripts/docker-setup.sh

# Or manual setup:
docker-compose pull
docker-compose build
docker-compose up -d
```

### Access the Platform

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **AI Service:** http://localhost:8000
- **API Docs:** http://localhost:5000/api-docs

### Default Credentials

```
Email:    admin@building-permit.local
Password: admin123
```

## Configuration

### Environment Variables (.env)

```env
# Node Environment
NODE_ENV=development

# Ports
BACKEND_PORT=5000
FRONTEND_PORT=3000
AI_SERVICE_PORT=8000
POSTGRES_PORT=5432
REDIS_PORT=6379

# Database
POSTGRES_DB=building_permit
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<change-in-production>

# Redis
REDIS_PASSWORD=<change-in-production>

# JWT
JWT_SECRET=<change-in-production>
JWT_EXPIRES_IN=7d

# Frontend URLs
VITE_API_URL=http://localhost:5000
VITE_AI_SERVICE_URL=http://localhost:8000
```

### Production Configuration

```bash
# Set environment
export NODE_ENV=production

# Update passwords in .env
# Generate strong JWT secret:
openssl rand -base64 32

# Start with nginx proxy
docker-compose --profile production up -d
```

## Common Commands

### Service Management

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart backend

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# Check service status
docker-compose ps

# Remove all containers and volumes
docker-compose down -v
```

### Development

```bash
# Rebuild after code changes
docker-compose build backend
docker-compose restart backend

# Enter container shell
docker-compose exec backend sh
docker-compose exec ai-service bash

# Run tests in container
docker-compose exec backend npm test
docker-compose exec ai-service pytest

# Watch logs
docker-compose logs -f backend ai-service
```

### Database

```bash
# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d building_permit

# Run SQL script
docker-compose exec postgres psql -U postgres -d building_permit -f /scripts/init-db.sql

# Backup database
docker-compose exec postgres pg_dump -U postgres building_permit > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres -d building_permit < backup.sql

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

### Redis

```bash
# Access Redis CLI
docker-compose exec redis redis-cli -a redis

# Flush cache
docker-compose exec redis redis-cli -a redis FLUSHALL

# Monitor Redis commands
docker-compose exec redis redis-cli -a redis MONITOR
```

## Validation

### Automated Validation

```bash
chmod +x scripts/validate-docker.sh
./scripts/validate-docker.sh
```

### Manual Validation

```bash
# 1. Check Docker Compose syntax
docker-compose config --quiet

# 2. Validate environment
docker-compose config

# 3. Check service health
docker-compose ps

# 4. Test endpoints
curl http://localhost:5000/health
curl http://localhost:8000/health
curl http://localhost:3000
```

## Troubleshooting

### Service won't start

```bash
# Check logs
docker-compose logs [service-name]

# Check container status
docker-compose ps

# Rebuild image
docker-compose build --no-cache [service-name]
docker-compose up -d [service-name]
```

### Port already in use

```bash
# Find process using port
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Change port in .env
BACKEND_PORT=5001

# Restart services
docker-compose down
docker-compose up -d
```

### Database connection errors

```bash
# Check postgres is healthy
docker-compose ps postgres

# Check connection from backend
docker-compose exec backend ping postgres

# Verify DATABASE_URL
docker-compose exec backend printenv DATABASE_URL

# Reset postgres
docker-compose down
docker volume rm building-permit-platform_postgres_data
docker-compose up -d postgres
```

### Out of disk space

```bash
# Clean up Docker
docker system prune -a --volumes

# Remove unused images
docker image prune -a

# Remove specific volumes
docker volume rm building-permit-platform_postgres_data
```

### Slow performance

```bash
# Allocate more resources to Docker
# Docker Desktop → Settings → Resources
# Increase CPU/Memory limits

# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1
docker-compose build
```

## Health Checks

All services have health checks configured:

- **PostgreSQL:** `pg_isready` (10s interval)
- **Redis:** `redis-cli ping` (10s interval)
- **Backend:** HTTP `/health` endpoint (30s interval)
- **AI Service:** HTTP `/health` endpoint (30s interval)

Check health status:
```bash
docker-compose ps
docker inspect building-permit-backend | grep Health -A 10
```

## Volumes

Persistent data is stored in Docker volumes:

```
postgres_data      - PostgreSQL database
redis_data         - Redis cache
backend_uploads    - Uploaded files
ai_models          - ML models
ai_cache           - AI service cache
frontend_build     - Production build (nginx)
```

Backup volumes:
```bash
docker run --rm -v building-permit-platform_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data
```

## Networks

All services communicate via the `building-permit-network` bridge network.

View network:
```bash
docker network inspect building-permit-platform_building-permit-network
```

## Security

### Production Checklist

- [ ] Change all default passwords in `.env`
- [ ] Generate strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS in nginx
- [ ] Configure firewall rules
- [ ] Set up SSL certificates (Let's Encrypt)
- [ ] Enable Docker security scanning
- [ ] Implement rate limiting
- [ ] Configure CORS properly
- [ ] Enable audit logging
- [ ] Set up monitoring and alerts

### Best Practices

1. **Never commit .env to git**
2. **Use secrets management** (Docker secrets, HashiCorp Vault)
3. **Run as non-root user** in containers
4. **Scan images** for vulnerabilities
5. **Limit container resources** (CPU, memory)
6. **Use read-only filesystems** where possible
7. **Enable AppArmor/SELinux**
8. **Regular security updates**

## Monitoring

### Logs

```bash
# Real-time logs
docker-compose logs -f --tail=100

# Export logs
docker-compose logs > app.log

# Filter by service
docker-compose logs backend | grep ERROR
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df
```

### Health Monitoring

Add to production:
- **Prometheus** for metrics
- **Grafana** for visualization
- **ELK Stack** for log aggregation
- **Sentry** for error tracking

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build and Test

on: [push, pull_request]

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build images
        run: docker-compose build

      - name: Start services
        run: docker-compose up -d

      - name: Run tests
        run: |
          docker-compose exec -T backend npm test
          docker-compose exec -T ai-service pytest

      - name: Stop services
        run: docker-compose down
```

## Additional Resources

- **Docker Documentation:** https://docs.docker.com
- **Docker Compose:** https://docs.docker.com/compose
- **Best Practices:** https://docs.docker.com/develop/dev-best-practices
- **Security:** https://docs.docker.com/engine/security

## Support

For issues with Docker setup:
1. Run validation script: `./scripts/validate-docker.sh`
2. Check service logs: `docker-compose logs`
3. Review Docker daemon logs
4. Check GitHub Issues

---

**Platform Version:** 1.0.0
**Docker Compose Version:** 3.8+
**Last Updated:** 2025-11-12
