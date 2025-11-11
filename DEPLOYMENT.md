# Deployment Guide - Developer Tools Platform

This guide covers deploying the Developer Tools platform to production.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Performance Optimizations](#performance-optimizations)
- [Monitoring](#monitoring)

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Domain name
- SSL certificate (Let's Encrypt recommended)

## Backend Deployment

### Using Gunicorn + Nginx

1. **Install dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with production values
```

3. **Run migrations:**
```bash
python manage.py migrate
python manage.py collectstatic --noinput
```

4. **Create Gunicorn systemd service:**
```bash
sudo nano /etc/systemd/system/devtools.service
```

```ini
[Unit]
Description=Developer Tools Gunicorn
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/developer_tools/backend
Environment="PATH=/var/www/developer_tools/venv/bin"
ExecStart=/var/www/developer_tools/venv/bin/gunicorn \
          --workers 4 \
          --bind unix:/var/www/developer_tools/backend/devtools.sock \
          core.wsgi:application

[Install]
WantedBy=multi-user.target
```

5. **Configure Nginx:**
```nginx
server {
    listen 80;
    server_name api.yourdevtools.com;

    location / {
        proxy_pass http://unix:/var/www/developer_tools/backend/devtools.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /var/www/developer_tools/backend/staticfiles/;
    }

    location /media/ {
        alias /var/www/developer_tools/backend/media/;
    }
}
```

6. **Enable and start services:**
```bash
sudo systemctl enable devtools
sudo systemctl start devtools
sudo systemctl enable nginx
sudo systemctl restart nginx
```

### Using Docker

```dockerfile
# Dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "core.wsgi:application"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: developer_tools
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    command: gunicorn core.wsgi:application --bind 0.0.0.0:8000
    volumes:
      - ./backend:/app
      - static_volume:/app/staticfiles
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/developer_tools
    depends_on:
      - db

volumes:
  postgres_data:
  static_volume:
```

## Frontend Deployment

### Build for Production

```bash
cd frontend
npm install
npm run build
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Deploy to Nginx

```nginx
server {
    listen 80;
    server_name yourdevtools.com www.yourdevtools.com;

    root /var/www/developer_tools/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Caching for static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

## Database Setup

### PostgreSQL Configuration

1. **Create database:**
```sql
CREATE DATABASE developer_tools;
CREATE USER devtools_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE developer_tools TO devtools_user;
```

2. **Optimize for production:**
```sql
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
SELECT pg_reload_conf();
```

3. **Create indexes:**
```bash
python manage.py migrate
python manage.py shell
```

```python
from analytics.models import ToolUsage
from django.db import connection
cursor = connection.cursor()
cursor.execute("CREATE INDEX idx_tool_usage_created_at ON analytics_toolusage(created_at DESC)")
cursor.execute("CREATE INDEX idx_tool_usage_tool_slug ON analytics_toolusage(tool_slug)")
```

## Environment Variables

### Backend (.env)

```bash
# Django
SECRET_KEY=your-very-secure-secret-key-here
DEBUG=False
ALLOWED_HOSTS=api.yourdevtools.com,yourdevtools.com

# Database
DB_NAME=developer_tools
DB_USER=devtools_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=https://yourdevtools.com,https://www.yourdevtools.com

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379/0
```

### Frontend (.env)

```bash
VITE_API_URL=https://api.yourdevtools.com/api
```

## Performance Optimizations

### Backend Caching

Update `settings.py`:

```python
# Redis caching
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}

# Cache tool responses
from django.views.decorators.cache import cache_page

# In views:
@cache_page(60 * 15)  # Cache for 15 minutes
def some_view(request):
    ...
```

### Database Connection Pooling

```python
# settings.py
DATABASES = {
    'default': {
        ...
        'CONN_MAX_AGE': 600,
        'OPTIONS': {
            'connect_timeout': 10,
        }
    }
}
```

### Frontend Optimizations

1. **Enable compression in Nginx:**
```nginx
gzip on;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

2. **Add CDN for static assets**

3. **Enable HTTP/2:**
```nginx
listen 443 ssl http2;
listen [::]:443 ssl http2;
```

## SSL/TLS Configuration

### Using Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdevtools.com -d www.yourdevtools.com
sudo certbot --nginx -d api.yourdevtools.com
```

### Auto-renewal

```bash
sudo certbot renew --dry-run
# Add to crontab
0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring

### Application Monitoring

1. **Install Sentry:**
```bash
pip install sentry-sdk
```

```python
# settings.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[DjangoIntegration()],
    traces_sample_rate=1.0,
    send_default_pii=True
)
```

2. **Health check endpoint:**
```python
# api/views/health.py
from django.http import JsonResponse
from django.db import connection

def health_check(request):
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        return JsonResponse({'status': 'healthy'})
    except Exception as e:
        return JsonResponse({'status': 'unhealthy', 'error': str(e)}, status=500)
```

### Server Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# System resource monitoring
htop

# Database monitoring
sudo apt install postgresql-contrib
```

### Log Management

```bash
# Configure logrotate
sudo nano /etc/logrotate.d/devtools
```

```
/var/log/devtools/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload devtools
    endscript
}
```

## Backup Strategy

### Database Backups

```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/var/backups/devtools"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="devtools_$DATE.sql.gz"

pg_dump -U devtools_user developer_tools | gzip > "$BACKUP_DIR/$FILENAME"

# Keep only last 30 days
find $BACKUP_DIR -name "devtools_*.sql.gz" -mtime +30 -delete
```

Add to crontab:
```bash
0 2 * * * /usr/local/bin/backup.sh
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Enable firewall (ufw)
- [ ] Configure fail2ban
- [ ] Set up SSL/TLS
- [ ] Enable HTTPS redirect
- [ ] Configure CORS properly
- [ ] Set secure SECRET_KEY
- [ ] Disable DEBUG in production
- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Set up rate limiting
- [ ] Configure CSP headers

## Troubleshooting

### Common Issues

1. **502 Bad Gateway:**
   - Check if Gunicorn is running: `systemctl status devtools`
   - Check socket file permissions
   - Review Nginx error logs: `tail -f /var/log/nginx/error.log`

2. **Static files not loading:**
   - Run `python manage.py collectstatic`
   - Check Nginx static files configuration
   - Verify file permissions

3. **Database connection errors:**
   - Check PostgreSQL is running: `systemctl status postgresql`
   - Verify database credentials
   - Check connection limits: `SHOW max_connections;`

4. **High memory usage:**
   - Reduce Gunicorn workers
   - Enable database connection pooling
   - Implement caching

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer Setup (Nginx):**
```nginx
upstream backend {
    least_conn;
    server backend1.local:8000;
    server backend2.local:8000;
    server backend3.local:8000;
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```

2. **Session Management:**
   - Use database sessions or Redis
   - Configure session affinity if needed

3. **Static Assets:**
   - Use CDN (Cloudflare, AWS CloudFront)
   - Enable caching headers

### Database Scaling

- Read replicas for analytics
- Connection pooling (PgBouncer)
- Partitioning for large tables

## Support

For deployment issues:
- Check logs: `journalctl -u devtools -f`
- Review documentation
- Open GitHub issue

---

**Last Updated:** November 2025
