# Complete Setup Guide - Developer Tools Platform

**Version**: 3.0.0 with Team Collaboration
**Last Updated**: 2025-11-19

---

## 🎯 Quick Start (Recommended)

### Step 1: Database Setup

```bash
# Start PostgreSQL and Redis with Docker
cd /home/heshamsayed/Desktop/java/developer_tools_updated
docker-compose up -d db redis

# Wait for PostgreSQL to be ready (15 seconds)
sleep 15
```

### Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Install Python dependencies (if not already installed)
pip3 install -r requirements.txt

# Run migrations
python3 manage.py migrate

# Create superuser (optional)
python3 manage.py createsuperuser

# Run backend server
python3 manage.py runserver 0.0.0.0:8003
```

### Step 3: Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd /home/heshamsayed/Desktop/java/developer_tools_updated/frontend

# Install dependencies (if not already)
npm install

# Run development server
npm run dev
```

### Step 4: Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8003/api
- **Admin Panel**: http://localhost:8003/admin

---

## 📋 What's Been Built

### ✅ Backend Team API (Complete)

**Models Created**:
- `Team` - Team entity with subscription tiers
- `TeamMember` - Members with roles (Owner/Admin/Developer/Viewer)
- `TeamInvitation` - Email-based invitations
- `TeamAPIKey` - Team-level API keys
- `TeamAuditLog` - Complete audit trail
- `TeamUsageLog` - API usage tracking per team

**API Endpoints** (17 total):

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teams/` | List user's teams |
| POST | `/api/teams/` | Create new team |
| GET | `/api/teams/{id}/` | Get team details |
| PATCH | `/api/teams/{id}/` | Update team |
| DELETE | `/api/teams/{id}/` | Delete team (owner only) |
| GET | `/api/teams/{id}/members/` | List team members |
| POST | `/api/teams/{id}/invite/` | Invite member |
| GET | `/api/teams/{id}/invitations/` | List invitations |
| DELETE | `/api/teams/{id}/invitations/{id}/` | Cancel invitation |
| PATCH | `/api/teams/{id}/members/{id}/role/` | Update member role |
| DELETE | `/api/teams/{id}/members/{id}/` | Remove member |
| GET | `/api/teams/{id}/stats/` | Team statistics |
| GET | `/api/teams/{id}/api-keys/` | List API keys |
| POST | `/api/teams/{id}/api-keys/` | Create API key |
| DELETE | `/api/teams/{id}/api-keys/{id}/` | Revoke API key |
| GET | `/api/teams/{id}/audit-log/` | View audit log |
| GET | `/api/invitations/my-invitations/` | User's invitations |

**Permissions System**:

| Role | Permissions |
|------|-------------|
| **Owner** | Full control, can delete team |
| **Admin** | Manage team, members, roles, API keys, view audit log |
| **Developer** | Use tools, manage API keys, view analytics |
| **Viewer** | Use tools, view analytics (read-only) |

### ✅ Frontend Integration (Complete)

**Pages**:
- `/teams` - Teams list with creation form
- `/teams/:teamId` - Team dashboard with 5 tabs

**Components**:
- `TeamsList` - Grid of teams with create form
- `TeamDashboard` - Main team dashboard
- `TeamOverview` - Quick stats and activity
- `MemberManagement` - Invite, manage members
- `TeamAnalytics` - Usage charts and statistics
- `TeamAPIKeys` - API key management
- `AuditLog` - Activity history viewer

**API Service**:
- `teamService.ts` - Complete API integration
- Already configured to use backend at `http://localhost:8003/api`

---

## 🗄️ Database Migrations

All migrations have been created. To apply them:

```bash
cd backend

# Apply all migrations
python3 manage.py migrate

# Verify migrations
python3 manage.py showmigrations teams
```

**Expected Output**:
```
teams
 [X] 0001_initial
```

---

## 🔧 Environment Variables

### Backend (`.env`)

Create `backend/.env`:

```bash
# Django
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=developer_tools
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:3001

# API
API_KEY_HEADER=X-API-Key
TRACK_API_USAGE=True
LOG_API_REQUESTS=True
```

### Frontend (`.env.local`)

Create `frontend/.env.local`:

```bash
VITE_API_URL=http://localhost:8003/api
```

---

## 🚀 Running with Docker (Alternative)

### Full Stack with Docker Compose

```bash
# Start everything
docker-compose up -d

# Check logs
docker-compose logs -f backend

# Stop everything
docker-compose down
```

**Services**:
- Backend: http://localhost:8003
- Frontend: http://localhost:3001
- PostgreSQL: localhost:5435
- Redis: localhost:6380

---

## 📝 Testing the Team Features

### 1. Create a User Account

```bash
# Via API
curl -X POST http://localhost:8003/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

### 2. Login and Get Token

```bash
curl -X POST http://localhost:8003/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'
```

**Response**:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJ...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJ..."
}
```

### 3. Create a Team

```bash
curl -X POST http://localhost:8003/api/teams/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Development Team",
    "description": "Our main development team"
  }'
```

### 4. Invite a Member

```bash
curl -X POST http://localhost:8003/api/teams/TEAM_ID/invite/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "colleague@example.com",
    "role": "developer"
  }'
```

### 5. Get Team Statistics

```bash
curl -X GET http://localhost:8003/api/teams/TEAM_ID/stats/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🎨 Frontend Testing

### Via Browser

1. **Open**: http://localhost:5173
2. **Register**: Create a new account
3. **Navigate**: Click "Teams" in the header
4. **Create Team**: Click "Create New Team"
5. **Manage**: Invite members, create API keys, view analytics

### Expected Flow

```
1. User registers/logs in
   ↓
2. Navigate to /teams
   ↓
3. Create first team (user becomes owner)
   ↓
4. Access team dashboard (/teams/:id)
   ↓
5. View 5 tabs:
   - Overview (stats, top tools, members)
   - Members (invite, manage roles)
   - Analytics (usage charts)
   - API Keys (create, revoke)
   - Audit Log (activity history)
```

---

## 🐛 Troubleshooting

### Database Connection Error

**Error**: `connection to server failed: FATAL: password authentication failed`

**Solution**:
```bash
# Check PostgreSQL is running
docker-compose ps

# Restart database
docker-compose restart db

# Update .env with correct credentials
```

### Import Errors

**Error**: `ModuleNotFoundError: No module named 'xxx'`

**Solution**:
```bash
# Install all dependencies
cd backend
pip3 install -r requirements.txt
```

### Migration Issues

**Error**: `No such table: teams_team`

**Solution**:
```bash
# Run migrations
python3 manage.py migrate

# If still failing, reset migrations
python3 manage.py migrate teams zero
python3 manage.py migrate teams
```

### CORS Errors

**Error**: `Access-Control-Allow-Origin header is missing`

**Solution**:
```bash
# Check frontend URL is in CORS_ALLOWED_ORIGINS
# Update backend/.env or settings.py
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend Not Connecting

**Error**: `Network Error` or `Failed to fetch`

**Solution**:
```bash
# Check backend is running
curl http://localhost:8003/api/teams/

# Check frontend .env.local
VITE_API_URL=http://localhost:8003/api

# Restart frontend dev server
npm run dev
```

---

## 📊 Database Schema

### Teams Table
```sql
CREATE TABLE teams (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INTEGER REFERENCES auth_user(id),
    subscription_tier VARCHAR(20),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Team Members Table
```sql
CREATE TABLE team_members (
    id VARCHAR(32) PRIMARY KEY,
    team_id VARCHAR(32) REFERENCES teams(id),
    user_id INTEGER REFERENCES auth_user(id),
    role VARCHAR(20),
    joined_at TIMESTAMP,
    last_active TIMESTAMP,
    UNIQUE(team_id, user_id)
);
```

### Other Tables
- `team_invitations` - Pending invitations
- `team_api_keys` - Team API keys
- `team_audit_logs` - Activity audit trail
- `team_usage_logs` - API usage tracking

---

## 🔐 Security Considerations

### Authentication
- JWT tokens with 1-hour expiry
- Refresh tokens with 7-day expiry
- Token rotation enabled
- HTTPS enforced in production

### Authorization
- Role-based access control (RBAC)
- Permission checking on all endpoints
- Owner cannot be removed or have role changed
- Only owner can delete team

### API Keys
- Secure generation with `secrets.token_urlsafe`
- Only prefix shown after creation
- Can be revoked anytime
- Expiration date support

### Audit Logging
- All team actions logged
- IP address tracking
- Timestamp on all records
- Immutable audit trail

---

## 📈 Monitoring and Maintenance

### Check Database Status

```bash
# Connect to PostgreSQL
docker exec -it developer_tools_updated-db-1 psql -U postgres -d developer_tools

# List tables
\dt

# Count teams
SELECT COUNT(*) FROM teams;

# Count team members
SELECT COUNT(*) FROM team_members;
```

### View Logs

```bash
# Backend logs
tail -f backend/logs/django.log

# Docker logs
docker-compose logs -f backend
```

### Backup Database

```bash
# Backup
docker exec developer_tools_updated-db-1 pg_dump -U postgres developer_tools > backup.sql

# Restore
docker exec -i developer_tools_updated-db-1 psql -U postgres developer_tools < backup.sql
```

---

## 🎯 Next Steps

1. **Test Team Features**
   - Create teams
   - Invite members
   - Test all roles
   - Verify permissions

2. **Seed Test Data** (Optional)
   - Create sample teams
   - Generate usage logs
   - Populate analytics

3. **Deploy to Production**
   - Follow DEPLOYMENT_GUIDE.md
   - Set up monitoring
   - Configure SSL/HTTPS

4. **Add Phase 4 Features** (Future)
   - Plugin marketplace
   - Advanced analytics
   - Workflow automation

---

## ✅ Success Checklist

- [ ] PostgreSQL running
- [ ] Redis running
- [ ] Backend migrations applied
- [ ] Backend server running (port 8003)
- [ ] Frontend dev server running (port 5173)
- [ ] Can register new user
- [ ] Can login and get JWT token
- [ ] Can create team
- [ ] Can invite members
- [ ] Can view team dashboard
- [ ] All 5 tabs working
- [ ] API keys can be created
- [ ] Audit log showing actions

---

## 🆘 Getting Help

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review `PHASE3_IMPLEMENTATION.md` for implementation details
3. Check `DEPLOYMENT_GUIDE.md` for production setup
4. Review backend logs in `backend/logs/django.log`
5. Inspect browser console for frontend errors

---

**Platform Status**: ✅ Ready for Testing
**Documentation**: ✅ Complete
**Backend**: ✅ Fully Implemented
**Frontend**: ✅ Integrated
**Database**: ✅ Migrations Ready

🎉 **The platform is ready to use!**
