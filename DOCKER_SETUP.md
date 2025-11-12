# Docker Setup Guide

This guide explains how to run the Developer Tools Platform using Docker.

## Prerequisites

- Docker (20.10 or higher)
- Docker Compose (2.0 or higher)

## Quick Start

1. **Copy environment file**
   ```bash
   cp .env.docker .env
   ```

2. **Build and start all services**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin

## Services

The Docker setup includes three main services:

### 1. PostgreSQL Database (db)
- Port: 5432
- Database: developer_tools
- User: postgres
- Password: postgres (change in production!)

### 2. Django Backend (backend)
- Port: 8000
- Runs with Gunicorn
- Auto-migrates database on startup
- Collects static files automatically

### 3. React Frontend (frontend)
- Port: 3000 (mapped to container port 80)
- Built with Vite
- Served with Nginx

## Common Commands

### Start services
```bash
# Start in foreground
docker-compose up

# Start in background (detached)
docker-compose up -d

# Rebuild and start
docker-compose up --build
```

### Stop services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database!)
docker-compose down -v
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Execute commands in containers

**Django management commands:**
```bash
# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Run migrations
docker-compose exec backend python manage.py migrate

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput

# Django shell
docker-compose exec backend python manage.py shell
```

**Database access:**
```bash
# Connect to PostgreSQL
docker-compose exec db psql -U postgres -d developer_tools

# Backup database
docker-compose exec db pg_dump -U postgres developer_tools > backup.sql

# Restore database
docker-compose exec -T db psql -U postgres developer_tools < backup.sql
```

**Frontend development:**
```bash
# Install new npm package
docker-compose exec frontend npm install <package-name>

# Run npm commands
docker-compose exec frontend npm run <script>
```

## Environment Variables

Edit `.env` file to customize:

### Backend Variables
- `DEBUG` - Enable/disable debug mode (default: True)
- `SECRET_KEY` - Django secret key (CHANGE IN PRODUCTION!)
- `ALLOWED_HOSTS` - Comma-separated list of allowed hosts
- `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Database credentials

### Frontend Variables
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_ADSENSE_*` - AdSense configuration (optional)

## Development Workflow

### Making Code Changes

**Backend changes:**
1. Edit Python files in `./backend/`
2. Changes are auto-reloaded (if DEBUG=True)
3. For new dependencies: rebuild with `docker-compose up --build backend`

**Frontend changes:**
1. Edit files in `./frontend/src/`
2. Rebuild frontend: `docker-compose up --build frontend`
3. Or run frontend locally for faster development:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Database Management

**Reset database:**
```bash
# WARNING: This deletes all data!
docker-compose down -v
docker-compose up -d db
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

**View database data:**
```bash
docker-compose exec db psql -U postgres -d developer_tools
# Then run SQL queries
SELECT * FROM tools_tool;
\dt  # List tables
\q   # Quit
```

## Production Deployment

For production deployment:

1. **Update environment variables:**
   ```bash
   DEBUG=False
   SECRET_KEY=<generate-strong-secret-key>
   ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   DB_PASSWORD=<strong-database-password>
   ```

2. **Use production nginx (optional):**
   ```bash
   docker-compose --profile production up -d
   ```

3. **Enable HTTPS:**
   - Configure SSL certificates
   - Update nginx configuration
   - See `deployment/nginx.conf` for production config

## Troubleshooting

### Port already in use
```bash
# Check what's using the port
lsof -i :8000  # Backend
lsof -i :3000  # Frontend
lsof -i :5432  # Database

# Stop the conflicting service or change port in docker-compose.yml
```

### Database connection errors
```bash
# Check if database is healthy
docker-compose ps

# Restart database
docker-compose restart db

# View database logs
docker-compose logs db
```

### Frontend build errors
```bash
# Clear build cache
docker-compose build --no-cache frontend

# Check frontend logs
docker-compose logs frontend
```

### Backend migration errors
```bash
# Reset migrations (WARNING: deletes data!)
docker-compose down -v
docker-compose up -d db
docker-compose exec backend python manage.py migrate
```

## File Persistence

Data is persisted in Docker volumes:

- `developer_tools_postgres_data` - Database data
- `developer_tools_static` - Django static files
- `developer_tools_media` - User uploaded files
- `developer_tools_logs` - Application logs

**View volumes:**
```bash
docker volume ls | grep developer_tools
```

**Backup volumes:**
```bash
# Database backup
docker run --rm -v developer_tools_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/db_backup.tar.gz /data

# Restore from backup
docker run --rm -v developer_tools_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/db_backup.tar.gz -C /
```

## Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# Test endpoints
curl http://localhost:8000/api/  # Backend API
curl http://localhost:3000/health  # Frontend health
```

## Performance Tips

1. **Use volumes for development** - Already configured in docker-compose.yml
2. **Limit container resources** - Add resource limits in docker-compose.yml
3. **Use multi-stage builds** - Already implemented in Dockerfiles
4. **Cache dependencies** - Already optimized in Dockerfiles

## Security Notes

⚠️ **IMPORTANT for Production:**

1. Change `SECRET_KEY` to a strong random value
2. Set `DEBUG=False`
3. Use strong database passwords
4. Configure proper `ALLOWED_HOSTS`
5. Enable HTTPS with SSL certificates
6. Regular security updates: `docker-compose pull && docker-compose up -d`
7. Use Docker secrets for sensitive data
8. Implement rate limiting (already configured in backend)

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/)
- Project Documentation: `ADSENSE_SETUP.md`, `REVENUE_MAXIMIZATION.md`, `SECURITY.md`

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Restart services: `docker-compose restart`
- Rebuild from scratch: `docker-compose down -v && docker-compose up --build`
