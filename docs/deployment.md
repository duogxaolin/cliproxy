# Deployment Guide

## Prerequisites
- Docker & Docker Compose
- Git
- 2GB+ RAM
- 10GB+ disk space

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/duogxaolin/cliproxy.git
cd cliproxy
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Start Services
```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 4. Run Migrations
```bash
docker-compose exec backend npx prisma migrate deploy
```

### 5. Access Application
- Frontend: http://localhost:3000
- API: http://localhost:3000/api
- Health: http://localhost:3000/health

## Environment Variables

### Required
```env
DATABASE_URL=postgresql://user:password@postgres:5432/cliproxy
JWT_SECRET=your-256-bit-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
```

### Optional
```env
NODE_ENV=production
PORT=3000
REDIS_URL=redis://redis:6379
FIRST_USER_IS_ADMIN=true
```

See `.env.example` for full list.

## Database Migrations

### Create Migration
```bash
docker-compose exec backend npx prisma migrate dev --name migration_name
```

### Apply Migrations
```bash
docker-compose exec backend npx prisma migrate deploy
```

### Reset Database (Development)
```bash
docker-compose exec backend npx prisma migrate reset
```

## Docker Services

| Service | Port | Description |
|---------|------|-------------|
| nginx | 80, 443 | Reverse proxy |
| frontend | 3001 | React app |
| backend | 3000 | Express API |
| postgres | 5432 | Database |
| redis | 6379 | Cache |

## Production Considerations

### SSL/TLS
1. Obtain SSL certificate (Let's Encrypt recommended)
2. Update `nginx/nginx.conf` with certificate paths
3. Uncomment HTTPS server block

### Backups
```bash
# Database backup
docker-compose exec postgres pg_dump -U user cliproxy > backup.sql

# Restore
docker-compose exec -T postgres psql -U user cliproxy < backup.sql
```

### Monitoring
- Health endpoint: `/health`
- Logs: `docker-compose logs -f`
- Metrics: Configure Prometheus (optional)

### Scaling
```bash
# Scale backend
docker-compose up -d --scale backend=3
```

## Troubleshooting

### Database Connection Failed
```bash
# Check postgres is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres
```

### Migrations Failed
```bash
# Reset and retry
docker-compose exec backend npx prisma migrate reset --force
```

### Port Already in Use
```bash
# Find process
netstat -tulpn | grep :3000

# Or change port in .env
PORT=3001
```

## Updating

```bash
git pull origin master
docker-compose build
docker-compose up -d
docker-compose exec backend npx prisma migrate deploy
```

