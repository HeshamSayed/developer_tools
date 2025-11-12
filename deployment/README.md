# Deployment Configuration Files

This directory contains all configuration files and guides needed for production deployment of the Developer Tools Platform.

## Files Overview

### 1. DEPLOYMENT_GUIDE.md
**Comprehensive step-by-step deployment guide** covering:
- System preparation and package installation
- Database setup and configuration
- Application deployment
- SSL certificate setup
- Security hardening
- Monitoring and maintenance
- Troubleshooting

**Start here** if you're deploying the application for the first time.

### 2. developer-tools.service
**Systemd service file** for running the Django backend with Gunicorn.

**Features:**
- Automatic restart on failure
- Proper logging configuration
- Security hardening (NoNewPrivileges, PrivateTmp, etc.)
- 4 worker processes for handling concurrent requests

**Installation:**
```bash
sudo cp developer-tools.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable developer-tools
sudo systemctl start developer-tools
```

### 3. nginx.conf
**Nginx reverse proxy configuration** for serving the application.

**Features:**
- HTTP to HTTPS redirect
- SSL/TLS configuration with modern ciphers
- Security headers
- Static file serving with caching
- API reverse proxy to Gunicorn
- Upload size limits

**Installation:**
```bash
sudo cp nginx.conf /etc/nginx/sites-available/developer-tools
# Edit the file to replace 'yourdomain.com' with your actual domain
sudo nano /etc/nginx/sites-available/developer-tools
sudo ln -s /etc/nginx/sites-available/developer-tools /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Quick Start

1. **Read** the DEPLOYMENT_GUIDE.md from start to finish
2. **Prepare** your server with required packages
3. **Configure** your environment variables (see ../.env.example)
4. **Deploy** the application following the guide
5. **Secure** your deployment using the security checklist in ../SECURITY.md
6. **Monitor** logs and set up backups

## Prerequisites

Before deploying, ensure you have:

- [ ] Linux server (Ubuntu 20.04 LTS or newer recommended)
- [ ] Root or sudo access
- [ ] Domain name pointed to your server
- [ ] At least 2GB RAM and 20GB disk space
- [ ] Basic knowledge of Linux system administration

## Security Considerations

**IMPORTANT:** Before deploying to production:

1. Review and complete the checklist in `../SECURITY.md`
2. Set `DEBUG=False` in your `.env` file
3. Generate a strong `SECRET_KEY` (at least 50 characters)
4. Use strong database passwords
5. Enable HTTPS with Let's Encrypt
6. Configure firewall rules
7. Set up regular backups
8. Monitor logs for suspicious activity

## Architecture Overview

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────┐
│    Nginx    │  (Reverse Proxy + Static Files)
└──────┬──────┘
       │
       ├─────► /static/ ──► Django Static Files
       ├─────► /        ──► React Frontend (SPA)
       └─────► /api/    ──► Gunicorn + Django REST API
                              │
                              ▼
                        ┌──────────────┐
                        │ PostgreSQL   │
                        └──────────────┘
```

## System Requirements

### Minimum
- 2 CPU cores
- 2GB RAM
- 20GB disk space
- Ubuntu 20.04 LTS or newer

### Recommended
- 4 CPU cores
- 4GB RAM
- 40GB SSD storage
- Ubuntu 22.04 LTS

### Network
- Public IP address
- Domain name with A/AAAA records
- Ports 80 and 443 accessible

## Technology Stack

**Backend:**
- Django 5.0.1
- Django REST Framework 3.14.0
- Gunicorn 21.2.0
- PostgreSQL 12+

**Frontend:**
- React 18
- TypeScript
- Vite
- TailwindCSS

**Infrastructure:**
- Nginx 1.18+
- Systemd
- Let's Encrypt (Certbot)
- UFW Firewall

## Maintenance

### Regular Tasks

**Daily:**
- Monitor system resources
- Review error logs

**Weekly:**
- Check for security updates
- Review access logs

**Monthly:**
- Update dependencies
- Database vacuum
- Review and test backups

### Update Procedure

```bash
# 1. Backup database
sudo -u postgres pg_dump developer_tools > backup.sql

# 2. Pull latest code
cd /var/www/developer_tools
git pull

# 3. Update backend
cd backend
source ../venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --no-input

# 4. Update frontend
cd ../frontend
npm install
npm run build

# 5. Restart services
sudo systemctl restart developer-tools
sudo systemctl reload nginx
```

## Monitoring

### Service Status

```bash
# Check all services
sudo systemctl status developer-tools
sudo systemctl status nginx
sudo systemctl status postgresql
```

### Logs

```bash
# Application logs (real-time)
sudo journalctl -u developer-tools -f

# Application logs (last 100 lines)
sudo journalctl -u developer-tools -n 100

# Nginx access logs
sudo tail -f /var/log/nginx/developer_tools_access.log

# Nginx error logs
sudo tail -f /var/log/nginx/developer_tools_error.log

# Django logs
sudo tail -f /var/www/developer_tools/backend/logs/django.log
```

### Performance Monitoring

```bash
# System resources
htop

# Disk usage
df -h

# Database connections
sudo -u postgres psql developer_tools -c "SELECT count(*) FROM pg_stat_activity;"
```

## Troubleshooting

See the **Troubleshooting** section in DEPLOYMENT_GUIDE.md for common issues and solutions.

### Quick Diagnostics

```bash
# Test database connection
sudo -u postgres psql developer_tools -c "SELECT 1;"

# Check if socket exists
ls -la /run/developer_tools.sock

# Test nginx configuration
sudo nginx -t

# Check application process
ps aux | grep gunicorn

# View recent errors
sudo journalctl -u developer-tools --since "1 hour ago" | grep ERROR
```

## Support

- **Documentation:** DEPLOYMENT_GUIDE.md, ../SECURITY.md
- **Logs:** Check system logs for detailed error information
- **GitHub:** Open an issue in the repository

## License

See LICENSE file in the main repository.
