# Setup Verification Guide

Quick guide to verify that all components are working correctly.

## 1. Backend Verification

### Check Django Installation
```bash
cd backend
python manage.py --version
# Should output: 5.0.1 or similar
```

### Check Installed Packages
```bash
pip list | grep -E "opencv|pandas|PyPDF2|black"
# Should show these packages if installed
```

### Test Django Apps
```bash
python manage.py check
# Should output: System check identified no issues (0 silenced).
```

### Test Database Connection
```bash
python manage.py migrate --dry-run
# Should show migration plan without errors
```

### Start Backend Server
```bash
python manage.py runserver 0.0.0.0:8000
```

**Expected Output:**
```
Starting development server at http://0.0.0.0:8000/
Quit the server with CONTROL-C.
```

### Test Backend Endpoints

**Health Check:**
```bash
curl http://localhost:8000/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-..."
}
```

## 2. Frontend Verification

### Check Node & npm
```bash
cd frontend
node --version  # Should be 18+ or 20+
npm --version   # Should be 9+ or 10+
```

### Install Dependencies
```bash
npm install
# Should complete without errors
```

### Check for TypeScript Errors
```bash
npm run type-check
# Or if not available:
npx tsc --noEmit
```

### Start Development Server
```bash
npm run dev
```

**Expected Output:**
```
VITE v5.4.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Test Frontend

1. Open browser: `http://localhost:5173`
2. Check that homepage loads
3. Navigate to any tool (e.g., JSON Formatter)
4. Verify tool works correctly
5. Check dark/light mode toggle
6. Verify ads are loading (if enabled in test mode)

## 3. Full Stack Integration Test

### Prerequisites
- Backend running on port 8000
- Frontend running on port 5173

### Test API Connection

**From Frontend Console (Browser DevTools):**
```javascript
// Test image tools API
fetch('http://localhost:8000/api/image-tools/resize/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    width: 100,
    height: 100
  })
})
.then(r => r.json())
.then(console.log)
```

**Expected Response:**
```json
{
  "success": true,
  "image": "base64-encoded-image...",
  "width": 100,
  "height": 100
}
```

### Test Backend API Service (TypeScript)

**Create test file:** `frontend/src/test-backend-api.ts`
```typescript
import { imageTools, dataTools, codeTools } from './services/backendApi'

// Test image tools
async function testImageTools() {
  const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

  const result = await imageTools.resize({
    image: testImage,
    width: 100,
    height: 100
  })

  console.log('Image resize test:', result.success ? 'PASS' : 'FAIL')
}

// Test data tools
async function testDataTools() {
  const result = await dataTools.statistics({
    data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  })

  console.log('Statistics test:', result.success ? 'PASS' : 'FAIL')
  console.log('Mean:', result.mean) // Should be 5.5
}

// Test code tools
async function testCodeTools() {
  const result = await codeTools.formatPython({
    code: 'def hello():print("hi")',
    formatter: 'black'
  })

  console.log('Code format test:', result.success ? 'PASS' : 'FAIL')
}

// Run all tests
Promise.all([testImageTools(), testDataTools(), testCodeTools()])
  .then(() => console.log('All tests completed!'))
  .catch(console.error)
```

## 4. Docker Verification

### Check Docker Compose
```bash
docker-compose --version
# Should output version 2.x or higher
```

### Start All Services
```bash
docker-compose up -d
```

**Expected Output:**
```
Creating developer_tools_db_1        ... done
Creating developer_tools_backend_1   ... done
Creating developer_tools_frontend_1  ... done
```

### Check Service Status
```bash
docker-compose ps
```

**All services should be "Up":**
```
Name                          State    Ports
----------------------------------------------------------------
developer_tools_backend_1    Up       0.0.0.0:8000->8000/tcp
developer_tools_db_1         Up       0.0.0.0:5433->5432/tcp
developer_tools_frontend_1   Up       0.0.0.0:3000->80/tcp
```

### Check Service Logs
```bash
# Backend logs
docker-compose logs backend

# Frontend logs
docker-compose logs frontend

# Database logs
docker-compose logs db
```

### Access Services
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Database: `localhost:5433` (PostgreSQL)

## 5. Common Issues & Solutions

### Issue: ModuleNotFoundError for Python packages
**Solution:**
```bash
cd backend
pip install -r requirements.txt
```

### Issue: CORS errors in browser console
**Solution:**
Check `CORS_ALLOWED_ORIGINS` in backend `.env`:
```bash
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Issue: Port already in use
**Solution:**
```bash
# Find process using port
lsof -i :8000  # or :5173

# Kill process
kill -9 <PID>
```

### Issue: Database connection refused
**Solution:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Or use SQLite for development (edit settings.py)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### Issue: npm install fails
**Solution:**
```bash
# Clear cache and retry
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 6. Performance Verification

### Backend Response Times
```bash
# Test endpoint speed
time curl -X POST http://localhost:8000/api/data-tools/statistics/ \
  -H "Content-Type: application/json" \
  -d '{"data": [1,2,3,4,5,6,7,8,9,10]}'
```

**Expected:** < 500ms for simple operations

### Frontend Load Time
Open browser DevTools > Network tab:
- Initial page load: < 2s
- Tool page load: < 500ms
- API calls: < 1s

## 7. Security Verification

### Check DEBUG Mode
**In production, DEBUG must be False:**
```bash
# backend/.env
DEBUG=False
```

### Check SECRET_KEY
**Never use default SECRET_KEY in production:**
```bash
# Generate new secret key
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Check CORS Configuration
**Only allow trusted origins:**
```bash
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## 8. Final Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Database connects successfully
- [ ] All Django apps are registered
- [ ] API endpoints respond correctly
- [ ] CORS is configured properly
- [ ] Environment variables are set
- [ ] TypeScript compiles without errors
- [ ] No console errors in browser
- [ ] Docker containers run successfully
- [ ] All tests pass
- [ ] Documentation is accessible

## Success!

If all checks pass, your Developer Tools platform is fully operational! 🎉

For more detailed information:
- Backend setup: `backend/README.md`
- Frontend-Backend integration: `INTEGRATION_GUIDE.md`
- Main project overview: `README.md`
