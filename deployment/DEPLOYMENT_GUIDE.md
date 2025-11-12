# Production Deployment Guide

This guide provides step-by-step instructions for deploying the Developer Tools Platform to a production server.

## Prerequisites

- Ubuntu 20.04 LTS or newer (or similar Linux distribution)
- Root or sudo access
- Domain name pointed to your server
- At least 2GB RAM and 20GB disk space

## 1. System Preparation

### Update system packages

```bash
sudo apt update && sudo apt upgrade -y
```

### Install required packages

```bash
sudo apt install -y \
    python3.11 \
    python3.11-venv \
    python3-pip \
    postgresql \
    postgresql-contrib \
    nginx \
    git \
    supervisor \
    certbot \
    python3-certbot-nginx \
    nodejs \
    npm
```

## 2. Database Setup

### Create PostgreSQL database and user

```bash
sudo -u postgres psql
```

In the PostgreSQL shell:

```sql
CREATE DATABASE developer_tools;
CREATE USER developer_tools_user WITH PASSWORD 'your_secure_password';
ALTER ROLE developer_tools_user SET client_encoding TO 'utf8';
ALTER ROLE developer_tools_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE developer_tools_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE developer_tools TO developer_tools_user;
\q
```

## 3. Application Setup

### Create application directory

```bash
sudo mkdir -p /var/www/developer_tools
sudo chown -R $USER:$USER /var/www/developer_tools
```

### Clone repository

```bash
cd /var/www/developer_tools
git clone <your-repo-url> .
```

### Create Python virtual environment

```bash
cd /var/www/developer_tools/backend
python3.11 -m venv /var/www/developer_tools/venv
source /var/www/developer_tools/venv/bin/activate
```

### Install Python dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

## 4. Environment Configuration

### Create .env file

```bash
cd /var/www/developer_tools
cp .env.example .env
nano .env
```

Configure the following variables:

```bash
# REQUIRED - Generate a strong secret key
SECRET_KEY=$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')

# Set to False for production
DEBUG=False

# Your domain name
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database configuration
DB_NAME=developer_tools
DB_USER=developer_tools_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432

# CORS configuration
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Run Django migrations

```bash
cd /var/www/developer_tools/backend
source /var/www/developer_tools/venv/bin/activate
python manage.py migrate
python manage.py collectstatic --no-input
```

### Create Django superuser

```bash
python manage.py createsuperuser
```

## 5. Frontend Build

### Install Node.js dependencies

```bash
cd /var/www/developer_tools/frontend
npm install
```

### Build for production

```bash
npm run build
```

The built files will be in `frontend/dist/`.

## 6. Systemd Service Setup

### Copy service file

```bash
sudo cp /var/www/developer_tools/deployment/developer-tools.service /etc/systemd/system/
```

### Create log directory

```bash
sudo mkdir -p /var/log/developer_tools
sudo chown www-data:www-data /var/log/developer_tools
```

### Change application ownership

```bash
sudo chown -R www-data:www-data /var/www/developer_tools
```

### Enable and start service

```bash
sudo systemctl daemon-reload
sudo systemctl enable developer-tools
sudo systemctl start developer-tools
sudo systemctl status developer-tools
```

## 7. Nginx Configuration

### Copy nginx configuration

```bash
sudo cp /var/www/developer_tools/deployment/nginx.conf /etc/nginx/sites-available/developer-tools
```

### Edit configuration

```bash
sudo nano /etc/nginx/sites-available/developer-tools
```

Replace `yourdomain.com` with your actual domain name.

### Enable site

```bash
sudo ln -s /etc/nginx/sites-available/developer-tools /etc/nginx/sites-enabled/
sudo nginx -t
```

If the test passes:

```bash
sudo systemctl restart nginx
```

## 8. SSL Certificate Setup

### Obtain Let's Encrypt certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts to:
- Enter your email address
- Agree to Terms of Service
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### Auto-renewal

Certbot automatically creates a renewal cron job. Test it with:

```bash
sudo certbot renew --dry-run
```

## 9. Firewall Configuration

### Enable UFW firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

## 10. Verification

### Check all services are running

```bash
sudo systemctl status developer-tools
sudo systemctl status nginx
sudo systemctl status postgresql
```

### Test the application

1. Visit `https://yourdomain.com` - Frontend should load
2. Visit `https://yourdomain.com/admin` - Django admin should be accessible
3. Test a few tools to ensure API is working

### Check logs

```bash
# Application logs
sudo journalctl -u developer-tools -f

# Nginx logs
sudo tail -f /var/log/nginx/developer_tools_access.log
sudo tail -f /var/log/nginx/developer_tools_error.log

# Django logs
sudo tail -f /var/www/developer_tools/backend/logs/django.log
```

## 11. Post-Deployment Security

### Follow the security checklist in SECURITY.md

- [ ] Verify DEBUG=False
- [ ] Confirm strong SECRET_KEY is set
- [ ] Ensure database password is strong
- [ ] Verify HTTPS is working
- [ ] Check all security headers
- [ ] Review firewall rules
- [ ] Set up monitoring
- [ ] Configure backups

### Set up database backups

Create a backup script:

```bash
sudo nano /usr/local/bin/backup-developer-tools.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/developer_tools"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
sudo -u postgres pg_dump developer_tools | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make it executable:

```bash
sudo chmod +x /usr/local/bin/backup-developer-tools.sh
```

Add to crontab (daily at 2 AM):

```bash
sudo crontab -e
```

Add line:

```
0 2 * * * /usr/local/bin/backup-developer-tools.sh >> /var/log/developer_tools/backup.log 2>&1
```

## 12. Monitoring Setup

### Install monitoring tools (optional but recommended)

```bash
# For system monitoring
sudo apt install -y htop iotop netdata

# For log monitoring
sudo apt install -y logwatch
```

### Configure log rotation

Create logrotate config:

```bash
sudo nano /etc/logrotate.d/developer-tools
```

Add:

```
/var/log/developer_tools/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload developer-tools > /dev/null 2>&1 || true
    endscript
}
```

## 13. Maintenance

### Update application

```bash
cd /var/www/developer_tools
git pull origin main

# Backend updates
cd backend
source /var/www/developer_tools/venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --no-input

# Frontend updates
cd ../frontend
npm install
npm run build

# Restart services
sudo systemctl restart developer-tools
sudo systemctl reload nginx
```

### Monitor logs for issues

```bash
# Watch application logs in real-time
sudo journalctl -u developer-tools -f

# Check for errors
sudo journalctl -u developer-tools --since today | grep ERROR
```

### Database maintenance

```bash
# Vacuum database (monthly)
sudo -u postgres psql developer_tools -c "VACUUM ANALYZE;"
```

## Troubleshooting

### Service won't start

```bash
# Check service status
sudo systemctl status developer-tools

# View detailed logs
sudo journalctl -u developer-tools -n 50
```

### 502 Bad Gateway

- Check if gunicorn is running: `sudo systemctl status developer-tools`
- Verify socket file exists: `ls -la /run/developer_tools.sock`
- Check nginx error logs: `sudo tail -f /var/log/nginx/developer_tools_error.log`

### Database connection errors

- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check database credentials in `.env`
- Test database connection: `sudo -u postgres psql developer_tools`

### Static files not loading

```bash
cd /var/www/developer_tools/backend
source /var/www/developer_tools/venv/bin/activate
python manage.py collectstatic --no-input
sudo systemctl restart nginx
```

## Performance Tuning

### Gunicorn workers

Recommended formula: `(2 x CPU_CORES) + 1`

Edit `/etc/systemd/system/developer-tools.service` and adjust `--workers` parameter.

### Database connection pooling

Consider adding `pgbouncer` for connection pooling:

```bash
sudo apt install -y pgbouncer
```

### Caching (optional)

Install Redis for caching:

```bash
sudo apt install -y redis-server
pip install django-redis
```

Add to Django settings and restart service.

## Support

For issues or questions:
- Check logs first
- Review SECURITY.md for security-related issues
- Check the GitHub repository issues

## License

See LICENSE file in the repository.
