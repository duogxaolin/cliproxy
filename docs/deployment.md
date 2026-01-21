# Deployment Guide

## Prerequisites
- Docker & Docker Compose
- Git
- 2GB+ RAM
- 10GB+ disk space

## Quick Start (Local Development)

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
docker-compose up -d
```

### 4. Run Migrations
```bash
docker-compose exec backend npx prisma migrate deploy
```

### 5. Access Application
- Frontend: http://localhost
- API: http://localhost/api
- Health: http://localhost/health

---

## VPS Deployment (IP: 103.77.173.186)

### Step 1: SSH vào VPS
```bash
ssh root@103.77.173.186
```

### Step 2: Cài đặt Docker (nếu chưa có)
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Cài Docker Compose
apt-get install docker-compose-plugin -y
```

### Step 3: Clone Repository
```bash
cd /opt
git clone https://github.com/duogxaolin/cliproxy.git
cd cliproxy
```

### Step 4: Tạo file .env cho Production
```bash
cp .env.production .env
nano .env
```

**Cập nhật các giá trị quan trọng:**
```env
# Database - đổi password mạnh
POSTGRES_PASSWORD=your-strong-password-here
DATABASE_URL=postgresql://postgres:your-strong-password-here@postgres:5432/api_marketplace?schema=public

# JWT Secret - tạo key mới
JWT_SECRET=$(openssl rand -base64 64)

# Encryption Key - tạo key mới
ENCRYPTION_KEY=$(openssl rand -hex 32)

# Frontend URL
FRONTEND_URL=http://103.77.173.186
VITE_API_URL=http://103.77.173.186

# CLI Proxy URL (nếu có)
VITE_CLI_PROXY_URL=http://103.77.173.186:3000/cliproxy/control-panel
```

### Step 5: Mở Firewall
```bash
# UFW
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable

# Hoặc iptables
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

### Step 6: Build và Start Services
```bash
# Build images
docker-compose build

# Start tất cả services
docker-compose up -d

# Kiểm tra status
docker-compose ps
```

### Step 7: Chạy Database Migrations
```bash
# Đợi postgres khởi động xong (30s)
sleep 30

# Chạy migrations
docker-compose exec backend npx prisma migrate deploy

# Hoặc nếu lần đầu, push schema
docker-compose exec backend npx prisma db push
```

### Step 8: Kiểm tra hoạt động
```bash
# Kiểm tra logs
docker-compose logs -f

# Kiểm tra health
curl http://103.77.173.186/health

# Kiểm tra API
curl http://103.77.173.186/api/health
```

### Step 9: Truy cập Website
- **Frontend**: http://103.77.173.186
- **API**: http://103.77.173.186/api
- **Admin Panel**: http://103.77.173.186/admin (sau khi đăng nhập admin)

### Step 10: Tạo Admin User
1. Truy cập http://103.77.173.186/register
2. Đăng ký tài khoản đầu tiên (sẽ tự động là admin nếu `FIRST_USER_IS_ADMIN=true`)
3. Đăng nhập và truy cập Admin Dashboard

---

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

