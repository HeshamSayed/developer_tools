# Developer Tools Platform - Tech Stack

## Overview

Full-stack developer tools platform with React frontend, Django backend, and microservices architecture.

---

## Frontend Stack

### Core Framework
- **React 18.3.1** - UI library with hooks and functional components
- **TypeScript 5.6.2** - Static typing for JavaScript
- **Vite 5.4.21** - Fast build tool and dev server

### Routing & State
- **React Router DOM 6.28.0** - Client-side routing with protected routes
- **React Context API** - State management (Auth, Notifications)
- **URL Search Params** - State persistence in URL

### UI & Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **PostCSS 8.4.49** - CSS processing
- **Autoprefixer 10.4.20** - Vendor prefix automation
- **React Icons 5.4.0** - Icon library (Feather Icons)

### HTTP & API
- **Axios 1.7.9** - HTTP client with interceptors
- **Axios Interceptors** - Request/response middleware for JWT auth

### Development Tools
- **ESLint 9.17.0** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **Vite TypeScript Plugin** - TypeScript support in Vite

### Build Output
- **Production Bundle**: 1.2 MB (274 KB gzipped)
- **Build Tool**: Vite with Rollup
- **Target**: ES2020

---

## Backend Stack

### Core Framework
- **Django 5.0.7** - Python web framework
- **Django REST Framework 3.15.2** - RESTful API toolkit
- **Python 3.11** - Programming language

### Database
- **PostgreSQL 15** - Primary database
  - Port: 5432 (container), 5435 (host)
  - Persistent volume storage
  - Healthcheck monitoring

### Caching & Sessions
- **Redis 7-alpine** - In-memory cache and session storage
  - Port: 6379 (container), 6380 (host)
  - Persistent volume storage

### Task Queue
- **Celery 5.4.0** - Distributed task queue
- **RabbitMQ 3-management** - Message broker
  - AMQP Port: 5672 (container), 5673 (host)
  - Management UI: 15672 (container), 15673 (host)
- **Celery Beat** - Periodic task scheduler

### Authentication & Authorization
- **djangorestframework-simplejwt 5.3.1** - JWT authentication
- **Access Tokens** - Short-lived (configurable)
- **Refresh Tokens** - Long-lived token rotation
- **API Keys** - Alternative authentication method

### Web Server
- **Gunicorn 21.2.0** - WSGI HTTP server
  - Workers: 3 (sync)
  - Timeout: 120s
  - Port: 8000 (internal)

### API Documentation
- **drf-yasg 1.21.7** - Swagger/OpenAPI schema generation
- **Auto-generated docs** - Interactive API documentation

### Image & PDF Processing
- **Pillow 10.4.0** - Image processing library
- **PyPDF2** - PDF manipulation
- **python-magic 0.4.27** - File type detection

### Data Processing
- **pandas** - Data analysis and manipulation
- **openpyxl** - Excel file processing
- **python-dotenv 1.0.1** - Environment variable management

### Code Analysis
- **pylint** - Python code analysis
- **black** - Code formatter

### Mock Data Generation
- **Faker 26.0.0** - Fake data generator
  - Names, emails, addresses, phone numbers
  - UUIDs, timestamps, random integers
  - Custom template variable system

---

## Infrastructure & DevOps

### Containerization
- **Docker** - Container platform
- **Docker Compose** - Multi-container orchestration
- **Docker Networks** - Container networking

### Web Server (Production)
- **Nginx (Alpine)** - Reverse proxy and static file server
  - Frontend static files
  - Port: 80 (container), 3001 (host)

### Container Architecture
```
┌─────────────────────────────────────────┐
│          Docker Compose Network         │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │ Frontend │  │ Backend  │            │
│  │  (Nginx) │  │(Gunicorn)│            │
│  │  :3001   │  │  :8003   │            │
│  └──────────┘  └──────────┘            │
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │PostgreSQL│  │  Redis   │            │
│  │  :5435   │  │  :6380   │            │
│  └──────────┘  └──────────┘            │
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │ RabbitMQ │  │  Celery  │            │
│  │  :5673   │  │  Worker  │            │
│  └──────────┘  └──────────┘            │
│                                         │
└─────────────────────────────────────────┘
```

### Volumes (Persistent Storage)
- `developer_tools_postgres_data` - Database
- `developer_tools_redis_data` - Cache
- `developer_tools_rabbitmq_data` - Message queue
- `developer_tools_media` - User uploads
- `developer_tools_logs` - Application logs

---

## Application Architecture

### Frontend Architecture

```
src/
├── components/          # Reusable UI components
│   ├── Auth/           # Authentication components
│   ├── Common/         # Shared components
│   ├── Dashboard/      # Dashboard widgets
│   ├── Layout/         # Layout components (Header, Footer)
│   └── Settings/       # Settings components
│
├── contexts/           # React Context providers
│   ├── AuthContext     # Authentication state
│   └── NotificationContext # Toast notifications
│
├── pages/              # Route components
│   ├── Home/           # Landing page
│   ├── Login/          # Login page
│   ├── Register/       # Registration
│   ├── Dashboard/      # User dashboard
│   ├── Settings/       # Settings page
│   ├── MockAPI/        # Mock API workspace
│   └── ToolPage/       # Individual tool pages
│
├── services/           # API clients
│   ├── authService     # Authentication API
│   ├── mockAPIService  # Mock API service
│   └── teamService     # Team collaboration
│
├── types/              # TypeScript type definitions
│   ├── mockAPI.ts      # Mock API types
│   └── team.ts         # Team types
│
├── constants/          # App constants
│   ├── designSystem    # Design tokens
│   └── toolCategories  # Tool metadata
│
└── hooks/              # Custom React hooks
    └── useGlobalSearch # Search functionality
```

### Backend Architecture

```
backend/
├── core/               # Django project settings
│   ├── settings.py     # Configuration
│   ├── urls.py         # URL routing
│   └── wsgi.py         # WSGI application
│
├── authentication/     # User authentication
│   ├── models.py       # User, UserProfile
│   ├── views.py        # Login, Register, Profile
│   └── serializers.py  # DRF serializers
│
├── api_mocking/        # Mock API service
│   ├── models.py       # MockApp, MockEndpoint, etc.
│   ├── views.py        # CRUD operations
│   ├── serializers.py  # API serializers
│   ├── urls.py         # API routes
│   └── mock_engine.py  # Mock execution engine
│
├── teams/              # Team collaboration
│   ├── models.py       # Team, TeamMember
│   └── views.py        # Team management
│
├── api/                # Tool APIs
│   └── views/          # 117+ tool endpoints
│
├── image_tools/        # Image processing
├── pdf_tools/          # PDF manipulation
├── data_tools/         # Data conversion
└── code_tools/         # Code formatting
```

---

## API Architecture

### RESTful API Patterns
- **Django REST Framework ViewSets** - CRUD operations
- **Token Authentication** - JWT-based auth
- **Permissions** - Role-based access control
- **Pagination** - Cursor and page pagination
- **Filtering** - Query parameter filtering
- **Serialization** - JSON request/response

### API Endpoints Structure
```
/api/
├── auth/
│   ├── register/          POST
│   ├── login/             POST
│   ├── token/refresh/     POST
│   └── profile/           GET, PATCH
│
├── mock-api/
│   ├── apps/              GET, POST
│   ├── collections/       GET, POST
│   ├── endpoints/         GET, POST
│   ├── execute/{id}/      GET, POST, PUT, DELETE (public)
│   └── stats/             GET
│
├── teams/
│   ├── /                  GET, POST
│   ├── {id}/members/      GET, POST
│   ├── {id}/invite/       POST
│   └── {id}/api-keys/     GET, POST
│
└── tools/
    ├── base64/            POST
    ├── jwt/               POST
    ├── hash/              POST
    └── [117+ endpoints]
```

---

## Database Schema

### Key Models

#### Authentication
```python
User (Django built-in)
├── username
├── email
├── password (hashed)
└── is_active

UserProfile
├── user (FK)
├── subscription_tier
├── api_calls_today
├── api_calls_this_month
└── api_quota
```

#### Mock API
```python
MockApp
├── id (UUID)
├── user (FK)
├── name
├── description
├── icon
└── color

MockCollection
├── id (UUID)
├── app (FK)
├── name
└── order

MockEndpoint
├── id (UUID)
├── collection (FK)
├── name
├── path
├── method
├── status_code
├── response_body
├── content_type
├── latency_min
├── latency_max
└── error_rate

MockRequest (Logs)
├── endpoint (FK)
├── method
├── headers
├── query_params
├── response_time
└── created_at
```

#### Teams
```python
Team
├── id
├── name
├── created_by (FK User)
└── created_at

TeamMember
├── team (FK)
├── user (FK)
├── role (Owner/Admin/Developer/Viewer)
└── joined_at
```

---

## Development Tools

### Frontend Development
```bash
npm run dev          # Vite dev server (port 5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint
```

### Backend Development
```bash
python manage.py runserver      # Dev server
python manage.py migrate        # Run migrations
python manage.py createsuperuser # Admin user
python manage.py shell          # Django shell
python manage.py test           # Run tests
```

### Docker Commands
```bash
docker compose up -d            # Start all services
docker compose down             # Stop all services
docker compose logs backend     # View logs
docker compose build frontend   # Rebuild service
docker compose restart backend  # Restart service
```

---

## Performance & Optimization

### Frontend Optimization
- **Code Splitting** - Dynamic imports for routes
- **Tree Shaking** - Remove unused code
- **Minification** - CSS and JS minification
- **Gzip Compression** - Nginx gzip enabled
- **Asset Caching** - Browser cache headers
- **Bundle Size** - 274 KB gzipped

### Backend Optimization
- **Redis Caching** - Cache frequently accessed data
- **Database Indexing** - Indexed foreign keys and UUIDs
- **Query Optimization** - select_related, prefetch_related
- **API Rate Limiting** - Prevent abuse
- **Connection Pooling** - Database connection reuse

### Caching Strategy
```python
# Redis cache configuration
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://redis:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}
```

---

## Security Features

### Authentication Security
- **JWT Tokens** - Signed and time-limited
- **Password Hashing** - Django's PBKDF2
- **CORS Headers** - Configured origins
- **CSRF Protection** - Django CSRF middleware
- **SQL Injection Prevention** - ORM parameterized queries
- **XSS Prevention** - Template auto-escaping

### API Security
- **Rate Limiting** - Per-user request limits
- **Authentication Required** - Most endpoints protected
- **Permission Classes** - Role-based access
- **Input Validation** - DRF serializers
- **Secure Headers** - Security middleware

---

## Environment Configuration

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8003
```

### Backend (.env)
```bash
# Django
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://user:pass@db:5432/devtools

# Redis
REDIS_URL=redis://redis:6379/0

# Celery
CELERY_BROKER_URL=amqp://rabbitmq:5672
```

---

## Ports Summary

| Service | Container Port | Host Port | Purpose |
|---------|---------------|-----------|---------|
| Frontend (Nginx) | 80 | 3001 | Web UI |
| Backend (Gunicorn) | 8000 | 8003 | API Server |
| PostgreSQL | 5432 | 5435 | Database |
| Redis | 6379 | 6380 | Cache |
| RabbitMQ AMQP | 5672 | 5673 | Message Queue |
| RabbitMQ Management | 15672 | 15673 | Admin UI |

---

## Package Versions

### Frontend (package.json)
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.28.0",
  "axios": "^1.7.9",
  "tailwindcss": "^3.4.17",
  "vite": "^5.4.21",
  "typescript": "~5.6.2"
}
```

### Backend (requirements.txt)
```
Django==5.0.7
djangorestframework==3.15.2
djangorestframework-simplejwt==5.3.1
psycopg2-binary==2.9.9
redis==5.0.8
celery==5.4.0
gunicorn==21.2.0
Pillow==10.4.0
Faker==26.0.0
```

---

## Tech Stack Summary

### Language Distribution
- **Frontend**: TypeScript/JavaScript (100%)
- **Backend**: Python (100%)
- **Styling**: CSS (Tailwind)
- **Config**: YAML (Docker Compose)

### Total Lines of Code (Estimated)
- **Frontend**: ~15,000 lines (TypeScript/JSX)
- **Backend**: ~20,000 lines (Python)
- **Total**: ~35,000 lines

### Dependencies
- **Frontend NPM Packages**: ~50
- **Backend Python Packages**: ~40
- **Total Dependencies**: ~90

---

## Production Readiness

### ✅ Production Features
- Docker containerization
- Environment-based configuration
- Database migrations
- Static file serving (Nginx)
- API documentation
- Error logging
- Health checks
- Persistent volumes
- JWT authentication
- CORS configuration

### 🔄 Recommended Additions
- Monitoring (Prometheus/Grafana)
- Log aggregation (ELK stack)
- CI/CD pipeline (GitHub Actions)
- Automated testing (Jest, Pytest)
- SSL/TLS certificates (Let's Encrypt)
- CDN for static assets
- Database backups
- Load balancing (Nginx upstream)

---

## Conclusion

Modern, scalable tech stack with:
- ✅ Type-safe frontend (TypeScript + React)
- ✅ Robust backend (Django + DRF)
- ✅ Microservices architecture (Docker)
- ✅ Real-time capabilities (Celery + RabbitMQ)
- ✅ Production-ready infrastructure
- ✅ Developer-friendly tooling

**Perfect for:** SaaS applications, developer tools, API platforms, collaborative platforms
