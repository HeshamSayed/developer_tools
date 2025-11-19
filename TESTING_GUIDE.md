# Testing Guide - Developer Tools Platform

## 🧪 Frontend Testing (Manual)

### 1. Test User Registration
1. Open http://localhost:3001
2. Click "Sign Up" button in header
3. Fill in the form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `SecurePass123!`
   - Confirm Password: `SecurePass123!`
4. Click "Create Account"
5. ✅ Should redirect to Dashboard

### 2. Test Dashboard
After registration, you should see:
- ✅ User avatar with first initial
- ✅ Subscription tier badge (Free Plan)
- ✅ Usage statistics showing 0/10 daily, 0/100 monthly
- ✅ Progress bars for quotas
- ✅ "No activity yet" message
- ✅ API Key Management section

### 3. Test API Key Creation
1. In Dashboard, scroll to "API Keys" section
2. Click "Create New Key"
3. Enter name: `Test Key`
4. Click "Create"
5. ✅ Green alert showing the key (copy it!)
6. ✅ Key should appear in the list with:
   - Name: "Test Key"
   - Key prefix: first 8 chars
   - Status: Active
   - Created date
   - Total requests: 0

### 4. Test API Key Usage
```bash
# Replace YOUR_KEY with the key you just created
curl -X POST http://localhost:8003/api/tools/json/format \
  -H "X-API-Key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"input": "{\"name\":\"test\",\"value\":123}"}'
```

Expected response:
```json
{
  "success": true,
  "result": "{\n  \"name\": \"test\",\n  \"value\": 123\n}",
  "metadata": {
    "processing_time_ms": 0.08
  }
}
```

### 5. Test Usage Tracking
1. Refresh the Dashboard page
2. ✅ Daily usage should show: 1/10
3. ✅ Monthly usage should show: 1/100
4. ✅ Recent Activity should show your JSON format request with:
   - Tool name
   - Endpoint
   - Status code (200)
   - Response time
   - Cost
   - Timestamp

### 6. Test Logout
1. Click on user avatar in header
2. Click "Sign Out"
3. ✅ Should return to home page
4. ✅ Header should show "Sign In" and "Sign Up" buttons

### 7. Test Login
1. Click "Sign In" in header
2. Enter:
   - Username: `testuser`
   - Password: `SecurePass123!`
3. Click "Sign In"
4. ✅ Should redirect to Dashboard
5. ✅ All your previous data should be there

### 8. Test Protected Routes
1. While logged out, try to visit: http://localhost:3001/dashboard
2. ✅ Should redirect to login page
3. ✅ After login, should redirect back to dashboard

### 9. Test Mobile Responsiveness
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or similar
4. ✅ Header should show hamburger menu
5. ✅ Click menu, should show:
   - User info card (if logged in)
   - Home link
   - About link
   - Dashboard link (if logged in)
   - Sign Out button (if logged in)

### 10. Test Dark Mode
1. Click the sun/moon icon in header
2. ✅ Entire site should switch to dark theme
3. ✅ Preference should persist on refresh

---

## 🔧 Backend Testing (Automated)

### Run Full Test Suite
```bash
# From project root
/tmp/test_full_auth.sh
```

Should see:
- ✅ Registration successful
- ✅ Profile retrieved
- ✅ API key created
- ✅ Tool executed with API key
- ✅ Usage stats retrieved
- ✅ API keys listed

### Test Individual Endpoints

#### 1. Register User
```bash
curl -X POST http://localhost:8003/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "new@example.com",
    "password": "SecurePass123!",
    "password2": "SecurePass123!"
  }' | python3 -m json.tool
```

#### 2. Login
```bash
curl -X POST http://localhost:8003/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "SecurePass123!"
  }' | python3 -m json.tool
```

#### 3. Get Profile
```bash
# Replace TOKEN with access token from login
curl http://localhost:8003/api/auth/profile/ \
  -H "Authorization: Bearer TOKEN" | python3 -m json.tool
```

#### 4. Create API Key
```bash
curl -X POST http://localhost:8003/api/auth/api-keys/ \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My API Key"}' | python3 -m json.tool
```

#### 5. Get Usage Stats
```bash
curl http://localhost:8003/api/auth/usage/ \
  -H "Authorization: Bearer TOKEN" | python3 -m json.tool
```

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to connect to server"
**Solution**: Check if backend is running:
```bash
docker ps | grep backend
```
Restart if needed:
```bash
docker compose restart backend
```

### Issue: "Invalid token" or 401 errors
**Solution**: Token might be expired. Login again to get new token.

### Issue: Frontend showing old version
**Solution**: Hard refresh browser:
- Windows/Linux: Ctrl + Shift + R
- Mac: Cmd + Shift + R

### Issue: "Quota exceeded"
**Solution**: This is expected for Free tier (10 calls/day). Either:
1. Wait until tomorrow (quota resets daily)
2. Upgrade to Pro tier (future feature)
3. For testing, update user profile in Django admin

### Issue: Can't see dashboard
**Solution**: Make sure you're logged in. Check for:
- User avatar in header
- No "Sign In" button visible

---

## ✅ Checklist: Complete System Test

Use this checklist to verify everything works:

- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can see dashboard with stats
- [ ] Can create API key
- [ ] Can copy API key to clipboard
- [ ] Can use API key with tools
- [ ] Usage stats update after API call
- [ ] Recent activity shows API calls
- [ ] Can delete API key
- [ ] Can logout
- [ ] Can login again
- [ ] Protected routes redirect to login
- [ ] Dark mode toggle works
- [ ] Mobile menu works
- [ ] All 50+ tools are accessible
- [ ] No ads on any page
- [ ] Header shows user info when logged in
- [ ] Header shows Sign In/Sign Up when logged out

---

## 📞 Support

If you encounter issues:
1. Check Docker logs: `docker compose logs backend -f`
2. Check frontend console: Browser DevTools → Console tab
3. Verify all containers are running: `docker compose ps`
4. Restart all services: `docker compose restart`

---

## 🎯 Test Scenarios

### Scenario 1: New User Onboarding
1. New user visits site
2. Sees clean homepage with tools
3. Clicks Sign Up
4. Creates account
5. Lands on dashboard
6. Creates first API key
7. Tests API key with a tool
8. Sees usage stats update
9. Explores other tools
10. Becomes a paying customer (future)

### Scenario 2: API Integration
1. Developer needs JSON formatter
2. Creates account
3. Generates API key
4. Integrates into CI/CD pipeline
5. Reaches daily limit (10 calls)
6. Upgrades to Pro for 1000 calls/day
7. Continues using service
8. Refers colleagues

### Scenario 3: Dashboard Monitoring
1. User logs in daily
2. Checks usage dashboard
3. Monitors quota consumption
4. Reviews recent API calls
5. Manages multiple API keys
6. Deletes old keys
7. Creates new keys for projects

---

## 🚀 Production Deployment Checklist

Before going live:

- [ ] Set up proper domain (not localhost)
- [ ] Configure SSL/TLS certificates
- [ ] Update CORS settings for production domain
- [ ] Set secure SECRET_KEY in Django
- [ ] Enable DEBUG=False in production
- [ ] Set up proper email service (SendGrid/AWS SES)
- [ ] Configure Stripe for payments
- [ ] Set up monitoring (Sentry, DataDog)
- [ ] Create backup strategy for database
- [ ] Set up CI/CD pipeline
- [ ] Load test the API endpoints
- [ ] Security audit
- [ ] Privacy policy and terms of service
- [ ] Google Analytics or similar
- [ ] Customer support system

---

**Happy Testing! 🎉**
