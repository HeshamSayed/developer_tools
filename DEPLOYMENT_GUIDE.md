# Production Deployment Guide

## Overview

This guide covers deploying the Developer Tools Platform (Phase 1 + Phase 2) to production.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                  Production                      │
├─────────────────────────────────────────────────┤
│  Frontend (React + Vite)                        │
│  ├── Static files (Nginx/CDN)                   │
│  └── API calls to backend                       │
│                                                  │
│  Backend (Django + DRF)                         │
│  ├── API endpoints                              │
│  ├── Authentication                             │
│  └── Database (PostgreSQL)                      │
│                                                  │
│  Database (PostgreSQL)                          │
│  └── User data, usage logs, API keys           │
└─────────────────────────────────────────────────┘
```

---

## 📋 Pre-Deployment Checklist

### Frontend
- [x] Phase 1 complete (Navigation, Search, Tool Organization)
- [x] Phase 2 complete (Dashboard, Settings, Analytics)
- [x] Build passes without errors
- [x] TypeScript compilation successful
- [x] All components tested
- [x] Dark mode working
- [x] Mobile responsive

### Backend
- [ ] Django settings configured for production
- [ ] Database migrations up to date
- [ ] Static files configured
- [ ] CORS configured
- [ ] Rate limiting configured
- [ ] Monitoring setup

---

## 🚀 Deployment Options

### Option 1: Traditional VPS (DigitalOcean, Linode, AWS EC2)
**Best for:** Full control, custom configuration

### Option 2: Platform as a Service (Heroku, Railway, Render)
**Best for:** Quick deployment, managed infrastructure

### Option 3: Containerized (Docker + Docker Compose)
**Best for:** Consistent environments, easy scaling

### Option 4: Separate Hosting (Vercel + Backend)
**Best for:** Optimal performance, CDN benefits

**Recommended: Option 4** ⭐
- Frontend → Vercel (free tier, CDN, auto-deploy)
- Backend → Railway/Render (free tier available)
- Database → Managed PostgreSQL

---

## 📦 Production Build

### 1. Build Frontend
```bash
cd frontend
npm run build

# Output: dist/ folder with optimized files
# Size: ~242 KB gzipped
```

### 2. Environment Variables

Create `.env.production` files:

**Frontend (.env.production):**
```env
VITE_API_URL=https://api.yourplatform.com/api
VITE_APP_ENV=production
VITE_ENABLE_ANALYTICS=true
```

**Backend (.env):**
```env
DEBUG=False
SECRET_KEY=your-super-secret-key-here-change-this
ALLOWED_HOSTS=api.yourplatform.com,yourplatform.com
CORS_ALLOWED_ORIGINS=https://yourplatform.com,https://www.yourplatform.com

DATABASE_URL=postgresql://user:password@host:5432/dbname
REDIS_URL=redis://localhost:6379

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_STORAGE_BUCKET_NAME=your-bucket

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

---

## 🎯 Step-by-Step Deployment

### Option 4 (Recommended): Vercel + Railway

#### Step 1: Deploy Backend to Railway

1. **Create Railway Account**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login
   railway login
   ```

2. **Initialize Project**
   ```bash
   cd backend
   railway init
   ```

3. **Add PostgreSQL**
   ```bash
   railway add --plugin postgresql
   ```

4. **Configure Environment**
   ```bash
   # Set environment variables
   railway variables set DEBUG=False
   railway variables set SECRET_KEY=your-secret-key
   # ... add all other variables
   ```

5. **Deploy**
   ```bash
   railway up
   ```

6. **Run Migrations**
   ```bash
   railway run python manage.py migrate
   railway run python manage.py createsuperuser
   ```

#### Step 2: Deploy Frontend to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel

   # Follow prompts:
   # - Set up and deploy? Yes
   # - Link to existing project? No
   # - Project name: developer-tools-platform
   # - Directory: ./
   # - Override settings? No
   ```

3. **Configure Environment**
   ```bash
   vercel env add VITE_API_URL production
   # Enter: https://your-backend.up.railway.app/api
   ```

4. **Production Deploy**
   ```bash
   vercel --prod
   ```

---

## 🐳 Docker Deployment (Alternative)

### Docker Compose Setup

**docker-compose.prod.yml:**
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
      - "443:443"
    environment:
      - VITE_API_URL=${API_URL}
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DEBUG=False
      - SECRET_KEY=${SECRET_KEY}
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - db

  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=devtools
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}

volumes:
  postgres_data:
```

**Deploy:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔒 Security Configuration

### 1. Backend Security

**settings.py:**
```python
# Production settings
DEBUG = False
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# CORS
CORS_ALLOWED_ORIGINS = [
    "https://yourplatform.com",
    "https://www.yourplatform.com",
]

# Rate limiting
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour'
    }
}
```

### 2. Environment Secrets

**NEVER commit:**
- `.env` files
- Secret keys
- API credentials
- Database passwords

**Use:**
- Environment variables
- Secret management services
- `.env.example` for documentation

---

## 📊 Monitoring & Logging

### 1. Backend Monitoring

**Install Sentry:**
```bash
pip install sentry-sdk
```

**Configure:**
```python
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    traces_sample_rate=1.0,
    environment="production"
)
```

### 2. Frontend Monitoring

**Add to main.tsx:**
```typescript
if (import.meta.env.PROD) {
  // Initialize analytics
  // Initialize error tracking
}
```

### 3. Logging

**Backend:**
```python
LOGGING = {
    'version': 1,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/django/app.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
        },
    },
}
```

---

## 🔧 Performance Optimization

### Frontend
- [x] Code splitting
- [x] Minification
- [x] Gzip compression
- [x] Tree shaking
- [ ] Image optimization
- [ ] Lazy loading
- [ ] CDN for static assets

### Backend
- [ ] Database indexing
- [ ] Query optimization
- [ ] Redis caching
- [ ] API response caching
- [ ] Load balancing

---

## 📈 Post-Deployment

### 1. Health Checks

**Frontend:**
```bash
curl https://yourplatform.com
# Should return 200
```

**Backend:**
```bash
curl https://api.yourplatform.com/health/
# Should return {"status": "healthy"}
```

### 2. Test Critical Paths

- [ ] User registration
- [ ] User login
- [ ] Dashboard access
- [ ] Tool usage
- [ ] API key creation
- [ ] Settings update
- [ ] Data export

### 3. Monitor Metrics

- Response times
- Error rates
- User activity
- API usage
- Database performance

---

## 🔄 CI/CD Setup (Optional)

### GitHub Actions

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up --service backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 🌐 Custom Domain Setup

### Vercel (Frontend)
1. Go to Vercel dashboard
2. Project Settings → Domains
3. Add domain: `yourplatform.com`
4. Add DNS records (provided by Vercel)

### Railway (Backend)
1. Go to Railway dashboard
2. Project → Settings
3. Add custom domain: `api.yourplatform.com`
4. Add DNS records (provided by Railway)

**DNS Records:**
```
# Frontend
A     @           76.76.21.21
CNAME www         cname.vercel-dns.com

# Backend API
CNAME api         your-app.up.railway.app
```

---

## 🔐 SSL/HTTPS

Both Vercel and Railway provide **automatic HTTPS** with Let's Encrypt.

**Verify:**
```bash
curl -I https://yourplatform.com
# Should show: SSL certificate valid
```

---

## 📱 Production URLs

After deployment:

```
Frontend:  https://yourplatform.com
API:       https://api.yourplatform.com
Admin:     https://api.yourplatform.com/admin
Docs:      https://api.yourplatform.com/docs
```

---

## 🐛 Troubleshooting

### Issue: Frontend can't connect to API
**Solution:** Check CORS settings and API URL

### Issue: 404 on page refresh
**Solution:** Configure rewrites in Vercel
```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Issue: Database connection failed
**Solution:** Check DATABASE_URL and firewall rules

### Issue: Static files not loading
**Solution:** Run `collectstatic` and check STATIC_ROOT

---

## 💰 Cost Estimate

### Free Tier (Small Projects)
- **Vercel:** Free (100 GB bandwidth)
- **Railway:** $5/month (500 hours)
- **PostgreSQL:** Included
- **Total:** ~$5/month

### Paid Tier (Production)
- **Vercel Pro:** $20/month
- **Railway:** $10-50/month (usage-based)
- **PostgreSQL:** $10-20/month
- **Total:** ~$40-90/month

---

## ✅ Deployment Checklist

**Pre-Deploy:**
- [ ] All tests passing
- [ ] Build successful
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Security settings enabled

**Deploy:**
- [ ] Backend deployed
- [ ] Database migrated
- [ ] Frontend deployed
- [ ] Custom domains configured
- [ ] SSL certificates active

**Post-Deploy:**
- [ ] Health checks passing
- [ ] Critical paths tested
- [ ] Monitoring configured
- [ ] Logs accessible
- [ ] Backups configured

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

---

## 🎉 You're Ready!

Follow this guide to deploy Phase 1 + Phase 2 to production. After deployment, we'll start Phase 3!

**Next Steps:**
1. Choose deployment option
2. Set up accounts (Vercel, Railway)
3. Configure environment variables
4. Deploy!
5. Test production site
6. Start Phase 3 🚀
