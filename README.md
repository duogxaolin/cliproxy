# API Marketplace Platform

A full-stack API marketplace platform that allows users to access AI models through a unified API interface with credit-based billing.

## Features

- **User Authentication**: JWT-based authentication with role-based access control
- **API Key Management**: Create, manage, and revoke API keys with quotas
- **Shadow Models**: Admin-configurable proxy to multiple AI providers
- **Credit System**: Prepaid credit balance with usage tracking
- **Usage Analytics**: Detailed usage statistics and reporting
- **Rate Limiting**: Redis-based rate limiting per API key/IP

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Frontend**: React, Vite, TailwindCSS
- **Database**: PostgreSQL
- **Cache**: Redis
- **Proxy**: Nginx
- **Container**: Docker, Docker Compose

## Prerequisites

- Docker and Docker Compose (v2.0+)
- Node.js 20+ (for local development)
- Git

## Quick Start with Docker

### 1. Clone the repository

```bash
git clone <repository-url>
cd api-marketplace-platform
```

### 2. Configure environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
# IMPORTANT: Change these values for production:
# - JWT_SECRET (generate with: openssl rand -base64 64)
# - ENCRYPTION_KEY (generate with: openssl rand -hex 32)
# - POSTGRES_PASSWORD
```

### 3. Start the application

```bash
# Development mode
docker-compose up -d

# Production mode (with resource limits and optimizations)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 4. Run database migrations

```bash
# Execute migrations inside the backend container
docker-compose exec backend npx prisma migrate deploy

# (Optional) Seed the database with initial data
docker-compose exec backend npx prisma db seed
```

### 5. Access the application

- **Frontend**: http://localhost
- **API**: http://localhost/api
- **Health Check**: http://localhost/health

## Local Development

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |
| POST | `/api/auth/logout` | Logout (invalidate token) |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile |
| GET | `/api/users/me/credits` | Get credit balance |
| GET | `/api/users/me/usage` | Get usage statistics |

### API Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/api-keys` | List user's API keys |
| POST | `/api/api-keys` | Create new API key |
| DELETE | `/api/api-keys/:id` | Revoke API key |

### Proxy Endpoints (API Key Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/messages` | Anthropic-compatible |
| POST | `/api/v1/chat/completions` | OpenAI-compatible |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| POST | `/api/admin/credits/grant` | Grant credits |
| GET | `/api/admin/models` | List shadow models |
| POST | `/api/admin/models` | Create shadow model |

## Environment Variables

See `.env.example` for all available configuration options.

### Required for Production

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Secret key for JWT signing |
| `ENCRYPTION_KEY` | AES-256 key for encrypting provider tokens |
| `POSTGRES_PASSWORD` | Database password |
| `DATABASE_URL` | Full PostgreSQL connection string |

## Docker Services

| Service | Port | Description |
|---------|------|-------------|
| nginx | 80, 443 | Reverse proxy |
| backend | 3000 (internal) | API server |
| frontend | 80 (internal) | Static files |
| postgres | 5432 | Database |
| redis | 6379 | Cache |

## Production Deployment

### SSL/TLS Configuration

1. Obtain SSL certificates (e.g., from Let's Encrypt)
2. Place certificates in `nginx/ssl/`
3. Uncomment SSL configuration in `nginx/nginx.conf`
4. Update `docker-compose.yml` to mount SSL volume

### Database Backup

```bash
# Manual backup
docker-compose exec postgres pg_dump -U postgres api_marketplace > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U postgres api_marketplace < backup.sql
```

### Scaling Considerations

- Use external managed PostgreSQL for production
- Use Redis Cluster for high availability
- Consider container orchestration (Kubernetes) for scaling
- Implement CDN for static assets

### Monitoring

- Health endpoint: `GET /health` returns service status
- Nginx access logs: `docker-compose logs nginx`
- Backend logs: `docker-compose logs backend`

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs <service-name>

# Rebuild containers
docker-compose build --no-cache
```

### Database connection issues

```bash
# Check if postgres is healthy
docker-compose exec postgres pg_isready

# Reset database (development only)
docker-compose down -v
docker-compose up -d
```

### Permission issues

```bash
# Fix volume permissions
sudo chown -R 1001:1001 ./data
```

## License

MIT

